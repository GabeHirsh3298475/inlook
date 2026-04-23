"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { PublicCreator } from "@/app/network/creators-client";
import { formatFollowers } from "@/lib/utils";
import { PlatformIcon } from "./platform-icon";
import { MessageButton } from "./message-button";

export function CreatorCard({
  creator,
  index = 0,
  isBrand,
}: {
  creator: PublicCreator;
  index?: number;
  isBrand: boolean;
}) {
  const canViewAll = isBrand || creator.isSelf;
  const platforms: {
    platform: "YouTube" | "TikTok" | "Instagram";
    url: string;
    count: number;
  }[] = [];
  if (creator.instagramUrl)
    platforms.push({
      platform: "Instagram",
      url: creator.instagramUrl,
      count: creator.instagramFollowerCount ?? 0,
    });
  if (creator.tiktokUrl)
    platforms.push({
      platform: "TikTok",
      url: creator.tiktokUrl,
      count: creator.tiktokFollowerCount ?? 0,
    });
  if (creator.channelUrl)
    platforms.push({
      platform: "YouTube",
      url: creator.channelUrl,
      count: creator.subscriberCount,
    });

  const totalFollowers =
    creator.subscriberCount +
    (creator.tiktokFollowerCount ?? 0) +
    (creator.instagramFollowerCount ?? 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.2, 0.7, 0.2, 1],
      }}
      className="group relative flex flex-col rounded-2xl border border-ink-800 bg-ink-900 shadow-card transition-all duration-300 hover:-translate-y-[2px] hover:border-ink-700 hover:shadow-card-hover"
    >
      {/* Section 1: profile pic + name, niche chip, followers, platform breakdown */}
      <header className="flex items-start justify-between gap-3 p-6 pb-4">
        <div className="flex items-center gap-3">
          <Avatar
            imageUrl={creator.profilePictureUrl}
            name={creator.name}
          />
          <h3 className="font-display text-lg font-medium leading-tight tracking-tight text-ink-50">
            {creator.name}
          </h3>
        </div>
        {creator.niche && <NicheChip niche={creator.niche} />}
      </header>

      <section className="px-6 pb-5">
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
                aria-label={`Open ${creator.name}'s ${platform} profile`}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[11px] text-ink-200 transition-colors hover:border-accent/40 hover:text-accent"
                title={platform}
              >
                <PlatformIcon platform={platform} className="h-3.5 w-3.5" />
                <span>{formatFollowers(count)}</span>
              </a>
            ))}
          </div>
        )}
      </section>

      <Divider />

      {/* Section 2: analytics (gated, primary-platform-driven) */}
      <section className="px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="eyebrow">
            {creator.primaryPlatform === "tiktok"
              ? "TikTok"
              : creator.primaryPlatform === "both"
              ? "Performance"
              : "YouTube"}{" "}
            Performance
          </p>
          <LogoVerifiedBadge />
        </div>
        <div className="mt-3">
          {creator.primaryPlatform === "tiktok" ? (
            <TikTokAnalyticsBlock
              canViewAll={canViewAll}
              avgEngagementRate={creator.tiktokAvgEngagementRate}
              avgLikesPerView={creator.tiktokAvgLikesPerView}
            />
          ) : creator.primaryPlatform === "both" ? (
            <BothAnalyticsBlock
              canViewAll={canViewAll}
              avgViewRate={creator.avgViewRate}
              avgEngagementRate={creator.avgEngagementRate}
              tiktokAvgEngagementRate={creator.tiktokAvgEngagementRate}
              tiktokAvgLikesPerView={creator.tiktokAvgLikesPerView}
            />
          ) : (
            <AnalyticsBlock
              canViewAll={canViewAll}
              avgViewRate={creator.avgViewRate}
              avgEngagementRate={creator.avgEngagementRate}
            />
          )}
        </div>
      </section>

      <Divider />

      {/* Section 3: price */}
      <section className="px-6 py-5">
        <PriceBlock
          long={creator.priceLongVideo}
          short={creator.priceShortVideo}
          hidden={creator.pricesHidden}
        />
        <div className="mt-5 flex justify-center">
          <MessageButton creatorId={creator.id} isSelf={creator.isSelf} />
        </div>
      </section>

      <Link
        href={`/network/${creator.id}`}
        className="group/cta flex items-center justify-between rounded-b-2xl border-t border-ink-800 bg-ink-900 px-6 py-4 font-sans text-sm font-medium tracking-tight text-ink-50 transition-colors duration-200 hover:bg-ink-850 hover:text-accent"
        aria-label={`View ${creator.name}'s profile`}
      >
        <span>View profile</span>
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
          strokeWidth={1.6}
        />
      </Link>
    </motion.article>
  );
}

