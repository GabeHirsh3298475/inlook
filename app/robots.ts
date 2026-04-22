import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/messages",
          "/messages/",
          "/sign-in",
          "/sign-up",
          "/sign-in-token",
          "/no-signup",
        ],
      },
    ],
    sitemap: "https://inlookdeals.com/sitemap.xml",
    host: "https://inlookdeals.com",
  };
}
