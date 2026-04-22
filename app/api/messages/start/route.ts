import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.publicMetadata?.role !== "brand")
    return NextResponse.json(
      { error: "Only brands can start conversations" },
      { status: 403 }
    );

  const { creatorId } = (await req.json()) as { creatorId?: string };
  if (!creatorId)
    return NextResponse.json(
      { error: "Missing creatorId" },
      { status: 400 }
    );

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single();
  if (!brand)
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("id", creatorId)
    .eq("approved", true)
    .eq("published", true)
    .eq("admin_hidden", false)
    .single();
  if (!creator)
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("brand_id", brand.id)
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ conversationId: existing.id });
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ brand_id: brand.id, creator_id: creatorId })
    .select("id")
    .single();

  if (error || !created)
    return NextResponse.json(
      { error: error?.message ?? "Failed to create conversation" },
      { status: 500 }
    );

  return NextResponse.json({ conversationId: created.id });
}