function Divider() {
  return <div className="mx-6 h-px bg-ink-800" aria-hidden />;
}

const VIEW_RATE_DEF = (
  <>The average percentage of each video viewers watch.</>
);
const ENGAGEMENT_DEF = (
  <span className="inline-flex flex-col items-center font-mono text-[11px] text-ink-100">
    <span className="px-1 leading-snug">likes + comments + shares</span>
    <span className="my-0.5 h-px w-full bg-ink-500" aria-hidden />
    <span className="px-1 leading-snug">lifetime views</span>
  </span>
);

export function AnalyticsBlock({
  canViewAll,
  avgViewRate,
  avgEngagementRate,
  engagementRate30d,
  showEngagement30d = false,
}: {
  canViewAll: boolean;
  avgViewRate: number | null;
  avgEngagementRate: number | null;
  engagementRate30d?: number | null;
  showEngagement30d?: boolean;
}) {
  if (!canViewAll) {
    return (
      <dl className="space-y-2">
        <AnalyticsRow
          label="Avg. View Rate"
          blurred
          definition={VIEW_RATE_DEF}
        />
        <AnalyticsRow
          label="Avg. Engagement Rate"
          blurred
          definition={ENGAGEMENT_DEF}
        />
        {showEngagement30d && (
          <AnalyticsRow label="Engagement Rate (30D)" blurred />
        )}
      </dl>
    );
  }

  return (
    <dl className="space-y-2">
      <AnalyticsRow
        label="Avg. View Rate"
        definition={VIEW_RATE_DEF}
        value={avgViewRate != null ? `${avgViewRate.toFixed(1)}%` : "—"}
      />
      <AnalyticsRow
        label="Avg. Engagement Rate"
        definition={ENGAGEMENT_DEF}
        value={
          avgEngagementRate != null
            ? `${avgEngagementRate.toFixed(1)}%`
            : "—"
        }
      />
      {showEngagement30d && (
        <AnalyticsRow
          label="Engagement Rate (30D)"
          value={
            engagementRate30d != null
              ? `${engagementRate30d.toFixed(1)}%`
              : "—"
          }
        />
      )}
    </dl>
  );
}

const TIKTOK_ENGAGEMENT_DEF = (
  <span className="inline-flex flex-col items-center font-mono text-[11px] text-ink-100">
    <span className="px-1 leading-snug">likes + comments + shares</span>
    <span className="my-0.5 h-px w-full bg-ink-500" aria-hidden />
    <span className="px-1 leading-snug">total views</span>
  </span>
);
const TIKTOK_LIKES_PER_VIEW_DEF = (
  <span className="inline-flex flex-col items-center font-mono text-[11px] text-ink-100">
    <span className="px-1 leading-snug">total likes</span>
    <span className="my-0.5 h-px w-full bg-ink-500" aria-hidden />
    <span className="px-1 leading-snug">total views</span>
  </span>
);

export function TikTokAnalyticsBlock({
  canViewAll,
  avgEngagementRate,
  avgLikesPerView,
}: {
  canViewAll: boolean;
  avgEngagementRate: number | null;
  avgLikesPerView: number | null;
}) {
  return (
    <dl className="space-y-2">
      <AnalyticsRow
        label="Avg. Engagement Rate"
        definition={TIKTOK_ENGAGEMENT_DEF}
        blurred={!canViewAll}
        value={
          avgEngagementRate != null ? `${avgEngagementRate.toFixed(1)}%` : "—"
        }
      />
      <AnalyticsRow
        label="Avg. Likes / View"
        definition={TIKTOK_LIKES_PER_VIEW_DEF}
        blurred={!canViewAll}
        value={
          avgLikesPerView != null ? `${avgLikesPerView.toFixed(2)}%` : "—"
        }
      />
    </dl>
  );
}

export function BothAnalyticsBlock({
  canViewAll,
  avgViewRate,
  avgEngagementRate,
  tiktokAvgEngagementRate,
  tiktokAvgLikesPerView,
}: {
  canViewAll: boolean;
  avgViewRate: number | null;
  avgEngagementRate: number | null;
  tiktokAvgEngagementRate: number | null;
  tiktokAvgLikesPerView: number | null;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
          YouTube
        </p>
        <AnalyticsBlock
          canViewAll={canViewAll}
          avgViewRate={avgViewRate}
          avgEngagementRate={avgEngagementRate}
        />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
          TikTok
        </p>
        <TikTokAnalyticsBlock
          canViewAll={canViewAll}
          avgEngagementRate={tiktokAvgEngagementRate}
          avgLikesPerView={tiktokAvgLikesPerView}
        />
      </div>
    </div>
  );
}

