import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Body = {
  conversationId?: string;
  format?: "long" | "short";
};

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.publicMetadata?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { conversationId, format } = (await req.json()) as Body;
  if (!conversationId)
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  if (format !== "long" && format !== "short")
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  const { data: conv, error: readErr } = await supabase
    .from("conversations")
    .select(
      `brand_id, creator_id, payment_link_sent_${format}, payment_link_sent_${format}_at, paid_${format}, brand_agreed_${format}_at, creator_agreed_${format}_at`
    )
    .eq("id", conversationId)
    .single();
  if (readErr || !conv)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const convRow = conv as Record<string, unknown>;
  const alreadySent = convRow[`payment_link_sent_${format}`];
  const alreadyPaid = convRow[`paid_${format}`];
  if (!alreadySent)
    return NextResponse.json(
      { error: "Payment link must be sent first" },
      { status: 400 }
    );
  if (alreadyPaid) return NextResponse.json({ ok: true, alreadySet: true });

  const paidAt = new Date().toISOString();
  const { error } = await supabase
    .from("conversations")
    .update({
      [`paid_${format}`]: true,
      [`paid_${format}_at`]: paidAt,
    })
    .eq("id", conversationId);
  if (error)
    return NextResponse.json(
      { error: error.message ?? "Failed" },
      { status: 500 }
    );

  const brandId = convRow.brand_id as string | undefined;
  const creatorId = convRow.creator_id as string | undefined;

  // Snapshot the deal into the historical ledger.
  if (brandId && creatorId) {
    const [{ data: creatorRow }, { data: brandRow }] = await Promise.all([
      supabase
        .from("creators")
        .select(
          "display_name, full_name, youtube_channel_id, subscriber_count, avg_view_rate, avg_engagement_rate, price_long_video, price_short_video, deals_completed"
        )
        .eq("id", creatorId)
        .single(),
      supabase
        .from("brands")
        .select("business_name")
        .eq("id", brandId)
        .single(),
    ]);

    const price =
      format === "long"
        ? (creatorRow?.price_long_video as number | null) ?? 0
        : (creatorRow?.price_short_video as number | null) ?? 0;
    const platformFee = Math.round(price * 0.15 * 100) / 100;
    const creatorPayout = Math.round(price * 0.85 * 100) / 100;

    await supabase.from("deals").insert({
      conversation_id: conversationId,
      brand_id: brandId,
      creator_id: creatorId,
      format,
      brand_name: brandRow?.business_name ?? "",
      creator_name:
        (creatorRow?.display_name as string | null) ??
        (creatorRow?.full_name as string | null) ??
        "",
      creator_youtube_channel_id:
        (creatorRow?.youtube_channel_id as string | null) ?? null,
      price,
      platform_fee: platformFee,
      creator_payout: creatorPayout,
      creator_subscribers_at_deal:
        (creatorRow?.subscriber_count as number | null) ?? null,
      creator_avg_view_rate:
        (creatorRow?.avg_view_rate as number | null) ?? null,
      creator_avg_engagement_rate:
        (creatorRow?.avg_engagement_rate as number | null) ?? null,
      offered_at: convRow[`brand_agreed_${format}_at`] ?? null,
      agreed_at: convRow[`creator_agreed_${format}_at`] ?? null,
      payment_link_sent_at: convRow[`payment_link_sent_${format}_at`] ?? null,
      paid_at: paidAt,
    });

    const current = (creatorRow?.deals_completed as number | null) ?? 0;
    await supabase
      .from("creators")
      .update({ deals_completed: current + 1 })
      .eq("id", creatorId);
  }

  return NextResponse.json({ ok: true });
}
