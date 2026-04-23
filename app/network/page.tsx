import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { supabase, type CreatorRow } from "@/lib/supabase";
import { CreatorsClient, type PublicCreator } from "./creators-client";

export const metadata: Metadata = {
  title: "Creator Network · Inlook",
};

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const isBrand = role === "brand" || role === "admin";
  const viewerClerkId = user?.id ?? null;

  const { data: rows } = await supabase
    .from("creators")
    .select("*")
    .eq("approved", true)
    .eq("published", true)
    .eq("admin_hidden", false)
    .order("connected_at", { ascending: false });

  const creators: PublicCreator[] = ((rows as CreatorRow[]) ?? []).map((c) =>
    toPublicCreator(c, isBrand, viewerClerkId)
  );

  return (
    <>
      <section className="relative">
        <div className="container-x pt-14 pb-12 sm:pt-20 sm:pb-16">
          <div className="max-w-3xl">
            <p className="eyebrow">The marketplace</p>
            <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-6xl lg:text-7xl">
              Creators,{" "}
              <em className="italic text-accent">priced honestly.</em>
            </h1>
            <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
              Every rate below is set by the creator. Every engagement number
              is pulled from platform data.
            </p>
          </div>
        </div>
      </section>

      <CreatorsClient creators={creators} isBrand={isBrand} />
    </>
  );
}

function toPublicCreator(
  c: CreatorRow,
  isBrand: boolean,
  viewerClerkId: string | null
): PublicCreator {
  const isSelf = !!viewerClerkId && c.clerk_user_id === viewerClerkId;
  const canViewAll = isBrand || isSelf;
  const pricesHidden = !canViewAll && c.post_publicly === true;

  const hasYouTube = !!c.youtube_channel_id;
  const hasTikTok = !!c.tiktok_open_id;
  const pp = c.primary_platform?.toLowerCase();
  const primaryPlatform: "youtube" | "tiktok" | "both" =
    pp === "youtube" || pp === "tiktok" || pp === "both"
      ? pp
      : hasYouTube && hasTikTok
      ? "both"
      : hasTikTok
      ? "tiktok"
      : "youtube";

  const tiktokTotalViews = c.tiktok_total_views ?? 0;
  const tiktokLikes = c.tiktok_likes_count ?? 0;
  const tiktokAvgLikesPerView =
    tiktokTotalViews > 0 ? (tiktokLikes / tiktokTotalViews) * 100 : null;

  return {
    id: c.id,
    name: c.display_name ?? c.full_name,
    niche: c.niche,
    subscriberCount: c.subscriber_count ?? 0,
    profilePictureUrl: c.profile_picture_url,
    channelUrl: c.channel_url,
    tiktokUrl: c.tiktok_url,
    tiktokFollowerCount: c.tiktok_follower_count,
    tiktokProfilePictureUrl: c.tiktok_avatar_url,
    hasYouTube,
    hasTikTok,
    primaryPlatform,
    instagramUrl: c.instagram_url,
    instagramFollowerCount: c.instagram_follower_count,
    priceLongVideo: pricesHidden ? null : c.price_long_video,
    priceShortVideo: pricesHidden ? null : c.price_short_video,
    pricesHidden,
    avgViewRate: canViewAll ? c.avg_view_rate : null,
    avgEngagementRate: canViewAll ? c.avg_engagement_rate : null,
    engagementRate30d: canViewAll ? c.engagement_rate_30d : null,
    tiktokAvgEngagementRate: canViewAll ? c.tiktok_avg_engagement_rate : null,
    tiktokAvgLikesPerView: canViewAll ? tiktokAvgLikesPerView : null,
    showDealStats: c.show_deal_stats ?? true,
    isSelf,
  };
}
