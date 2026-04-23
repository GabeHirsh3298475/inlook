import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import {
  buildAuthUrl,
  generatePkce,
  redirectUriFrom,
  signState,
  TIKTOK_STATE_COOKIE,
} from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const { verifier, challenge } = generatePkce();
    const url = buildAuthUrl(state, challenge, redirectUriFrom(req));

    const res = NextResponse.redirect(url);
    res.cookies.set(TIKTOK_STATE_COOKIE, signState(state, verifier), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    });
    return res;
  } catch (err) {
    console.error("[tiktok/start]", err);
    return NextResponse.json(
      { error: "TikTok OAuth not configured" },
      { status: 500 }
    );
  }
}
