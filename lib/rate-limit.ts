import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

if (!hasUpstash && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled"
  );
}

const redis = hasUpstash ? Redis.fromEnv() : null;

function makeLimiter(requests: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "inlook",
  });
}

// Per-IP limiters (for unauthenticated + abuse-prone endpoints)
export const waitlistIpLimiter = makeLimiter(5, "1 h");
export const applyIpLimiter = makeLimiter(5, "1 h");
export const brandsApplyIpLimiter = makeLimiter(5, "1 h");
export const messagesSendIpLimiter = makeLimiter(120, "1 m");

// Per-user limiters (for authenticated endpoints)
export const messagesSendUserLimiter = makeLimiter(30, "1 m");
export const refreshStatsUserLimiter = makeLimiter(10, "1 h");
export const youtubeSyncUserLimiter = makeLimiter(20, "1 h");
export const updateProfileUserLimiter = makeLimiter(30, "1 m");
export const brandBioUserLimiter = makeLimiter(30, "1 m");

export function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function checkLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<{ ok: boolean; retryAfter?: number }> {
  if (!limiter) return { ok: true };
  const res = await limiter.limit(key);
  if (res.success) return { ok: true };
  const retryAfter = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return { ok: false, retryAfter };
}
