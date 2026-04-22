import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { checkLimit, refreshStatsUserLimiter } from "@/lib/rate-limit";

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkLimit(refreshStatsUserLimiter, `refresh-stats:${userId}`);
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many refreshes. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const { data: row } = await supabase
    .from("creators")
    .select("id, email, youtube_refresh_token")
    .eq("clerk_user_id", userId)
    .single();

  const creator = row as {
    id: string;
    email: string;
    youtube_refresh_token: string | null;
  } | null;

  if (!creator?.youtube_refresh_token) {
    return NextResponse.json(
      { error: "No YouTube refresh token on file. Reconnect from /apply." },
      { status: 400 }
    );
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: creator.youtube_refresh_token,
      grant_type: "refresh_token",
    }),
  });
  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    console.error("[refresh-stats] Token refresh failed:", tokenData);
    return NextResponse.json(
      {
        error: "Failed to refresh YouTube access token",
        details: tokenData.error_description ?? tokenData.error ?? null,
      },
      { status: 502 }
    );
  }

  const accessToken = tokenData.access_token;

  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];
  if (!channel) {
    return NextResponse.json(
      { error: "No YouTube channel found for this account" },
      { status: 404 }
    );
  }

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
    // Lifetime window for engagement + view rate
    const lifetimeRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${channelStartDate}&endDate=${today}&metrics=views,likes,comments,shares,averageViewPercentage`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const lifetimeData = await lifetimeRes.json();
    console.log(
      "[refresh-stats] lifetime analytics response:",
      JSON.stringify(lifetimeData).slice(0, 800)
    );
    if (lifetimeData.error) {
      console.error(
        "[refresh-stats] Lifetime analytics error:",
        lifetimeData.error
      );
    }
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

    // 30-day window for subscriber growth + 30d engagement rate
    const thirtyRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${thirtyDaysAgo}&endDate=${today}&metrics=views,likes,comments,shares,subscribersGained,subscribersLost`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const thirtyData = await thirtyRes.json();
    if (thirtyData.error) {
      console.error("[refresh-stats] 30d analytics error:", thirtyData.error);
    }
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
    console.error("[refresh-stats] Analytics fetch failed:", err);
  }

  const { error } = await supabase
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
    .eq("id", creator.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    stats: {
      avgViewRate,
      engagementRate,
      subGrowthPct,
      subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
      totalVideos: parseInt(channel.statistics.videoCount) || 0,
    },
  });
}
