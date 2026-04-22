import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Vercel cron hits this with GET. Protected by CRON_SECRET bearer token —
// only Vercel's cron runner (which injects the secret via header) can trigger it.
// Configured in vercel.json with `schedule: "0 0 * * *"` (00:00 UTC daily).
//
// Budget note: runs once per creator with a refresh_token. Each creator = ~4
// YouTube API calls (1 Data + 2 Analytics + 1 token refresh). At 1000 creators
// that's ~4000 calls/day, well under the 10k/day YouTube Data API free quota.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: creators, error: fetchError } = await supabase
    .from("creators")
    .select("id, youtube_refresh_token")
    .eq("approved", true)
    .not("youtube_refresh_token", "is", null);

  if (fetchError) {
    console.error("[cron/refresh-all-stats] fetch failed:", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let refreshed = 0;
  let failed = 0;
  const errors: { id: string; reason: string }[] = [];

  for (const creator of creators ?? []) {
    try {
      await refreshOne(creator.id, creator.youtube_refresh_token as string);
      refreshed++;
    } catch (err) {
      failed++;
      errors.push({
        id: creator.id,
        reason: err instanceof Error ? err.message : "unknown",
      });
      console.error(`[cron/refresh-all-stats] ${creator.id} failed:`, err);
    }
  }

  return NextResponse.json({
    success: true,
    total: creators?.length ?? 0,
    refreshed,
    failed,
    errors: errors.slice(0, 20),
  });
}

async function refreshOne(creatorId: string, refreshToken: string) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) throw new Error("token refresh failed");

  const accessToken = tokenData.access_token;

  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];
  if (!channel) throw new Error("no channel");

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

  const lifetimeRes = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${channelStartDate}&endDate=${today}&metrics=views,likes,comments,shares,averageViewPercentage`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const lifetimeData = await lifetimeRes.json();
  const lRow = lifetimeData.rows?.[0];
  if (lRow) {
    const views = lRow[0] || 0;
    const likes = lRow[1] || 0;
    const comments = lRow[2] || 0;
    const shares = lRow[3] || 0;
    avgViewRate = lRow[4] || 0;
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
    subGrowthPct =
      subCount > 0 ? ((subsGained - subsLost) / subCount) * 100 : 0;
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
      stats_last_updated: new Date().toISOString(),
    })
    .eq("id", creatorId);

  if (error) throw new Error(error.message);
}
