import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { checkLimit, updateProfileUserLimiter } from "@/lib/rate-limit";

function isValidSocialUrl(
  url: string | undefined | null,
  platform: "tiktok" | "instagram"
): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  switch (platform) {
    case "tiktok":
      return lower.includes("tiktok.com");
    case "instagram":
      return lower.includes("instagram.com");
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkLimit(updateProfileUserLimiter, `update-profile:${userId}`);
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many updates. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 30) } }
    );

  const {
    bio,
    tiktokUrl,
    tiktokFollowerCount,
    instagramUrl,
    instagramFollowerCount,
    priceLongVideo,
    priceShortVideo,
    postPublicly,
    showDealStats,
  } = (await req.json()) as {
    bio: string;
    tiktokUrl?: string;
    tiktokFollowerCount?: number | null;
    instagramUrl?: string;
    instagramFollowerCount?: number | null;
    priceLongVideo?: number;
    priceShortVideo?: number;
    postPublicly?: boolean;
    showDealStats?: boolean;
  };

  if (!isValidSocialUrl(tiktokUrl, "tiktok"))
    return NextResponse.json(
      { error: "TikTok URL must be a tiktok.com link" },
      { status: 400 }
    );
  if (!isValidSocialUrl(instagramUrl, "instagram"))
    return NextResponse.json(
      { error: "Instagram URL must be an instagram.com link" },
      { status: 400 }
    );

  const update: Record<string, unknown> = {
    bio,
    tiktok_url: tiktokUrl ?? null,
    tiktok_follower_count: tiktokUrl ? tiktokFollowerCount ?? null : null,
    instagram_url: instagramUrl ?? null,
    instagram_follower_count: instagramUrl
      ? instagramFollowerCount ?? null
      : null,
    price_long_video: priceLongVideo ?? null,
    price_short_video: priceShortVideo ?? null,
    post_publicly: postPublicly ?? false,
  };
  if (showDealStats !== undefined) update.show_deal_stats = showDealStats;

  const { error } = await supabase
    .from("creators")
    .update(update)
    .eq("clerk_user_id", userId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
