import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { supabase, type CreatorRow } from "@/lib/supabase";
import { formatFollowers } from "@/lib/utils";
import {
  AnalyticsBlock,
  PriceBlock,
  TikTokAnalyticsBlock,
} from "@/components/creator-card";
import { MessageButton } from "@/components/message-button";
import { PlatformIcon } from "@/components/platform-icon";
import { VerifiedBadge } from "@/components/verified-badge";
import { LocalDateTime } from "@/components/local-datetime";
import { Clock, Handshake } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("creators")
    .select("display_name, full_name")
    .eq("id", id)
    .single();
  const name =
    (data as { display_name: string | null; full_name: string } | null)
      ?.display_name ??
    (data as { full_name: string } | null)?.full_name ??
    "Creator";
  return { title: `${name} · Inlook` };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const isBrand = role === "brand" || role === "admin";

  const { data } = await supabase
    .from("creators")
    .select("*")
    .eq("id", id)
    .eq("approved", true)
    .eq("published", true)
    .eq("admin_hidden", false)
    .single();

  const creator = data as CreatorRow | null;
  if (!creator) notFound();

  const isSelf = !!user?.id && creator.clerk_user_id === user.id;
  const canViewAll = isBrand || isSelf;
  const pricesHidden = !canViewAll && creator.post_publicly === true;
  const name = creator.display_name ?? creator.full_name;

  const totalFollowers =
    (creator.subscriber_count ?? 0) +
    (creator.tiktok_follower_count ?? 0) +
    (creator.instagram_follower_count ?? 0);

  const platforms: {
    platform: "YouTube" | "TikTok" | "Instagram";
    url: string;
    count: number;
  }[] = [];
  if (creator.instagram_url)
    platforms.push({
      platform: "Instagram",
      url: creator.instagram_url,
      count: creator.instagram_follower_count ?? 0,
    });
  if (creator.tiktok_url)
    platforms.push({
      platform: "TikTok",
      url: creator.tiktok_url,
      count: creator.tiktok_follower_count ?? 0,
    });
  if (creator.channel_url)
    platforms.push({
      platform: "YouTube",
      url: creator.channel_url,
      count: creator.subscriber_count ?? 0,
    });

  const daysOnInlook = creator.connected_at
    ? Math.floor(
        (Date.now() - new Date(creator.connected_at).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : null;

  const showDealStats = creator.show_deal_stats ?? true;
  const dealStatsVisible = isSelf || showDealStats;

  const hasYouTube = !!creator.youtube_channel_id;
  const hasTikTok = !!creator.tiktok_open_id;
  const ppRaw = creator.primary_platform?.toLowerCase();
  const primaryPlatform: "youtube" | "tiktok" | "both" =
    ppRaw === "youtube" || ppRaw === "tiktok" || ppRaw === "both"
      ? ppRaw
      : hasYouTube && hasTikTok
      ? "both"
      : hasTikTok
      ? "tiktok"
      : "youtube";

  const tiktokTotalViews = creator.tiktok_total_views ?? 0;
  const tiktokLikes = creator.tiktok_likes_count ?? 0;
  const tiktokAvgLikesPerView =
    tiktokTotalViews > 0 ? (tiktokLikes / tiktokTotalViews) * 100 : null;

  // Primary first, then the other if connected.
  const sections: Array<"youtube" | "tiktok"> = [];
  if (primaryPlatform === "tiktok") {
    if (hasTikTok) sections.push("tiktok");
    if (hasYouTube) sections.push("youtube");
  } else {
    if (hasYouTube) sections.push("youtube");
    if (hasTikTok) sections.push("tiktok");
  }

  return (
    <section className="relative">
      <div className="container-x py-12 sm:py-16">
        <Link
          href="/network"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400 transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          Back to network
        </Link>

        <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Basic Information */}
          <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
            <p className="eyebrow">Basic Information</p>
            <div className="mt-5 flex items-center gap-4">
              <Avatar
                imageUrl={
                  primaryPlatform === "tiktok"
                    ? creator.tiktok_avatar_url ?? creator.profile_picture_url
                    : creator.profile_picture_url ?? creator.tiktok_avatar_url
                }
                name={name}
              />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50">
                  {name}
                </h1>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                  {creator.niche}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="eyebrow">Total Followers</p>
              <p className="mt-1 font-display text-3xl font-medium tracking-tight text-ink-50">
                {formatFollowers(totalFollowers)}
              </p>
              {platforms.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-300">
                  {platforms.map(({ platform, url, count }) => (
                    <a
                      key={platform}
                      href={normalizeUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${name}'s ${platform} profile`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[11px] text-ink-200 transition-colors hover:border-accent/40 hover:text-accent"
                      title={platform}
                    >
                      <PlatformIcon platform={platform} className="h-4 w-4" />
                      <span>{formatFollowers(count)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
            <PriceBlock
              long={pricesHidden ? null : creator.price_long_video}
              short={pricesHidden ? null : creator.price_short_video}
              hidden={pricesHidden}
            />
            <div className="mt-6 flex justify-center">
              <MessageButton creatorId={creator.id} isSelf={isSelf} />
            </div>
          </div>

          {/* About */}
          <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card lg:col-span-2">
            <p className="eyebrow">About</p>
            {creator.bio ? (
              <p className="mt-4 whitespace-pre-line font-sans text-[15px] leading-relaxed text-ink-200">
                {creator.bio}
              </p>
            ) : (
              <p className="mt-4 font-sans text-[14px] italic text-ink-400">
                This creator hasn&apos;t added a bio yet.
              </p>
            )}
          </div>

          {/* Analytics — ordered primary-first, with the other platform below if connected */}
          {sections.map((section) =>
            section === "youtube" ? (
              <div
                key="youtube"
                className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card lg:col-span-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">YouTube Analytics</p>
                  <VerifiedBadge />
                </div>
                <div className="mt-5">
                  <AnalyticsBlock
                    canViewAll={canViewAll}
                    avgViewRate={canViewAll ? creator.avg_view_rate : null}
                    avgEngagementRate={
                      canViewAll ? creator.avg_engagement_rate : null
                    }
                  />
                </div>
                {canViewAll ? (
                  <>
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Stat
                        label="Subscribers"
                        value={
                          creator.subscriber_count != null
                            ? creator.subscriber_count.toLocaleString()
                            : "—"
                        }
                      />
                      <Stat
                        label="Total Videos"
                        value={
                          creator.total_videos != null
                            ? creator.total_videos.toLocaleString()
                            : "—"
                        }
                      />
                      <Stat
                        label="Total Views"
                        value={
                          creator.total_channel_views != null
                            ? creator.total_channel_views.toLocaleString()
                            : "—"
                        }
                      />
                      <Stat
                        label="Sub Growth (30d)"
                        value={
                          creator.subscriber_growth_30d != null
                            ? `${creator.subscriber_growth_30d >= 0 ? "+" : ""}${creator.subscriber_growth_30d.toFixed(2)}%${
                                creator.subscriber_growth_30d_count != null
                                  ? ` · ${creator.subscriber_growth_30d_count >= 0 ? "+" : ""}${creator.subscriber_growth_30d_count.toLocaleString()}`
                                  : ""
                              }`
                            : "—"
                        }
                      />
                    </div>
                    {creator.stats_last_updated && (
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                        Last synced{" "}
                        <LocalDateTime iso={creator.stats_last_updated} />
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Subscribers" value="—" blurred />
                    <Stat label="Total Videos" value="—" blurred />
                    <Stat label="Total Views" value="—" blurred />
                    <Stat label="Sub Growth (30d)" value="—" blurred />
                  </div>
                )}
              </div>
            ) : (
              <div
                key="tiktok"
                className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card lg:col-span-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">TikTok Analytics</p>
                  <VerifiedBadge />
                </div>
                <div className="mt-5">
                  <TikTokAnalyticsBlock
                    canViewAll={canViewAll}
                    avgEngagementRate={
                      canViewAll ? creator.tiktok_avg_engagement_rate : null
                    }
                    avgLikesPerView={canViewAll ? tiktokAvgLikesPerView : null}
                  />
                </div>
                {canViewAll ? (
                  <>
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Stat
                        label="Followers"
                        value={
                          creator.tiktok_follower_count != null
                            ? creator.tiktok_follower_count.toLocaleString()
                            : "—"
                        }
                      />
                      <Stat
                        label="Videos"
                        value={
                          creator.tiktok_video_count != null
                            ? creator.tiktok_video_count.toLocaleString()
                            : "—"
                        }
                      />
                      <Stat
                        label="Total Views"
                        value={
                          creator.tiktok_total_views != null
                            ? creator.tiktok_total_views.toLocaleString()
                            : "—"
                        }
                      />
                      <Stat
                        label="Total Likes"
                        value={
                          creator.tiktok_likes_count != null
                            ? creator.tiktok_likes_count.toLocaleString()
                            : "—"
                        }
                      />
                    </div>
                    {creator.tiktok_stats_last_updated && (
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                        Last synced{" "}
                        <LocalDateTime
                          iso={creator.tiktok_stats_last_updated}
                        />
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Followers" value="—" blurred />
                    <Stat label="Videos" value="—" blurred />
                    <Stat label="Total Views" value="—" blurred />
                    <Stat label="Total Likes" value="—" blurred />
                  </div>
                )}
              </div>
            )
          )}

          {/* Deal Stats */}
          {dealStatsVisible && (
            <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card lg:col-span-2">
              <p className="eyebrow">Deal Stats</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DealStatCard
                  icon={Clock}
                  label="Days on Inlook"
                  value={daysOnInlook != null ? daysOnInlook.toString() : "—"}
                />
                <DealStatCard
                  icon={Handshake}
                  label="Deals Completed"
                  value={(creator.deals_completed ?? 0).toString()}
                />
              </div>
              {isSelf && !showDealStats && (
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  Only visible to you — toggle &quot;Show deal stats&quot; in
                  your dashboard to make public.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DealStatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
      <Icon className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
      <p className="mt-3 font-display text-2xl font-medium tracking-tight text-ink-50">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  blurred,
}: {
  label: string;
  value: string;
  blurred?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/40 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </p>
      {blurred ? (
        <p
          className="group/gate relative mt-1 font-display text-lg font-medium tracking-tight"
          aria-hidden
        >
          <span className="select-none text-ink-50 blur-sm">8,888</span>
          <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 w-max max-w-[240px] rounded-md border border-ink-700 bg-ink-850 px-3 py-2 font-sans text-[11px] font-normal leading-snug tracking-normal text-ink-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/gate:opacity-100">
            You must be signed in as a brand to view this data.
          </span>
        </p>
      ) : (
        <p className="mt-1 font-display text-lg font-medium tracking-tight text-ink-50">
          {value}
        </p>
      )}
    </div>
  );
}

function Avatar({
  imageUrl,
  name,
}: {
  imageUrl: string | null;
  name: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className="h-16 w-16 flex-none rounded-full object-cover ring-1 ring-ink-700"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");
  return (
    <div
      className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full"
      style={{
        background: `radial-gradient(120% 120% at 20% 10%, #d4ff3a, #0a0a0b 70%)`,
      }}
      aria-hidden
    >
      <span className="relative font-display text-xl font-semibold text-ink-950 mix-blend-screen">
        {initials || "?"}
      </span>
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
    </div>
  );
}

function normalizeUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}
