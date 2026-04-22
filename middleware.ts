import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/apply",
  "/network(.*)",
  "/brands",
  "/creators",
  "/privacy",
  "/terms",
  "/waitlist",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sign-in-token(.*)",
  "/no-signup",
  "/api/apply(.*)",
  "/api/auth(.*)",
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
