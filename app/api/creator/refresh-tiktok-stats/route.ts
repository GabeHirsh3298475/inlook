import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkLimit, refreshStatsUserLimiter } from "@/lib/rate-limit";
import {
  fetchUserInfo,
  fetchVideoAggregate,
  refreshAccessToken,
} from "@/lib/tiktok";

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkLimit(
    refreshStatsUserLimiter,
    `refresh-tiktok:${userId}`
  );
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many refreshes. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const { data: row } = await supabase
    .from("creators")
    .select("id, tiktok_refresh_token")
    .eq("clerk_user_id", userId)
    .single();

  const creator = row as {
    id: string;
    tiktok_refresh_token: string | null;
  } | null;

  if (!creator?.tiktok_refresh_token) {
    return NextResponse.json(
      { error: "No TikTok refresh token on file. Reconnect from /apply." },
      { status: 400 }
    );
  }

  const tokenRes = await refreshAccessToken(creator.tiktok_refresh_token);
  if (!tokenRes.access_token) {
    console.error("[refresh-tiktok] token refresh failed", tokenRes);
    return NextResponse.json(
      { error: "Failed to refresh TikTok access token" },
      { status: 502 }
    );
  }

  const info = await fetchUserInfo(tokenRes.access_token);
  if (!info) {
    return NextResponse.json(
      { error: "Failed to fetch TikTok user info" },
      { status: 502 }
    );
  }

  const agg = await fetchVideoAggregate(tokenRes.access_token);

  const { error } = await supabase
    .from("creators")
    .update({
      tiktok_access_token: tokenRes.access_token,
      tiktok_refresh_token:
        tokenRes.refresh_token ?? creator.tiktok_refresh_token,
      tiktok_open_id: info.openId,
      tiktok_display_name: info.displayName,
      tiktok_avatar_url: info.avatarUrl,
      tiktok_follower_count: info.followerCount,
      tiktok_likes_count: info.likesCount,
      tiktok_video_count: info.videoCount,
      tiktok_total_views: agg.totalViews,
      tiktok_total_comments: agg.totalComments,
      tiktok_total_shares: agg.totalShares,
      tiktok_likes_30d: agg.likes30d,
      tiktok_comments_30d: agg.comments30d,
      tiktok_shares_30d: agg.shares30d,
      tiktok_views_30d: agg.views30d,
      tiktok_avg_engagement_rate: agg.avgEngagementRate,
      tiktok_engagement_rate_30d: agg.engagementRate30d,
      tiktok_stats_last_updated: new Date().toISOString(),
    })
    .eq("id", creator.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
