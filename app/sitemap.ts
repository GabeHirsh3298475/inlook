import type { MetadataRoute } from "next";

const BASE_URL = "https://inlookdeals.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/creators", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/brands", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/network", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/apply", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/waitlist", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
