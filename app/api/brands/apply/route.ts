import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  sendBrandApplicationConfirmation,
  sendBrandApplicationNotification,
} from "@/lib/email";
import { checkLimit, getIp, brandsApplyIpLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const rl = await checkLimit(brandsApplyIpLimiter, `brands-apply:${getIp(req)}`);
  if (!rl.ok)
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );

  const body = (await req.json()) as {
    businessName?: string;
    email?: string;
    productUrl?: string;
    socialUrl?: string;
  };

  const businessName = body.businessName?.trim();
  const email = body.email?.trim();
  const productUrl = body.productUrl?.trim();
  const socialUrl = body.socialUrl?.trim() || null;

  if (!businessName || !email || !productUrl) {
    return NextResponse.json(
      { error: "Business name, email, and product link are required." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { error: insertError } = await supabase.from("brands").insert({
    business_name: businessName,
    email,
    product_url: productUrl,
    social_url: socialUrl,
  });

  if (insertError) {
    console.error("[brands/apply] db insert failed:", insertError);
    return NextResponse.json(
      { error: "Failed to save application." },
      { status: 500 }
    );
  }

  try {
    await sendBrandApplicationConfirmation(email, businessName);
  } catch (err) {
    console.error("[brands/apply] confirmation email failed:", err);
  }

  try {
    await sendBrandApplicationNotification({
      businessName,
      email,
      productUrl,
      socialUrl,
    });
  } catch (err) {
    console.error("[brands/apply] email failed:", err);
  }

  return NextResponse.json({ success: true });
}
