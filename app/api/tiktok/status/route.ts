import { NextRequest, NextResponse } from "next/server";
import { TIKTOK_COOKIE, verifyCookie } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(TIKTOK_COOKIE)?.value;
  const sess = verifyCookie(raw);
  if (!sess) return NextResponse.json({ connected: false });
  return NextResponse.json({
    connected: true,
    openId: sess.openId,
    displayName: sess.displayName,
    username: sess.username,
    avatarUrl: sess.avatarUrl,
    followerCount: sess.followerCount,
  });
}
