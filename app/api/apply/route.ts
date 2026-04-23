import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { supabase } from "@/lib/supabase";
import {
  sendApplicationConfirmation,
  sendAdminNotification,
} from "@/lib/email";
import { checkLimit, getIp, applyIpLimiter } from "@/lib/rate-limit";
import {
  TIKTOK_COOKIE,
  verifyCookie,
  fetchVideoAggregate,
} from "@/lib/tiktok";

export async function POST(req: Request) {
  const rl = await checkLimit(applyIpLimiter, `apply:${getIp(req)}`);
  if (!rl.ok)
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const session = await getServerSession(authOptions);
  const body = await req.json();

  const { name, email, niche, youtube } = body as {
    name: string;
    email: string;
    niche?: string;
    youtube?: { name: string | null; email: string | null };
  };

  const cookieStore = cookies();
  const tiktokSession = verifyCookie(
    cookieStore.get(TIKTOK_COOKIE)?.value
  );

  const hasYouTube = !!session?.accessToken;
  const hasTikTok = !!tiktokSession;

  if (!hasYouTube && !hasTikTok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Connect YouTube or TikTok before submitting.",
      },
      { status: 400 }
    );
  }

  const primaryPlatform =
    hasYouTube && hasTikTok ? "both" : hasYouTube ? "youtube" : "tiktok";

  const { error: dbError } = await supabase
    .from("creators")
    .insert({
      full_name: name,
      email,
      primary_platform: primaryPlatform,
      niche: niche ?? null,
      bio: "",
      approved: false,
      published: false,
      deals_completed: 0,
      connected_at: new Date().toISOString(),
      display_name: youtube?.name ?? tiktokSession?.displayName ?? null,
      youtube_access_token: session?.accessToken ?? null,
      youtube_refresh_token: session?.refreshToken ?? null,
      tiktok_open_id: tiktokSession?.openId ?? null,
      tiktok_display_name: tiktokSession?.displayName ?? null,
      tiktok_avatar_url: tiktokSession?.avatarUrl ?? null,
      tiktok_access_token: tiktokSession?.accessToken ?? null,
      tiktok_refresh_token: tiktokSession?.refreshToken ?? null,
      tiktok_follower_count: tiktokSession?.followerCount ?? null,
      tiktok_likes_count: tiktokSession?.likesCount ?? null,
      tiktok_video_count: tiktokSession?.videoCount ?? null,
    });

  if (dbError) {
    console.error("[apply] Supabase insert failed:", dbError.message);
    return NextResponse.json(
      { ok: false, error: `Database error: ${dbError.message}` },
      { status: 500 }
    );
  }

  if (hasYouTube) {
    try {
      await syncYouTubeAtApply(email, session!.accessToken!);
    } catch (err) {
      console.error("[apply] YouTube sync failed:", err);
    }
  }

  if (hasTikTok) {
    try {
      const agg = await fetchVideoAggregate(tiktokSession!.accessToken);
      await supabase
        .from("creators")
        .update({
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
        .eq("email", email);
    } catch (err) {
      console.error("[apply] TikTok aggregate sync failed:", err);
    }
  }

  try {
    await sendApplicationConfirmation(email, name);
  } catch (err) {
    console.error("[apply] Confirmation email failed:", err);
  }

  try {
    await sendAdminNotification(
      name,
      email,
      primaryPlatform,
      hasYouTube
        ? youtube?.name
          ? `YouTube: ${youtube.name}`
          : "YouTube connected"
        : "TikTok connected",
      niche ?? "",
      "",
      youtube?.name ?? null,
      youtube?.email ?? null
    );
  } catch (err) {
    console.error("[apply] Admin notification email failed:", err);
  }

  const res = NextResponse.json({ ok: true });
  if (hasTikTok) res.cookies.delete(TIKTOK_COOKIE);
  return res;
}

async function syncYouTubeAtApply(email: string, accessToken: string) {
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];
  if (!channel) return;

  const channelStartDate = channel.snippet?.publishedAt
    ? channel.snippet.publishedAt.split("T")[0]
    : "2005-07-15";
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  let avgViewRate = 0;
  let engagementRate = 0;
  let engagementRate30d = 0;
  let subGrowthPct = 0;
  let subGrowthCount = 0;

  try {
    const lifetimeRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${channelStartDate}&endDate=${today}&metrics=views,likes,comments,shares,averageViewPercentage`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const lifetimeData = await lifetimeRes.json();
    const row = lifetimeData.rows?.[0];
    if (row) {
      const views = row[0] || 0;
      const likes = row[1] || 0;
      const comments = row[2] || 0;
      const shares = row[3] || 0;
      avgViewRate = row[4] || 0;
      engagementRate =
        views > 0 ? ((likes + comments + shares) / views) * 100 : 0;
    }

    const thirtyRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${thirtyDaysAgo}&endDate=${today}&metrics=views,likes,comments,shares,subscribersGained,subscribersLost`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const thirtyData = await thirtyRes.json();
    const tRow = thirtyData.rows?.[0];
    if (tRow) {
      const tViews = tRow[0] || 0;
      const tLikes = tRow[1] || 0;
      const tComments = tRow[2] || 0;
      const tShares = tRow[3] || 0;
      const subsGained = tRow[4] || 0;
      const subsLost = tRow[5] || 0;
      engagementRate30d =
        tViews > 0 ? ((tLikes + tComments + tShares) / tViews) * 100 : 0;
      const subCount = parseInt(channel.statistics.subscriberCount) || 0;
      subGrowthCount = subsGained - subsLost;
      subGrowthPct =
        subCount > 0 ? ((subsGained - subsLost) / subCount) * 100 : 0;
    }
  } catch (err) {
    console.error("[apply] YouTube Analytics fetch failed:", err);
  }

  await supabase
    .from("creators")
    .update({
      youtube_channel_id: channel.id,
      display_name: channel.snippet.title,
      username: channel.snippet.customUrl ?? null,
      profile_picture_url:
        channel.snippet.thumbnails?.medium?.url ??
        channel.snippet.thumbnails?.default?.url ??
        null,
      channel_bio: channel.snippet.description ?? null,
      subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
      total_channel_views: parseInt(channel.statistics.viewCount) || 0,
      total_videos: parseInt(channel.statistics.videoCount) || 0,
      avg_view_rate: avgViewRate,
      avg_engagement_rate: engagementRate,
      engagement_rate_30d: engagementRate30d,
      subscriber_growth_30d: subGrowthPct,
      subscriber_growth_30d_count: subGrowthCount,
      stats_last_updated: new Date().toISOString(),
    })
    .eq("email", email);
}
