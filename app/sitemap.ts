import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://inlookdeals.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    priority: number;
    changeFrequency: "weekly" | "monthly";
  }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/creators", priority: 0.9, changeFrequency: "weekly" },
    { path: "/brands", priority: 0.9, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/apply", priority: 0.7, changeFrequency: "monthly" },
    { path: "/waitlist", priority: 0.6, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
  ];

  const staticEntries = staticRoutes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let creatorEntries: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabase
      .from("creators")
      .select("id, stats_last_updated")
      .eq("approved", true)
      .eq("published", true)
      .eq("admin_hidden", false);
    creatorEntries = (data ?? []).map((c) => ({
      url: `${BASE_URL}/creators/${c.id}`,
      lastModified: c.stats_last_updated
        ? new Date(c.stats_last_updated as string)
        : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    creatorEntries = [];
  }

  return [...staticEntries, ...creatorEntries];
}
