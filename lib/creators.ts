export type Platform = "YouTube" | "TikTok" | "Instagram";

// Niches exactly matching the /apply form options
export const NICHES = [
  "Tech & Apps",
  "Productivity",
  "Gaming",
  "Finance",
  "Food",
  "Fitness",
  "Lifestyle",
  "Other",
] as const;

export const PLATFORMS: Platform[] = [
  "YouTube",
  "TikTok",
  "Instagram",
];

export const FOLLOWER_BUCKETS = [
  { label: "Under 10K", min: 0, max: 10_000 },
  { label: "10K–50K", min: 10_000, max: 50_000 },
  { label: "50K–100K", min: 50_000, max: 100_000 },
  { label: "100K–250K", min: 100_000, max: 250_000 },
  { label: "250K+", min: 250_000, max: Infinity },
] as const;
