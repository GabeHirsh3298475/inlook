import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type BrandRow = {
  id: string;
  business_name: string;
  email: string;
  product_url: string;
  social_url: string | null;
  verified: boolean;
  rejected: boolean;
  clerk_user_id: string | null;
  created_at: string;
  bio: string | null;
};

export type ConversationRow = {
  id: string;
  brand_id: string;
  creator_id: string;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  brand_agreed_long: boolean;
  brand_agreed_long_at: string | null;
  brand_agreed_short: boolean;
  brand_agreed_short_at: string | null;
  creator_agreed_long: boolean;
  creator_agreed_long_at: string | null;
  creator_agreed_short: boolean;
  creator_agreed_short_at: string | null;
  payment_link_sent_long: boolean;
  payment_link_sent_long_at: string | null;
  payment_link_sent_short: boolean;
  payment_link_sent_short_at: string | null;
  paid_long: boolean;
  paid_long_at: string | null;
  paid_short: boolean;
  paid_short_at: string | null;
};

export type AgreementStatus =
  | "offered"
  | "agreed"
  | "payment_link_sent"
  | "paid";

export type AgreementEntry = {
  conversationId: string;
  brandId: string;
  creatorId: string;
  brandName: string;
  creatorName: string;
  format: "long" | "short";
  status: AgreementStatus;
  brandOfferedAt: string | null;
  creatorAgreedAt: string | null;
  paymentLinkSentAt: string | null;
  paidAt: string | null;
};

export type DealRow = {
  id: string;
  conversation_id: string;
  brand_id: string;
  creator_id: string;
  format: "long" | "short";
  brand_name: string;
  creator_name: string;
  creator_youtube_channel_id: string | null;
  price: number;
  platform_fee: number;
  creator_payout: number;
  creator_subscribers_at_deal: number | null;
  creator_avg_view_rate: number | null;
  creator_avg_engagement_rate: number | null;
  offered_at: string | null;
  agreed_at: string | null;
  payment_link_sent_at: string | null;
  paid_at: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_role: "brand" | "creator";
  body: string;
  created_at: string;
  read_at: string | null;
};

export type ConversationPreview = {
  conversationId: string;
  counterpartyName: string;
  counterpartyImageUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

export type CreatorRow = {
  id: string;
  full_name: string;
  email: string;
  channel_url: string;
  niche: string;
  primary_platform: string;
  follower_count_range: string;
  bio: string;
  approved: boolean;
  youtube_access_token: string | null;
  youtube_refresh_token: string | null;
  subscriber_count: number | null;
  stats_last_updated: string | null;
  profile_picture_url: string | null;
  username: string | null;
  display_name: string | null;
  total_channel_views: number | null;
  avg_view_rate: number | null;
  avg_engagement_rate: number | null;
  engagement_rate_30d: number | null;
  subscriber_growth_30d: number | null;
  subscriber_growth_30d_count: number | null;
  total_videos: number | null;
  channel_bio: string | null;
  published: boolean;
  clerk_user_id: string | null;
  days_connected: number | null;
  deals_completed: number;
  connected_at: string | null;
  price_long_video: number | null;
  price_short_video: number | null;
  tiktok_url: string | null;
  tiktok_follower_count: number | null;
  instagram_url: string | null;
  instagram_follower_count: number | null;
  youtube_channel_id: string | null;
  rejected: boolean;
  post_publicly: boolean;
  admin_hidden: boolean;
  show_deal_stats: boolean;
};
