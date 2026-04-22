import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkLimit, getIp, waitlistIpLimiter } from "@/lib/rate-limit";

type Body = {
  name?: string;
  email?: string;
  platform?: string;
  handle?: string;
  followers?: string;
  niche?: string;
};

const PLATFORMS = ["TikTok", "Instagram"];
const FOLLOWER_RANGES = [
  "Under 5K",
  "5K–25K",
  "25K–100K",
  "100K–500K",
  "500K+",
];

export async function POST(req: Request) {
  const rl = await checkLimit(waitlistIpLimiter, `waitlist:${getIp(req)}`);
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const body = (await req.json()) as Body;
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const platform = (body.platform ?? "").trim();
  const handle = (body.handle ?? "").trim();
  const followers = (body.followers ?? "").trim();
  const niche = (body.niche ?? "").trim();

  if (!name || !email || !platform || !handle || !followers) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "That email doesn't look right." },
      { status: 400 }
    );
  }
  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
  }
  if (!FOLLOWER_RANGES.includes(followers)) {
    return NextResponse.json(
      { error: "Invalid follower range." },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("creator_waitlist").insert({
    name,
    email,
    platform,
    handle,
    follower_range: followers,
    niche: niche || null,
  });

  if (error) {
    const msg = error.message ?? "Insert failed.";
    const status = /duplicate|unique/i.test(msg) ? 409 : 500;
    return NextResponse.json(
      {
        error:
          status === 409
            ? "You're already on the waitlist."
            : "Could not join the waitlist.",
      },
      { status }
    );
  }

  return NextResponse.json({ ok: true });
}
