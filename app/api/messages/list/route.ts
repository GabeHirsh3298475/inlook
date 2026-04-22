import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase, type ConversationPreview } from "@/lib/supabase";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.publicMetadata?.role;
  if (role !== "brand" && role !== "creator")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (role === "brand") {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single();
    if (!brand) return NextResponse.json({ conversations: [] });

    const { data: convs } = await supabase
      .from("conversations")
      .select("id, creator_id, last_message_at, last_message_preview")
      .eq("brand_id", brand.id)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (!convs || convs.length === 0)
      return NextResponse.json({ conversations: [] });

    const creatorIds = convs.map((c) => c.creator_id);
    const { data: creators } = await supabase
      .from("creators")
      .select("id, full_name, display_name, profile_picture_url")
      .in("id", creatorIds);

    const creatorMap = new Map(
      (creators ?? []).map((c) => [
        c.id,
        {
          name: c.display_name ?? c.full_name,
          imageUrl: c.profile_picture_url as string | null,
        },
      ])
    );

    const previews: ConversationPreview[] = convs.map((c) => {
      const info = creatorMap.get(c.creator_id);
      return {
        conversationId: c.id,
        counterpartyName: info?.name ?? "Creator",
        counterpartyImageUrl: info?.imageUrl ?? null,
        lastMessage: c.last_message_preview ?? null,
        lastMessageAt: c.last_message_at ?? null,
      };
    });
    return NextResponse.json({ conversations: previews });
  }

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single();
  if (!creator) return NextResponse.json({ conversations: [] });

  const { data: convs } = await supabase
    .from("conversations")
    .select("id, brand_id, last_message_at, last_message_preview")
    .eq("creator_id", creator.id)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (!convs || convs.length === 0)
    return NextResponse.json({ conversations: [] });

  const brandIds = convs.map((c) => c.brand_id);
  const { data: brands } = await supabase
    .from("brands")
    .select("id, business_name")
    .in("id", brandIds);

  const brandMap = new Map(
    (brands ?? []).map((b) => [b.id, { name: b.business_name }])
  );

  const previews: ConversationPreview[] = convs.map((c) => {
    const info = brandMap.get(c.brand_id);
    return {
      conversationId: c.id,
      counterpartyName: info?.name ?? "Brand",
      counterpartyImageUrl: null,
      lastMessage: c.last_message_preview ?? null,
      lastMessageAt: c.last_message_at ?? null,
    };
  });
  return NextResponse.json({ conversations: previews });
}
