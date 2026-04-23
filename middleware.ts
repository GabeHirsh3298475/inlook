import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/apply",
  "/network(.*)",
  "/brands",
  "/creators",
  "/privacy",
  "/terms",
  "/pricing",
  "/waitlist",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-in-token(.*)",
  "/no-signup",
  "/opengraph-image(.*)",
  "/twitter-image(.*)",
  "/icon(.*)",
  "/robots.txt",
  "/sitemap.xml",
  "/api/apply(.*)",
  "/api/auth(.*)",
  "/api/tiktok(.*)",
  "/api/brands/apply",
  "/api/waitlist",
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|opengraph-image|twitter-image|icon|apple-icon|robots\\.txt|sitemap\\.xml|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
