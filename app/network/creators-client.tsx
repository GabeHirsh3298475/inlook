"use client";

import { useMemo, useState } from "react";
import { FOLLOWER_BUCKETS, type Platform } from "@/lib/creators";
import { CreatorCard } from "@/components/creator-card";
import { FilterBar, type Filters } from "@/components/filter-bar";

export type PublicCreator = {
  id: string;
  name: string;
  niche: string;
  subscriberCount: number;
  profilePictureUrl: string | null;
  channelUrl: string;
  tiktokUrl: string | null;
  tiktokFollowerCount: number | null;
  instagramUrl: string | null;
  instagramFollowerCount: number | null;
  priceLongVideo: number | null;
  priceShortVideo: number | null;
  pricesHidden: boolean;
  avgViewRate: number | null;
  avgEngagementRate: number | null;
  engagementRate30d: number | null;
  showDealStats: boolean;
  isSelf: boolean;
};

export function CreatorsClient({
  creators,
  isBrand,
}: {
  creators: PublicCreator[];
  isBrand: boolean;
}) {
  const [filters, setFilters] = useState<Filters>({
    niches: new Set(),
    platforms: new Set(),
    followerBucket: null,
  });

  const filtered = useMemo(() => {
    const followerRange = filters.followerBucket
      ? FOLLOWER_BUCKETS.find((b) => b.label === filters.followerBucket)
      : null;

    return creators.filter((c) => {
      if (filters.niches.size > 0 && !filters.niches.has(c.niche)) return false;

      if (filters.platforms.size > 0) {
        const has: Record<Platform, boolean> = {
          YouTube: !!c.channelUrl,
          TikTok: !!c.tiktokUrl,
          Instagram: !!c.instagramUrl,
        };
        const any = Array.from(filters.platforms).some((p) => has[p]);
        if (!any) return false;
      }

      if (followerRange) {
        const total =
          c.subscriberCount +
          (c.tiktokFollowerCount ?? 0) +
          (c.instagramFollowerCount ?? 0);
        if (total < followerRange.min || total >= followerRange.max)
          return false;
      }
      return true;
    });
  }, [filters, creators]);

  if (creators.length === 0) {
    return (
      <section className="relative">
        <div className="container-x py-12">
          <BetaEmptyState />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative">
        <div className="container-x">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            resultCount={filtered.length}
          />
        </div>
      </section>

      <section className="relative">
        <div className="container-x py-12">
          {filtered.length === 0 ? (
            <FilterEmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((creator, i) => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  index={i}
                  isBrand={isBrand}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function BetaEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-ink-700 bg-ink-900/50 p-14 text-center">
      <p className="font-display text-2xl font-medium tracking-tight text-ink-50">
        Inlook is still in beta testing.
      </p>
      <p className="mx-auto mt-2 max-w-md font-sans text-sm text-ink-300">
        Creators coming soon...
      </p>
    </div>
  );
}

function FilterEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-ink-700 bg-ink-900/50 p-14 text-center">
      <p className="font-display text-2xl font-medium tracking-tight text-ink-50">
        No creators match those filters yet.
      </p>
      <p className="mx-auto mt-2 max-w-md font-sans text-sm text-ink-300">
        Try loosening a filter — or{" "}
        <a
          href="/brands"
          className="text-accent underline-offset-4 hover:underline"
        >
          tell us what you&apos;re looking for
        </a>{" "}
        and we&apos;ll match you manually.
      </p>
    </div>
  );
}
