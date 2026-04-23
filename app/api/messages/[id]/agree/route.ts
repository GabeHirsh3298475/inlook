import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requestOrigin } from "@/lib/request-origin";
import {
  sendCreatorAgreementEmail,
  sendBrandAgreementEmail,
} from "@/lib/email";

type Body = { format?: "long" | "short" };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.publicMetadata?.role;
  if (role !== "brand" && role !== "creator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: conversationId } = await params;
  const { format } = (await req.json()) as Body;
  if (format !== "long" && format !== "short")
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      "id, brand_id, creator_id, brand_agreed_long, brand_agreed_short, creator_agreed_long, creator_agreed_short"
    )
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

  const column =
    role === "brand"
      ? format === "long"
        ? "brand_agreed_long"
        : "brand_agreed_short"
      : format === "long"
      ? "creator_agreed_long"
      : "creator_agreed_short";
  const timestampColumn = `${column}_at`;

  if (conv[column as keyof typeof conv] === true) {
    return NextResponse.json({ ok: true, alreadyAgreed: true });
  }

  const { error: updateError } = await supabase
    .from("conversations")
    .update({
      [column]: true,
      [timestampColumn]: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (updateError)
    return NextResponse.json(
      { error: updateError.message ?? "Failed to update" },
      { status: 500 }
    );

  try {
    const baseUrl = requestOrigin(req);
    const messagesUrl = `${baseUrl}/messages?thread=${conversationId}`;

    const [{ data: brandRow }, { data: creatorRow }] = await Promise.all([
      supabase
        .from("brands")
        .select("email, business_name")
        .eq("id", conv.brand_id)
        .single(),
      supabase
        .from("creators")
        .select("email, full_name, display_name")
        .eq("id", conv.creator_id)
        .single(),
    ]);

    const brandName = (brandRow?.business_name as string | null) ?? "Brand";
    const creatorName =
      (creatorRow?.display_name as string | null) ??
      (creatorRow?.full_name as string | null) ??
      "Creator";

    if (role === "brand" && creatorRow?.email) {
      await sendCreatorAgreementEmail(
        creatorRow.email as string,
        creatorName,
        brandName,
        format,
        messagesUrl
      );
    } else if (role === "creator" && brandRow?.email) {
      await sendBrandAgreementEmail(
        brandRow.email as string,
        brandName,
        creatorName,
        format,
        messagesUrl
      );
    }
  } catch (err) {
    console.error("[messages/agree] notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