function AnalyticsRow({
  label,
  value,
  blurred,
  definition,
}: {
  label: string;
  value?: string;
  blurred?: boolean;
  definition?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="inline-flex items-baseline gap-1.5 font-sans text-sm text-ink-300">
        {definition && (
          <span className="group/help relative inline-flex self-center">
            <HelpCircle
              className="h-3.5 w-3.5 cursor-help text-ink-500 transition-colors group-hover/help:text-ink-200"
              strokeWidth={1.8}
            />
            <span className="pointer-events-none absolute left-0 bottom-full z-50 mb-1.5 w-max max-w-[240px] rounded-md border border-ink-700 bg-ink-850 px-3 py-2 font-sans text-[11px] leading-snug text-ink-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/help:opacity-100">
              {definition}
            </span>
          </span>
        )}
        <span>{label}:</span>
      </dt>
      {blurred ? (
        <dd
          className="group/gate relative font-display text-base font-medium tracking-tight"
          aria-hidden
        >
          <span className="select-none text-ink-50 blur-sm">88.8%</span>
          <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-1.5 w-max max-w-[240px] rounded-md border border-ink-700 bg-ink-850 px-3 py-2 font-sans text-[11px] font-normal leading-snug tracking-normal text-ink-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/gate:opacity-100">
            You must be signed in as a brand to view this data.
          </span>
        </dd>
      ) : (
        <dd className="font-display text-base font-medium tracking-tight text-ink-50">
          {value}
        </dd>
      )}
    </div>
  );
}

export function PriceBlock({
  long,
  short,
  hidden,
}: {
  long: number | null;
  short: number | null;
  hidden: boolean;
}) {
  return (
    <div>
      <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
        Price
      </p>
      {hidden ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <PriceCell label="Long" value="$888" blurred />
          <PriceCell label="Short" value="$888" blurred />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <PriceCell
            label="Long"
            value={long != null ? `$${long.toLocaleString()}` : "—"}
          />
          <PriceCell
            label="Short"
            value={short != null ? `$${short.toLocaleString()}` : "—"}
          />
        </div>
      )}
    </div>
  );
}

function PriceCell({
  label,
  value,
  blurred,
}: {
  label: string;
  value: string;
  blurred?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </span>
      {blurred ? (
        <span
          className="group/gate relative mt-1 font-display text-xl font-medium tracking-tight"
          aria-hidden
        >
          <span className="select-none text-ink-50 blur-sm">{value}</span>
          <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-[240px] -translate-x-1/2 rounded-md border border-ink-700 bg-ink-850 px-3 py-2 font-sans text-[11px] font-normal leading-snug tracking-normal text-ink-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/gate:opacity-100">
            The Creator requires brands to be signed in to view this data.
          </span>
        </span>
      ) : (
        <span className="mt-1 font-display text-xl font-medium tracking-tight text-ink-50">
          {value}
        </span>
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
        className="h-11 w-11 flex-none rounded-full object-cover ring-1 ring-ink-700"
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
      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full"
      style={{
        background: `radial-gradient(120% 120% at 20% 10%, #d4ff3a, #0a0a0b 70%)`,
      }}
      aria-hidden
    >
      <span className="relative font-display text-sm font-semibold text-ink-950 mix-blend-screen">
        {initials || "?"}
      </span>
      <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
    </div>
  );
}

export function LogoVerifiedBadge({
  emphasized = false,
}: {
  emphasized?: boolean;
}) {
  return (
    <span
      title="Engagement numbers verified via platform APIs"
      className={
        emphasized
          ? "inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/[0.14] px-3 py-1.5 font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-accent shadow-[0_0_24px_-6px_rgba(74,144,255,0.55)]"
          : "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-accent"
      }
    >
      <svg
        viewBox="0 0 28 28"
        className={emphasized ? "h-4 w-4" : "h-3 w-3"}
        aria-hidden
      >
        <circle
          cx="14"
          cy="14"
          r="12.5"
          stroke="currentColor"
          strokeWidth="1.4"
          opacity="0.45"
          fill="none"
        />
        <path
          d="M8 13.5l4 4 8-8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      Verified
    </span>
  );
}

function NicheChip({ niche }: { niche: string }) {
  return (
    <span className="rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-200">
      {niche}
    </span>
  );
}

function normalizeUrl(url: string): string {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}
