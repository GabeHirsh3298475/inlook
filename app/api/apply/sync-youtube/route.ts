import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { supabase } from "@/lib/supabase";
import { checkLimit, youtubeSyncUserLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken)
    return Response.json({ error: "No token" }, { status: 401 });

  const sessionEmail = session.user?.email?.toLowerCase();
  const rlKey = sessionEmail ?? "anon";
  const rl = await checkLimit(youtubeSyncUserLimiter, `yt-sync:${rlKey}`);
  if (!rl.ok)
    return Response.json(
      { error: "Too many YouTube syncs. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const { email } = (await req.json()) as { email: string };
  if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

  // Same guard as save-youtube-tokens: only allow syncing into rows that
  // haven't been claimed by a Clerk user yet. Post-signup syncs go through
  // /api/creator/refresh-stats which scopes by clerk_user_id.
  const { data: targetRow } = await supabase
    .from("creators")
    .select("id, clerk_user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (targetRow?.clerk_user_id) {
    return Response.json(
      { error: "This account is already linked." },
      { status: 403 }
    );
  }

  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&mine=true",
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );
  const channelData = await channelRes.json();

  if (channelData.error) {
    console.error("[sync-youtube] YouTube Data API error:", channelData.error);
    return Response.json(
      { error: "YouTube API error", details: channelData.error.message },
      { status: 502 }
    );
  }

  const channel = channelData.items?.[0];

  if (!channel)
    return Response.json({ error: "No channel found" }, { status: 404 });

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

  try {
    const lifetimeRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${channelStartDate}&endDate=${today}&metrics=views,likes,comments,shares,averageViewPercentage`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    const lifetimeData = await lifetimeRes.json();
    console.log(
      "[sync-youtube] lifetime analytics response:",
      JSON.stringify(lifetimeData).slice(0, 800)
    );
    if (lifetimeData.error) {
      console.error(
        "[sync-youtube] Lifetime analytics error:",
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

    const thirtyRes = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channel.id}&startDate=${thirtyDaysAgo}&endDate=${today}&metrics=views,likes,comments,shares,subscribersGained,subscribersLost`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    );
    const thirtyData = await thirtyRes.json();
    if (thirtyData.error) {
      console.error("[sync-youtube] 30d analytics error:", thirtyData.error);
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
      subGrowthPct =
        subCount > 0 ? ((subsGained - subsLost) / subCount) * 100 : 0;
    }
  } catch (analyticsErr) {
    console.error("[sync-youtube] Analytics fetch failed:", analyticsErr);
  }

  const { error } = await supabase
    .from("creators")
    .update({
      youtube_channel_id: channel.id,
      display_name: channel.snippet.title,
      username: channel.snippet.customUrl ?? null,
      profile_picture_url: channel.snippet.thumbnails?.medium?.url ?? channel.snippet.thumbnails?.default?.url ?? null,
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
    .eq("email", email.toLowerCase())
    .is("clerk_user_id", null);

  if (error) {
    console.error("[sync-youtube] Supabase update failed:", error.message);
  }

  return Response.json({
    success: true,
    channel: {
      displayName: channel.snippet.title,
      profilePicture: channel.snippet.thumbnails?.medium?.url ?? channel.snippet.thumbnails?.default?.url ?? null,
      subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    },
  });
}
