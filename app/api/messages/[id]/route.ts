import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.publicMetadata?.role;
  if (role !== "brand" && role !== "creator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: conversationId } = await params;

  const { data: conv } = await supabase
    .from("conversations")
    .select(
      "id, brand_id, creator_id, brand_agreed_long, brand_agreed_long_at, brand_agreed_short, brand_agreed_short_at, creator_agreed_long, creator_agreed_long_at, creator_agreed_short, creator_agreed_short_at"
    )
    .eq("id", conversationId)
    .single();
  if (!conv)
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );

  let counterpartyName = "";
  let counterpartyImageUrl: string | null = null;
  let counterpartyId = "";
  let counterpartyKind: "brand" | "creator" = "brand";
  let authorized = false;

  if (role === "brand") {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single();
    if (brand?.id === conv.brand_id) authorized = true;
    const { data: creator } = await supabase
      .from("creators")
      .select("id, full_name, display_name, profile_picture_url")
      .eq("id", conv.creator_id)
      .single();
    counterpartyName =
      (creator?.display_name as string | null) ??
      (creator?.full_name as string) ??
      "Creator";
    counterpartyImageUrl = (creator?.profile_picture_url as string | null) ?? null;
    counterpartyId = (creator?.id as string) ?? conv.creator_id;
    counterpartyKind = "creator";
  } else {
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single();
    if (creator?.id === conv.creator_id) authorized = true;
    const { data: brand } = await supabase
      .from("brands")
      .select("id, business_name")
      .eq("id", conv.brand_id)
      .single();
    counterpartyName = (brand?.business_name as string) ?? "Brand";
    counterpartyId = (brand?.id as string) ?? conv.brand_id;
    counterpartyKind = "brand";
  }

  if (!authorized)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    counterpartyName,
    counterpartyImageUrl,
    counterpartyId,
    counterpartyKind,
    messages: messages ?? [],
    agreements: {
      brandLong: conv.brand_agreed_long === true,
      brandShort: conv.brand_agreed_short === true,
      creatorLong: conv.creator_agreed_long === true,
      creatorShort: conv.creator_agreed_short === true,
    },
  });
}
