import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requestOrigin } from "@/lib/request-origin";
import {
  sendCreatorNewMessageEmail,
  sendBrandMessageReplyEmail,
} from "@/lib/email";
import {
  checkLimit,
  getIp,
  messagesSendIpLimiter,
  messagesSendUserLimiter,
} from "@/lib/rate-limit";

const MAX_BODY = 2000;

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.publicMetadata?.role;
  if (role !== "brand" && role !== "creator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [userRl, ipRl] = await Promise.all([
    checkLimit(messagesSendUserLimiter, `msg-send-user:${user.id}`),
    checkLimit(messagesSendIpLimiter, `msg-send-ip:${getIp(req)}`),
  ]);
  if (!userRl.ok || !ipRl.ok) {
    const retryAfter = Math.max(userRl.retryAfter ?? 0, ipRl.retryAfter ?? 0);
    return NextResponse.json(
      { error: "Slow down — too many messages." },
      { status: 429, headers: { "Retry-After": String(retryAfter || 30) } }
    );
  }

  const { conversationId, body } = (await req.json()) as {
    conversationId?: string;
    body?: string;
  };

  if (!conversationId)
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );

  if (typeof body !== "string" || body.trim().length === 0)
    return NextResponse.json({ error: "Empty message" }, { status: 400 });

  if (body.length > MAX_BODY)
    return NextResponse.json(
      { error: `Message too long (max ${MAX_BODY} chars)` },
      { status: 400 }
    );

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, brand_id, creator_id")
    .eq("id", conversationId)
    .single();
  if (!conv)
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );

  let authorized = false;
  if (role === "brand") {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single();
    if (brand?.id === conv.brand_id) authorized = true;
  } else {
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single();
    if (creator?.id === conv.creator_id) authorized = true;
  }
  if (!authorized)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const trimmed = body.trim();
  const { data: msg, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_role: role,
      body: trimmed,
    })
    .select("*")
    .single();

  if (error || !msg)
    return NextResponse.json(
      { error: error?.message ?? "Failed to send" },
      { status: 500 }
    );

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: trimmed.slice(0, 200),
    })
    .eq("id", conversationId);

  try {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("sender_role", role);

    if (count === 1) {
      const baseUrl = requestOrigin(req);
      const messagesUrl = `${baseUrl}/messages?thread=${conversationId}`;

      if (role === "brand") {
        const [{ data: brandRow }, { data: creatorRow }] = await Promise.all([
          supabase
            .from("brands")
            .select("business_name")
            .eq("id", conv.brand_id)
            .single(),
          supabase
            .from("creators")
            .select("email, full_name, display_name")
            .eq("id", conv.creator_id)
            .single(),
        ]);
        if (brandRow && creatorRow?.email) {
          const creatorName =
            (creatorRow.display_name as string | null) ??
            (creatorRow.full_name as string) ??
            "there";
          const brandName =
            (brandRow.business_name as string | null) ?? "A brand";
          await sendCreatorNewMessageEmail(
            creatorRow.email as string,
            creatorName,
            brandName,
            messagesUrl
          );
        }
      } else {
        const [{ data: brandRow }, { data: creatorRow }] = await Promise.all([
          supabase
            .from("brands")
            .select("email, business_name")
            .eq("id", conv.brand_id)
            .single(),
          supabase
            .from("creators")
            .select("full_name, display_name")
            .eq("id", conv.creator_id)
            .single(),
        ]);
        if (brandRow?.email && creatorRow) {
          const creatorName =
            (creatorRow.display_name as string | null) ??
            (creatorRow.full_name as string) ??
            "A creator";
          const brandName =
            (brandRow.business_name as string | null) ?? "there";
          await sendBrandMessageReplyEmail(
            brandRow.email as string,
            brandName,
            creatorName,
            messagesUrl
          );
        }
      }
    }
  } catch (err) {
    console.error("[messages/send] notification email failed:", err);
  }

  return NextResponse.json({ message: msg });
}
