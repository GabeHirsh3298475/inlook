export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/creators", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/brands", priority: 0.9, changeFrequency: "weekly" as const },
  ];

  const creators = await fetch("https://yourapi.com/creators").then(res => res.json());

  return [
    ...staticRoutes.map((r) => ({
      url: `${BASE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...creators.map((creator: any) => ({
      url: `${BASE_URL}/creator/${creator.username}`,
      lastModified: new Date(creator.updatedAt || now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}