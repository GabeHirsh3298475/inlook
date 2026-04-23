import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { checkLimit, updateProfileUserLimiter } from "@/lib/rate-limit";

type PrimaryPlatform = "youtube" | "tiktok" | "both";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkLimit(
    updateProfileUserLimiter,
    `update-profile:${userId}`
  );
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many updates. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 30) } }
    );

  const {
    bio,
    priceLongVideo,
    priceShortVideo,
    postPublicly,
    showDealStats,
    primaryPlatform,
  } = (await req.json()) as {
    bio: string;
    priceLongVideo?: number;
    priceShortVideo?: number;
    postPublicly?: boolean;
    showDealStats?: boolean;
    primaryPlatform?: PrimaryPlatform;
  };

  if (
    primaryPlatform !== undefined &&
    primaryPlatform !== "youtube" &&
    primaryPlatform !== "tiktok" &&
    primaryPlatform !== "both"
  ) {
    return NextResponse.json(
      { error: "Invalid primary_platform" },
      { status: 400 }
    );
  }

  if (primaryPlatform) {
    const { data: row } = await supabase
      .from("creators")
      .select("youtube_channel_id, tiktok_open_id")
      .eq("clerk_user_id", userId)
      .single();
    const hasYt = !!(row as { youtube_channel_id: string | null } | null)
      ?.youtube_channel_id;
    const hasTt = !!(row as { tiktok_open_id: string | null } | null)
      ?.tiktok_open_id;
    const allowed = new Set<PrimaryPlatform>();
    if (hasYt) allowed.add("youtube");
    if (hasTt) allowed.add("tiktok");
    if (hasYt && hasTt) allowed.add("both");
    if (!allowed.has(primaryPlatform)) {
      return NextResponse.json(
        { error: "Primary platform does not match connected accounts" },
        { status: 400 }
      );
    }
  }

  const update: Record<string, unknown> = {
    bio,
    price_long_video: priceLongVideo ?? null,
    price_short_video: priceShortVideo ?? null,
    post_publicly: postPublicly ?? false,
  };
  if (showDealStats !== undefined) update.show_deal_stats = showDealStats;
  if (primaryPlatform !== undefined) update.primary_platform = primaryPlatform;

  const { error } = await supabase
    .from("creators")
    .update(update)
    .eq("clerk_user_id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
