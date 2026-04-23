import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { supabase } from "@/lib/supabase";
import { sendBrandWelcomeEmail } from "@/lib/email";
import { requestOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function POST(req: Request) {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brandId } = (await req.json()) as { brandId: string };

  const { error: verifyError } = await supabase
    .from("brands")
    .update({ verified: true, rejected: false })
    .eq("id", brandId);

  if (verifyError)
    return NextResponse.json(
      { error: verifyError.message },
      { status: 500 }
    );

  const { data: brand } = await supabase
    .from("brands")
    .select("email, business_name")
    .eq("id", brandId)
    .single();

  if (!brand)
    return NextResponse.json({ success: true, invited: false });

  const baseUrl = requestOrigin(req);
  let inviteUrl = `${baseUrl}/sign-in`;

  try {
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: brand.email,
      redirectUrl: `${baseUrl}/dashboard`,
      notify: false,
      publicMetadata: {
        role: "brand",
      },
    });
    if (invitation.url) {
      const ticket = new URL(invitation.url).searchParams.get("ticket");
      inviteUrl = ticket
        ? `${baseUrl}/sign-up?__clerk_ticket=${ticket}&redirect_url=${encodeURIComponent(`${baseUrl}/dashboard`)}`
        : invitation.url;
    }
  } catch (err) {
    console.error("[verify] Clerk invitation failed:", err);
  }

  try {
    await sendBrandWelcomeEmail(brand.email, brand.business_name, inviteUrl);
  } catch (emailErr) {
    console.error("[verify] Welcome email failed:", emailErr);
    return NextResponse.json({ success: true, emailSent: false });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
