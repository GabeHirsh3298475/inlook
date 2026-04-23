import { NextResponse } from "next/server";
import { TIKTOK_COOKIE } from "@/lib/tiktok";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(TIKTOK_COOKIE);
  return res;
}
