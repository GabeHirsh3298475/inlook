"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Youtube,
  Music2,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Film,
  Heart,
  Clock,
  Handshake,
  BarChart3,
  Save,
  Rocket,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { LocalDateTime } from "@/components/local-datetime";
import { MessagesPreview } from "@/components/messages-preview";
import type { CreatorRow, ConversationPreview } from "@/lib/supabase";

type Props = {
  userName: string;
  userImageUrl: string;
  clerkUserId: string;
  creator: CreatorRow | null;
  conversations: ConversationPreview[];
};

export function DashboardClient({
  userName,
  userImageUrl,
  clerkUserId,
  creator: initialCreator,
  conversations,
}: Props) {
  const [creator, setCreator] = useState(initialCreator);

  const [bio, setBio] = useState(creator?.bio ?? "");
  const [priceLong, setPriceLong] = useState(
    creator?.price_long_video?.toString() ?? ""
  );
  const [priceShort, setPriceShort] = useState(
    creator?.price_short_video?.toString() ?? ""
  );
  const [postPublicly, setPostPublicly] = useState(
    creator?.post_publicly ?? false
  );
  const [showDealStats, setShowDealStats] = useState(
    creator?.show_deal_stats ?? true
  );

  const hasYouTube = !!creator?.youtube_channel_id;
  const hasTikTok = !!creator?.tiktok_open_id;
  const defaultPrimary: "youtube" | "tiktok" | "both" =
    hasYouTube && hasTikTok ? "both" : hasTikTok ? "tiktok" : "youtube";
  const initialPrimary = (() => {
    const v = creator?.primary_platform?.toLowerCase();
    if (v === "youtube" || v === "tiktok" || v === "both") return v;
    return defaultPrimary;
  })();
  const [primaryPlatform, setPrimaryPlatform] =
    useState<"youtube" | "tiktok" | "both">(initialPrimary);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (creator && !creator.clerk_user_id) {
      fetch("/api/creator/link-account", { method: "POST" }).catch(() => {});
    }
  }, [creator]);

  async function postUpdate(payload: Record<string, unknown>) {
    return fetch("/api/creator/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  async function handleSaveProfile() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await postUpdate({
        bio,
        priceLongVideo: priceLong ? Number(priceLong) : null,
        priceShortVideo: priceShort ? Number(priceShort) : null,
        postPublicly,
        showDealStats,
        primaryPlatform,
      });
      if (res.ok && creator) {
        setCreator({
          ...creator,
          bio,
          price_long_video: priceLong ? Number(priceLong) : null,
          price_short_video: priceShort ? Number(priceShort) : null,
          post_publicly: postPublicly,
          show_deal_stats: showDealStats,
          primary_platform: primaryPlatform,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  async function handleSaveBio() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await postUpdate({
        bio,
        priceLongVideo: creator?.price_long_video,
        priceShortVideo: creator?.price_short_video,
        postPublicly: creator?.post_publicly ?? false,
        showDealStats: creator?.show_deal_stats ?? true,
      });
      if (res.ok && creator) setCreator({ ...creator, bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  async function handleTogglePostPublicly(value: boolean) {
    if (!creator) return;
    setPostPublicly(value);
    try {
      await postUpdate({
        bio: creator.bio,
        priceLongVideo: creator.price_long_video,
        priceShortVideo: creator.price_short_video,
        postPublicly: value,
        showDealStats: creator.show_deal_stats,
      });
      setCreator({ ...creator, post_publicly: value });
    } catch {}
  }

  async function handleToggleShowDealStats(value: boolean) {
    if (!creator) return;
    setShowDealStats(value);
    try {
      await postUpdate({
        bio: creator.bio,
        priceLongVideo: creator.price_long_video,
        priceShortVideo: creator.price_short_video,
        postPublicly: creator.post_publicly,
        showDealStats: value,
      });
      setCreator({ ...creator, show_deal_stats: value });
    } catch {}
  }

  async function handleChangePrimaryPlatform(
    value: "youtube" | "tiktok" | "both"
  ) {
    if (!creator) return;
    setPrimaryPlatform(value);
    try {
      await postUpdate({
        bio: creator.bio,
        priceLongVideo: creator.price_long_video,
        priceShortVideo: creator.price_short_video,
        postPublicly: creator.post_publicly,
        showDealStats: creator.show_deal_stats,
        primaryPlatform: value,
      });
      setCreator({ ...creator, primary_platform: value });
    } catch {}
  }

  async function handleGoLive() {
    setPublishing(true);
    try {
      const res = await fetch("/api/creator/publish", { method: "POST" });
      if (res.ok && creator) {
        setCreator({ ...creator, published: true });
      }
    } catch {}
    setPublishing(false);
  }

  const canGoLive =
    creator?.approved &&
    (hasYouTube || hasTikTok) &&
    bio.length >= 50 &&
    Number(priceLong) > 0 &&
    Number(priceShort) > 0;

  if (!creator) {
    return (
      <section className="relative">
        <div className="container-x py-20 text-center">
          <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50">
            No application found
          </h1>
          <p className="mt-4 font-sans text-[15px] text-ink-300">
            We couldn&apos;t find a creator application linked to your account.
            Make sure you signed in with the same email you applied with.
          </p>
        </div>
      </section>
    );
  }

  if (creator.published) {
    return (
      <LiveDashboard
        creator={creator}
        userName={userName}
        bio={bio}
        setBio={setBio}
        saving={saving}
        saved={saved}
        onSaveBio={handleSaveBio}
        postPublicly={postPublicly}
        onTogglePostPublicly={handleTogglePostPublicly}
        showDealStats={showDealStats}
        onToggleShowDealStats={handleToggleShowDealStats}
        conversations={conversations}
      />
    );
  }

  return (
    <section className="relative">
      <div className="container-x py-10 sm:py-14">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50 sm:text-4xl">
              Welcome back, {userName}.
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
                <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
                Draft
              </span>
            </div>
          </div>
          <UserButton
            appearance={{ elements: { avatarBox: "h-10 w-10" } }}
          />
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            {creator.youtube_channel_id && <YouTubeStats creator={creator} />}
            {creator.tiktok_open_id && <TikTokStats creator={creator} />}
            {!creator.youtube_channel_id && !creator.tiktok_open_id && (
              <NoPlatformCard />
            )}
            <DealStats creator={creator} />
            <MessagesPreview
              conversations={conversations}
              counterpartyKind="brand"
            />
            <ProfileSetupForm
              creator={creator}
              bio={bio}
              setBio={setBio}
              priceLong={priceLong}
              setPriceLong={setPriceLong}
              priceShort={priceShort}
              setPriceShort={setPriceShort}
              postPublicly={postPublicly}
              setPostPublicly={setPostPublicly}
              showDealStats={showDealStats}
              setShowDealStats={setShowDealStats}
              hasYouTube={hasYouTube}
              hasTikTok={hasTikTok}
              primaryPlatform={primaryPlatform}
              onChangePrimaryPlatform={handleChangePrimaryPlatform}
              saving={saving}
              saved={saved}
              onSave={handleSaveProfile}
            />
          </div>
          <div>
            <GoLiveCard
              creator={creator}
              canGoLive={!!canGoLive}
              hasPlatform={hasYouTube || hasTikTok}
              hasBio={bio.length >= 50}
              hasLongPrice={Number(priceLong) > 0}
              hasShortPrice={Number(priceShort) > 0}
              publishing={publishing}
              onGoLive={handleGoLive}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── LIVE DASHBOARD (STATE B) ──────────────────────────────── */

function LiveDashboard({
  creator,
  userName,
  bio,
  setBio,
  saving,
  saved,
  onSaveBio,
  postPublicly,
  onTogglePostPublicly,
  showDealStats,
  onToggleShowDealStats,
  conversations,
}: {
  creator: CreatorRow;
  userName: string;
  bio: string;
  setBio: (v: string) => void;
  saving: boolean;
  saved: boolean;
  onSaveBio: () => void;
  postPublicly: boolean;
  onTogglePostPublicly: (value: boolean) => void;
  showDealStats: boolean;
  onToggleShowDealStats: (value: boolean) => void;
  conversations: ConversationPreview[];
}) {
  return (
    <section className="relative">
      <div className="container-x py-10 sm:py-14">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50 sm:text-4xl">
              Welcome back, {userName}.
            </h1>
            <div className="mt-2 flex items-center gap-3">
              {creator?.admin_hidden ? (
                <span className="group relative inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-yellow-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
                  Not Live
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink-700 bg-ink-850 px-2.5 py-1.5 font-sans text-xs normal-case tracking-normal text-ink-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Contact support for further help
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Live on Network
                </span>
              )}
            </div>
          </div>
          <UserButton
            appearance={{ elements: { avatarBox: "h-10 w-10" } }}
          />
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            {creator.youtube_channel_id && <YouTubeStats creator={creator} />}
            {creator.tiktok_open_id && <TikTokStats creator={creator} />}
            {!creator.youtube_channel_id && !creator.tiktok_open_id && (
              <NoPlatformCard />
            )}
            <DealStats creator={creator} />
            <MessagesPreview
              conversations={conversations}
              counterpartyKind="brand"
            />

            {/* Bio editor */}
            <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
              <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
                Bio for Brands
              </h2>
              <div className="mt-5">
                <textarea
                  rows={4}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your audience, your content style, and what makes your sponsored content convert"
                  className="w-full rounded-2xl border border-ink-700 bg-ink-850 px-4 py-3 font-sans text-sm leading-relaxed text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <p className="mt-1 text-right font-mono text-[10px] text-ink-400">
                  {bio.length}/300
                </p>
                <button
                  type="button"
                  onClick={onSaveBio}
                  disabled={saving}
                  className="btn-primary mt-2 disabled:opacity-50"
                >
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2} /> Saved
                    </>
                  ) : saving ? (
                    "Saving\u2026"
                  ) : (
                    <>
                      <Save className="h-4 w-4" strokeWidth={2} /> Save bio
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Pricing (read-only) */}
            <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                Your Rates
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-ink-200">
                    Long-form video
                  </span>
                  <span className="font-display text-base font-medium text-ink-50">
                    ${creator.price_long_video?.toLocaleString() ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-ink-200">
                    Short-form / Shorts
                  </span>
                  <span className="font-display text-base font-medium text-ink-50">
                    ${creator.price_short_video?.toLocaleString() ?? "—"}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t border-ink-800 pt-4">
                <PostPubliclyToggle
                  value={postPublicly}
                  onChange={onTogglePostPublicly}
                />
              </div>
              <div className="mt-4 border-t border-ink-800 pt-4">
                <ShowDealStatsToggle
                  value={showDealStats}
                  onChange={onToggleShowDealStats}
                />
              </div>
              <p className="mt-3 font-mono text-[10px] text-ink-400">
                Contact support to update pricing
              </p>
            </div>

            {/* Social links (read-only) */}
            <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                Social Links
              </p>
              <div className="mt-3 space-y-2">
                {creator.youtube_channel_id && (
                  <SocialRow
                    label="YouTube"
                    value={
                      creator.channel_url ??
                      `https://youtube.com/channel/${creator.youtube_channel_id}`
                    }
                    link
                  />
                )}
                {creator.tiktok_open_id && (
                  <SocialRow
                    label="TikTok"
                    value={
                      creator.tiktok_display_name
                        ? `@${creator.tiktok_display_name}`
                        : "Connected"
                    }
                  />
                )}
              </div>
              <p className="mt-3 font-mono text-[10px] text-ink-400">
                Contact support to add another platform
              </p>
            </div>

            {/* View profile link */}
            {creator.username && (
              <a
                href={`/network`}
                className="flex items-center justify-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-5 py-3 font-sans text-sm font-medium text-ink-50 transition-colors hover:border-accent/40 hover:text-accent"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.6} />
                View my profile on network
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialRow({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: boolean;
}) {
  const href =
    link && value && !value.startsWith("http")
      ? `https://${value}`
      : value;

  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-sm text-ink-200">{label}</span>
      {link ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate max-w-[200px] font-mono text-[12px] text-accent underline-offset-4 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="truncate max-w-[200px] font-mono text-[12px] text-ink-50">
          {value}
        </span>
      )}
    </div>
  );
}

/* ─── YOUTUBE STATS ─────────────────────────────────────────── */

function YouTubeStats({ creator }: { creator: CreatorRow }) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshed(false);
    try {
      const res = await fetch("/api/creator/refresh-stats", { method: "POST" });
      if (res.ok) {
        setRefreshed(true);
        if (typeof window !== "undefined") {
          setTimeout(() => window.location.reload(), 600);
        }
      }
    } catch {}
    setRefreshing(false);
  }

  const subGrowthPositive =
    creator.subscriber_growth_30d != null &&
    creator.subscriber_growth_30d >= 0;

  const engagementRows: { label: string; value: string }[] = [
    {
      label: "Avg. View Rate",
      value:
        creator.avg_view_rate != null
          ? `${creator.avg_view_rate.toFixed(1)}%`
          : "—",
    },
    {
      label: "Avg. Engagement Rate",
      value:
        creator.avg_engagement_rate != null
          ? `${creator.avg_engagement_rate.toFixed(1)}%`
          : "—",
    },
    {
      label: "Engagement Rate (30D)",
      value:
        creator.engagement_rate_30d != null
          ? `${creator.engagement_rate_30d.toFixed(1)}%`
          : "—",
    },
  ];

  const gridStats: {
    icon: typeof Users;
    label: string;
    value: string;
    accent?: boolean;
  }[] = [
    {
      icon: Users,
      label: "Subscribers",
      value:
        creator.subscriber_count != null
          ? creator.subscriber_count.toLocaleString()
          : "—",
    },
    {
      icon: Film,
      label: "Total Videos",
      value:
        creator.total_videos != null
          ? creator.total_videos.toLocaleString()
          : "—",
    },
    {
      icon: Eye,
      label: "Total Views",
      value:
        creator.total_channel_views != null
          ? creator.total_channel_views.toLocaleString()
          : "—",
    },
    {
      icon: subGrowthPositive ? TrendingUp : TrendingDown,
      label: "Sub Growth (30d)",
      value:
        creator.subscriber_growth_30d != null
          ? `${creator.subscriber_growth_30d >= 0 ? "+" : ""}${creator.subscriber_growth_30d.toFixed(2)}%${
              creator.subscriber_growth_30d_count != null
                ? ` · ${creator.subscriber_growth_30d_count >= 0 ? "+" : ""}${creator.subscriber_growth_30d_count.toLocaleString()}`
                : ""
            }`
          : "—",
      accent: subGrowthPositive,
    },
  ];

  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 shadow-card">
      <div className="flex items-center gap-4 border-b border-ink-800 px-7 py-5">
        {creator.profile_picture_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.profile_picture_url}
            alt=""
            className="h-11 w-11 rounded-full ring-1 ring-accent/30"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Youtube className="h-5 w-5" strokeWidth={1.6} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-lg font-medium text-ink-50">
              {creator.display_name ?? creator.full_name}
            </p>
            <VerifiedBadge />
          </div>
          {creator.username && (
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
              {creator.username}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
            strokeWidth={1.8}
          />
          {refreshed ? "Synced" : refreshing ? "Syncing" : "Refresh"}
        </button>
      </div>
      <div className="px-7 py-5">
        <p className="eyebrow">YouTube Analytics</p>
        <dl className="mt-4 space-y-2">
          {engagementRows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="font-sans text-sm text-ink-300">{label}:</dt>
              <dd className="font-display text-base font-medium tracking-tight text-ink-50">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gridStats.map(({ icon: Icon, label, value, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-ink-800 bg-ink-950/40 p-4"
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  className={`h-3 w-3 ${accent ? "text-accent" : "text-ink-400"}`}
                  strokeWidth={1.6}
                />
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  {label}
                </p>
              </div>
              <p
                className={`mt-1 font-display text-lg font-medium tracking-tight ${
                  accent ? "text-accent" : "text-ink-50"
                }`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
        {creator.stats_last_updated && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
            Last synced{" "}
            <LocalDateTime iso={creator.stats_last_updated} />
          </p>
        )}
      </div>
    </div>
  );
}

function NoPlatformCard() {
  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
      <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
        No platform connected
      </h2>
      <p className="mt-4 font-sans text-[14px] leading-relaxed text-ink-300">
        Connect YouTube or TikTok to display verified stats on your profile.
        You can do this from the{" "}
        <a
          href="/apply"
          className="text-accent underline-offset-4 hover:underline"
        >
          apply page
        </a>
        .
      </p>
    </div>
  );
}

function TikTokStats({ creator }: { creator: CreatorRow }) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshed(false);
    try {
      const res = await fetch("/api/creator/refresh-tiktok-stats", {
        method: "POST",
      });
      if (res.ok) {
        setRefreshed(true);
        if (typeof window !== "undefined") {
          setTimeout(() => window.location.reload(), 600);
        }
      }
    } catch {}
    setRefreshing(false);
  }

  const views = creator.tiktok_total_views ?? 0;
  const avgLikes =
    views > 0 && creator.tiktok_likes_count != null
      ? (creator.tiktok_likes_count / views) * 100
      : null;
  const avgComments =
    views > 0 && creator.tiktok_total_comments != null
      ? (creator.tiktok_total_comments / views) * 100
      : null;
  const avgShares =
    views > 0 && creator.tiktok_total_shares != null
      ? (creator.tiktok_total_shares / views) * 100
      : null;

  const engagementRows: { label: string; value: string }[] = [
    {
      label: "Avg. Engagement Rate",
      value:
        creator.tiktok_avg_engagement_rate != null
          ? `${creator.tiktok_avg_engagement_rate.toFixed(1)}%`
          : "—",
    },
    {
      label: "Avg. Likes / View",
      value: avgLikes != null ? `${avgLikes.toFixed(2)}%` : "—",
    },
    {
      label: "Avg. Comments / View",
      value: avgComments != null ? `${avgComments.toFixed(2)}%` : "—",
    },
    {
      label: "Avg. Shares / View",
      value: avgShares != null ? `${avgShares.toFixed(2)}%` : "—",
    },
  ];

  const gridStats: {
    icon: typeof Users;
    label: string;
    value: string;
  }[] = [
    {
      icon: Users,
      label: "Followers",
      value:
        creator.tiktok_follower_count != null
          ? creator.tiktok_follower_count.toLocaleString()
          : "—",
    },
    {
      icon: Film,
      label: "Videos",
      value:
        creator.tiktok_video_count != null
          ? creator.tiktok_video_count.toLocaleString()
          : "—",
    },
    {
      icon: Eye,
      label: "Total Views",
      value: views > 0 ? views.toLocaleString() : "—",
    },
    {
      icon: Heart,
      label: "Total Likes",
      value:
        creator.tiktok_likes_count != null
          ? creator.tiktok_likes_count.toLocaleString()
          : "—",
    },
  ];

  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 shadow-card">
      <div className="flex items-center gap-4 border-b border-ink-800 px-7 py-5">
        {creator.tiktok_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={creator.tiktok_avatar_url}
            alt=""
            className="h-11 w-11 rounded-full ring-1 ring-accent/30"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Music2 className="h-5 w-5" strokeWidth={1.6} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-lg font-medium text-ink-50">
              {creator.tiktok_display_name ?? "TikTok"}
            </p>
            <VerifiedBadge />
          </div>
          {creator.tiktok_display_name && (
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
              TikTok
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
            strokeWidth={1.8}
          />
          {refreshed ? "Synced" : refreshing ? "Syncing" : "Refresh"}
        </button>
      </div>
      <div className="px-7 py-5">
        <p className="eyebrow">TikTok Analytics</p>
        <dl className="mt-4 space-y-2">
          {engagementRows.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="font-sans text-sm text-ink-300">{label}:</dt>
              <dd className="font-display text-base font-medium tracking-tight text-ink-50">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gridStats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-ink-800 bg-ink-950/40 p-4"
            >
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-ink-400" strokeWidth={1.6} />
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  {label}
                </p>
              </div>
              <p className="mt-1 font-display text-lg font-medium tracking-tight text-ink-50">
                {value}
              </p>
            </div>
          ))}
        </div>
        {creator.tiktok_stats_last_updated && (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
            Last synced{" "}
            <LocalDateTime iso={creator.tiktok_stats_last_updated} />
          </p>
        )}
      </div>
    </div>
  );
}

function DealStats({ creator }: { creator: CreatorRow }) {
  const daysOnInlook = creator.connected_at
    ? Math.floor(
        (Date.now() - new Date(creator.connected_at).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 1;

  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
      <p className="eyebrow">Deal Stats</p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
          <Clock className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
          <p className="mt-3 font-display text-2xl font-medium tracking-tight text-ink-50">
            {daysOnInlook}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
            Days on Inlook
          </p>
        </div>
        <div className="rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
          <Handshake className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
          <p className="mt-3 font-display text-2xl font-medium tracking-tight text-ink-50">
            {creator.deals_completed ?? 0}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
            Deals Completed
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE SETUP FORM (STATE A) ──────────────────────────── */

const inputCls =
  "h-11 w-full rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-sm text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

function ProfileSetupForm({
  creator,
  bio,
  setBio,
  priceLong,
  setPriceLong,
  priceShort,
  setPriceShort,
  postPublicly,
  setPostPublicly,
  showDealStats,
  setShowDealStats,
  hasYouTube,
  hasTikTok,
  primaryPlatform,
  onChangePrimaryPlatform,
  saving,
  saved,
  onSave,
}: {
  creator: CreatorRow;
  bio: string;
  setBio: (v: string) => void;
  priceLong: string;
  setPriceLong: (v: string) => void;
  priceShort: string;
  setPriceShort: (v: string) => void;
  postPublicly: boolean;
  setPostPublicly: (v: boolean) => void;
  showDealStats: boolean;
  setShowDealStats: (v: boolean) => void;
  hasYouTube: boolean;
  hasTikTok: boolean;
  primaryPlatform: "youtube" | "tiktok" | "both";
  onChangePrimaryPlatform: (v: "youtube" | "tiktok" | "both") => void;
  saving: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
      <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
        Profile Setup
      </h2>

      {/* Connected platforms (read-only) */}
      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
          Connected Platforms
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {hasYouTube && (
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 font-mono text-[11px] text-ink-100">
              <Youtube className="h-3.5 w-3.5" strokeWidth={1.6} />
              YouTube
              <VerifiedBadge size="sm" />
            </span>
          )}
          {hasTikTok && (
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 font-mono text-[11px] text-ink-100">
              <Music2 className="h-3.5 w-3.5" strokeWidth={1.6} />
              TikTok
              <VerifiedBadge size="sm" />
            </span>
          )}
        </div>
        <p className="mt-3 font-sans text-[12px] leading-relaxed text-ink-400">
          Your social links come from whichever platforms you connected at
          application time. Contact support to add another.
        </p>
      </div>

      {/* Primary platform selector */}
      <PrimaryPlatformSelector
        hasYouTube={hasYouTube}
        hasTikTok={hasTikTok}
        value={primaryPlatform}
        onChange={onChangePrimaryPlatform}
      />

      {/* About */}
      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
          About
        </p>
        <div className="mt-3">
          <label
            htmlFor="d-bio"
            className="mb-1.5 block font-sans text-xs text-ink-300"
          >
            Bio for brands
          </label>
          <textarea
            id="d-bio"
            rows={4}
            maxLength={300}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Describe your audience, your content style, and what makes your sponsored content convert"
            className="w-full rounded-2xl border border-ink-700 bg-ink-850 px-4 py-3 font-sans text-sm leading-relaxed text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-ink-400">
            {bio.length}/300
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
          Pricing
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <label
              htmlFor="d-price-long"
              className="mb-1.5 block font-sans text-xs text-ink-300"
            >
              Long-form video rate
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm text-ink-400">
                $
              </span>
              <input
                id="d-price-long"
                type="number"
                min={0}
                value={priceLong}
                onChange={(e) => setPriceLong(e.target.value)}
                placeholder="e.g. 800"
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="d-price-short"
              className="mb-1.5 block font-sans text-xs text-ink-300"
            >
              Short-form / Shorts rate
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans text-sm text-ink-400">
                $
              </span>
              <input
                id="d-price-short"
                type="number"
                min={0}
                value={priceShort}
                onChange={(e) => setPriceShort(e.target.value)}
                placeholder="e.g. 300"
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div className="pt-2">
            <PostPubliclyToggle
              value={postPublicly}
              onChange={setPostPublicly}
            />
          </div>
          <div className="pt-2">
            <ShowDealStatsToggle
              value={showDealStats}
              onChange={setShowDealStats}
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="btn-primary mt-6 disabled:opacity-50"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2} /> Saved
          </>
        ) : saving ? (
          "Saving\u2026"
        ) : (
          <>
            <Save className="h-4 w-4" strokeWidth={2} /> Save profile
          </>
        )}
      </button>
    </div>
  );
}

/* ─── GO LIVE CARD ──────────────────────────────────────────── */

function GoLiveCard({
  creator,
  canGoLive,
  hasBio,
  hasLongPrice,
  hasShortPrice,
  hasPlatform,
  publishing,
  onGoLive,
}: {
  creator: CreatorRow;
  canGoLive: boolean;
  hasBio: boolean;
  hasLongPrice: boolean;
  hasShortPrice: boolean;
  hasPlatform: boolean;
  publishing: boolean;
  onGoLive: () => void;
}) {
  const checklist = [
    {
      label: "Platform connected (YouTube or TikTok)",
      done: hasPlatform,
    },
    { label: "Bio written (min 50 chars)", done: hasBio },
    { label: "Long video rate set", done: hasLongPrice },
    { label: "Short video rate set", done: hasShortPrice },
  ];

  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
      <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
        Go Live
      </h2>
      <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-300">
        Complete all steps to publish your profile on the Creator Network.
      </p>
      {!creator.approved && (
        <div className="mt-4 rounded-xl border border-ink-700 bg-ink-850 px-4 py-3">
          <p className="font-sans text-[13px] text-ink-300">
            Your application is pending review. You&apos;ll be notified once
            approved.
          </p>
        </div>
      )}
      <ul className="mt-5 space-y-3">
        {checklist.map(({ label, done }) => (
          <li key={label} className="flex items-center gap-3">
            {done ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-ink-950">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
            ) : (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-ink-700 bg-ink-850">
                <AlertCircle
                  className="h-3 w-3 text-ink-400"
                  strokeWidth={2}
                />
              </span>
            )}
            <span
              className={`font-sans text-sm ${done ? "text-ink-50" : "text-ink-400"}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onGoLive}
        disabled={!canGoLive || publishing}
        className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        {publishing ? (
          "Publishing\u2026"
        ) : (
          <>
            <Rocket className="h-4 w-4" strokeWidth={2} /> Go Live
          </>
        )}
      </button>
    </div>
  );
}

function PrimaryPlatformSelector({
  hasYouTube,
  hasTikTok,
  value,
  onChange,
}: {
  hasYouTube: boolean;
  hasTikTok: boolean;
  value: "youtube" | "tiktok" | "both";
  onChange: (v: "youtube" | "tiktok" | "both") => void;
}) {
  const options: { value: "youtube" | "tiktok" | "both"; label: string }[] = [];
  if (hasYouTube) options.push({ value: "youtube", label: "YouTube" });
  if (hasTikTok) options.push({ value: "tiktok", label: "TikTok" });
  if (hasYouTube && hasTikTok)
    options.push({ value: "both", label: "Both" });

  if (options.length <= 1) return null;

  return (
    <div className="mt-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
        Primary Platform
      </p>
      <p className="mt-1 font-sans text-[12px] leading-relaxed text-ink-400">
        Your primary platform determines the stats shown on your network
        creator card.
      </p>
      <div className="mt-3 inline-flex overflow-hidden rounded-full border border-ink-700 bg-ink-850">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              value === opt.value
                ? "bg-accent text-ink-950"
                : "text-ink-300 hover:text-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PostPubliclyToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-sans text-sm font-medium text-ink-50">
          Show to brands only
        </p>
        <p className="mt-1 font-sans text-xs leading-relaxed text-ink-400">
          When enabled, your prices are hidden from anyone who is not signed in
          as a brand.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${
          value ? "bg-accent" : "bg-ink-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-ink-950 transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ShowDealStatsToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="font-sans text-sm font-medium text-ink-50">
          Show deal stats on my profile
        </p>
        <p className="mt-1 font-sans text-xs leading-relaxed text-ink-400">
          When enabled, Days on Inlook and Deals Completed are shown on your
          public profile.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full transition-colors ${
          value ? "bg-accent" : "bg-ink-700"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-ink-950 transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
