import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { supabase } from "@/lib/supabase";
import {
  sendApplicationConfirmation,
  sendAdminNotification,
} from "@/lib/email";
import { checkLimit, getIp, applyIpLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = await checkLimit(applyIpLimiter, `apply:${getIp(req)}`);
  if (!rl.ok)
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const session = await getServerSession(authOptions);
  const body = await req.json();

  const { name, email, platform, url, niche, followers, youtube } =
    body as {
      name: string;
      email: string;
      platform: string;
      url: string;
      niche: string;
      followers: string;
      youtube?: { name: string | null; email: string | null };
    };

  const hasYouTube = !!session?.accessToken;

  const { data: dbData, error: dbError } = await supabase
    .from("creators")
    .insert({
      full_name: name,
      email,
      primary_platform: platform,
      channel_url: url,
      niche,
      follower_count_range: followers,
      bio: "",
      approved: false,
      published: false,
      deals_completed: 0,
      connected_at: hasYouTube ? new Date().toISOString() : null,
      display_name: youtube?.name ?? null,
      youtube_access_token: session?.accessToken ?? null,
      youtube_refresh_token: session?.refreshToken ?? null,
    })
    .select();

  if (dbError) {
    console.error("[apply] Supabase insert failed:", dbError.message);
    return NextResponse.json(
      { ok: false, error: `Database error: ${dbError.message}` },
      { status: 500 }
    );
  }

  if (hasYouTube) {
    try {
      const channelRes = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&mine=true",
        { headers: { Authorization: `Bearer ${session.accessToken}` } }
      );
      const channelData = await channelRes.json();
      const channel = channelData.items?.[0];

      if (channel) {
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
            "[apply] lifetime analytics response:",
            JSON.stringify(lifetimeData).slice(0, 800)
          );
          if (lifetimeData.error) {
            console.error(
              "[apply] Lifetime analytics error:",
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
            console.error("[apply] 30d analytics error:", thirtyData.error);
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
              tViews > 0
                ? ((tLikes + tComments + tShares) / tViews) * 100
                : 0;
            const subCount =
              parseInt(channel.statistics.subscriberCount) || 0;
            subGrowthPct =
              subCount > 0
                ? ((subsGained - subsLost) / subCount) * 100
                : 0;
          }
        } catch (analyticsErr) {
          console.error("[apply] YouTube Analytics fetch failed:", analyticsErr);
        }

        await supabase
          .from("creators")
          .update({
            youtube_channel_id: channel.id,
            display_name: channel.snippet.title,
            username: channel.snippet.customUrl ?? null,
            profile_picture_url:
              channel.snippet.thumbnails?.medium?.url ?? channel.snippet.thumbnails?.default?.url ?? null,
            channel_bio: channel.snippet.description ?? null,
            subscriber_count:
              parseInt(channel.statistics.subscriberCount) || 0,
            total_channel_views:
              parseInt(channel.statistics.viewCount) || 0,
            total_videos: parseInt(channel.statistics.videoCount) || 0,
            avg_view_rate: avgViewRate,
            avg_engagement_rate: engagementRate,
            engagement_rate_30d: engagementRate30d,
            subscriber_growth_30d: subGrowthPct,
            stats_last_updated: new Date().toISOString(),
          })
          .eq("email", email);
      }
    } catch (ytErr) {
      console.error("[apply] YouTube sync failed:", ytErr);
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
      platform,
      url,
      niche,
      followers,
      youtube?.name ?? null,
      youtube?.email ?? null
    );
  } catch (err) {
    console.error("[apply] Admin notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
