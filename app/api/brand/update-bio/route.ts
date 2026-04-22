import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { checkLimit, brandBioUserLimiter } from "@/lib/rate-limit";

const MAX_BIO_LENGTH = 500;

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = user.publicMetadata?.role;
  if (role !== "brand")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rl = await checkLimit(brandBioUserLimiter, `brand-bio:${user.id}`);
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many updates. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 30) } }
    );

  const { bio } = (await req.json()) as { bio: string };

  if (typeof bio !== "string")
    return NextResponse.json({ error: "Invalid bio" }, { status: 400 });

  if (bio.length > MAX_BIO_LENGTH)
    return NextResponse.json(
      { error: `Bio must be ${MAX_BIO_LENGTH} characters or less` },
      { status: 400 }
    );

  const { error } = await supabase
    .from("brands")
    .update({ bio })
    .eq("clerk_user_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
