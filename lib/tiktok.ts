import crypto from "crypto";

const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER_INFO_URL =
  "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,avatar_large_url,display_name,profile_deep_link,follower_count,following_count,likes_count,video_count";
const TIKTOK_VIDEO_LIST_URL =
  "https://open.tiktokapis.com/v2/video/list/?fields=id,create_time,view_count,like_count,comment_count,share_count";

export const TIKTOK_SCOPES =
  "user.info.basic,user.info.profile,user.info.stats,video.list";
export const TIKTOK_COOKIE = "inlook_tiktok";
export const TIKTOK_STATE_COOKIE = "inlook_tiktok_state";

type EnvBundle = { key: string; secret: string; signingSecret: string };

function env(): EnvBundle {
  const key = process.env.TIKTOK_SANDBOX_KEY;
  const secret = process.env.TIKTOK_SANDBOX_SECRET;
  const signingSecret = process.env.NEXTAUTH_SECRET;
  if (!key || !secret || !signingSecret) {
    throw new Error(
      "TikTok env missing. Require TIKTOK_SANDBOX_KEY, TIKTOK_SANDBOX_SECRET, NEXTAUTH_SECRET."
    );
  }
  return { key, secret, signingSecret };
}

export function redirectUriFrom(req: Request): string {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}/api/tiktok/callback`;
}

/* ─── PKCE ─────────────────────────────────────────────── */

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = base64url(crypto.randomBytes(48));
  const challenge = base64url(
    crypto.createHash("sha256").update(verifier).digest()
  );
  return { verifier, challenge };
}

/* ─── State cookie HMAC ────────────────────────────────── */

export function signState(state: string, verifier: string): string {
  const { signingSecret } = env();
  const payload = `${state}.${verifier}`;
  const mac = base64url(
    crypto.createHmac("sha256", signingSecret).update(payload).digest()
  );
  return `${state}.${verifier}.${mac}`;
}

export function verifyState(
  signed: string
): { state: string; verifier: string } | null {
  const { signingSecret } = env();
  const parts = signed.split(".");
  if (parts.length !== 3) return null;
  const [state, verifier, mac] = parts;
  const expected = base64url(
    crypto
      .createHmac("sha256", signingSecret)
      .update(`${state}.${verifier}`)
      .digest()
  );
  if (
    mac.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }
  return { state, verifier };
}

/* ─── Session cookie (signed JSON) ─────────────────────── */

export type TikTokSession = {
  openId: string;
  displayName: string | null;
  username: string | null;
  profileDeepLink: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  likesCount: number | null;
  videoCount: number | null;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
};

export function signCookie(payload: TikTokSession): string {
  const { signingSecret } = env();
  const body = base64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const mac = base64url(
    crypto.createHmac("sha256", signingSecret).update(body).digest()
  );
  return `${body}.${mac}`;
}

export function verifyCookie(raw: string | undefined): TikTokSession | null {
  if (!raw) return null;
  const { signingSecret } = env();
  const parts = raw.split(".");
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = base64url(
    crypto.createHmac("sha256", signingSecret).update(body).digest()
  );
  if (
    mac.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const json = Buffer.from(
      body.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    return JSON.parse(json) as TikTokSession;
  } catch {
    return null;
  }
}

/* ─── OAuth flow ───────────────────────────────────────── */

export function buildAuthUrl(
  state: string,
  codeChallenge: string,
  redirectUri: string
): string {
  const { key } = env();
  const qs = new URLSearchParams({
    client_key: key,
    response_type: "code",
    scope: TIKTOK_SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `${TIKTOK_AUTHORIZE_URL}?${qs.toString()}`;
}

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  open_id?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeCode(
  code: string,
  verifier: string,
  redirectUri: string
): Promise<TokenResponse> {
  const { key, secret } = env();
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: key,
      client_secret: secret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });
  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const { key, secret } = env();
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: new URLSearchParams({
      client_key: key,
      client_secret: secret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  return (await res.json()) as TokenResponse;
}

/* ─── User info & video aggregation ────────────────────── */

export type TikTokUserInfo = {
  openId: string;
  displayName: string | null;
  username: string | null;
  profileDeepLink: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
  likesCount: number | null;
  videoCount: number | null;
};

export async function fetchUserInfo(
  accessToken: string
): Promise<TikTokUserInfo | null> {
  const res = await fetch(TIKTOK_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const raw = await res.text();
  let data: {
    data?: {
      user?: {
        open_id?: string;
        display_name?: string;
        profile_deep_link?: string;
        avatar_url?: string;
        avatar_large_url?: string;
        follower_count?: number;
        likes_count?: number;
        video_count?: number;
      };
    };
    error?: { code?: string; message?: string; log_id?: string };
  } = {};
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("[tiktok/user_info] non-JSON response", res.status, raw.slice(0, 400));
    return null;
  }
  const u = data?.data?.user;
  if (!u?.open_id) {
    console.error(
      "[tiktok/user_info] no open_id in response",
      res.status,
      JSON.stringify(data).slice(0, 600)
    );
    return null;
  }
  return {
    openId: u.open_id,
    displayName: u.display_name ?? null,
    username: null,
    profileDeepLink: u.profile_deep_link ?? null,
    avatarUrl: u.avatar_large_url ?? u.avatar_url ?? null,
    followerCount: u.follower_count ?? null,
    likesCount: u.likes_count ?? null,
    videoCount: u.video_count ?? null,
  };
}

export type VideoAggregate = {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  likes30d: number;
  comments30d: number;
  shares30d: number;
  views30d: number;
  avgEngagementRate: number | null;
  engagementRate30d: number | null;
};

const MAX_PAGES = 10;
const PAGE_SIZE = 20;

export async function fetchVideoAggregate(
  accessToken: string
): Promise<VideoAggregate> {
  const thirtyDaysAgoSec =
    Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalViews = 0;
  let likes30d = 0;
  let comments30d = 0;
  let shares30d = 0;
  let views30d = 0;

  let cursor: number | undefined;
  let pages = 0;

  while (pages < MAX_PAGES) {
    const body: Record<string, unknown> = { max_count: PAGE_SIZE };
    if (cursor != null) body.cursor = cursor;
    const res = await fetch(TIKTOK_VIDEO_LIST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      data?: {
        videos?: Array<{
          id?: string;
          create_time?: number;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          share_count?: number;
        }>;
        cursor?: number;
        has_more?: boolean;
      };
      error?: { code?: string; message?: string };
    };

    const videos = data?.data?.videos ?? [];
    for (const v of videos) {
      const views = v.view_count ?? 0;
      const likes = v.like_count ?? 0;
      const comments = v.comment_count ?? 0;
      const shares = v.share_count ?? 0;
      totalViews += views;
      totalLikes += likes;
      totalComments += comments;
      totalShares += shares;
      if ((v.create_time ?? 0) >= thirtyDaysAgoSec) {
        views30d += views;
        likes30d += likes;
        comments30d += comments;
        shares30d += shares;
      }
    }

    pages += 1;
    if (!data?.data?.has_more || data.data.cursor == null) break;
    cursor = data.data.cursor;
  }

  const avgEngagementRate =
    totalViews > 0
      ? Math.min(
          ((totalLikes + totalComments + totalShares) / totalViews) * 100,
          100
        )
      : null;
  const engagementRate30d =
    views30d > 0
      ? Math.min(
          ((likes30d + comments30d + shares30d) / views30d) * 100,
          100
        )
      : null;

  return {
    totalLikes,
    totalComments,
    totalShares,
    totalViews,
    likes30d,
    comments30d,
    shares30d,
    views30d,
    avgEngagementRate,
    engagementRate30d,
  };
}
