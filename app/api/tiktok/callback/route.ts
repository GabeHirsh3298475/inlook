import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  fetchUserInfo,
  signCookie,
  TIKTOK_COOKIE,
  TIKTOK_STATE_COOKIE,
  verifyState,
} from "@/lib/tiktok";

function redirect(req: NextRequest, params: Record<string, string>) {
  const url = new URL("/apply", req.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = NextResponse.redirect(url);
  res.cookies.delete(TIKTOK_STATE_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  if (error) return redirect(req, { tiktok: "error", reason: error });
  if (!code || !returnedState)
    return redirect(req, { tiktok: "error", reason: "missing_code" });

  const stateCookie = req.cookies.get(TIKTOK_STATE_COOKIE)?.value;
  const parsed = verifyState(stateCookie ?? "");
  if (!parsed || parsed.state !== returnedState)
    return redirect(req, { tiktok: "error", reason: "bad_state" });

  const tokenRes = await exchangeCode(code, parsed.verifier);
  if (!tokenRes.access_token) {
    console.error("[tiktok/callback] token exchange failed", tokenRes);
    return redirect(req, { tiktok: "error", reason: "token" });
  }

  const info = await fetchUserInfo(tokenRes.access_token);
  if (!info) return redirect(req, { tiktok: "error", reason: "user_info" });

  const cookieValue = signCookie({
    openId: info.openId,
    displayName: info.displayName,
    username: info.username,
    avatarUrl: info.avatarUrl,
    followerCount: info.followerCount,
    likesCount: info.likesCount,
    videoCount: info.videoCount,
    accessToken: tokenRes.access_token,
    refreshToken: tokenRes.refresh_token ?? null,
    expiresAt: Date.now() + (tokenRes.expires_in ?? 3600) * 1000,
  });

  const res = redirect(req, { tiktok: "connected" });
  res.cookies.set(TIKTOK_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 60,
  });
  return res;
}
