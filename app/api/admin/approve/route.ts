import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { supabase } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";
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

  const { creatorId } = (await req.json()) as { creatorId: string };

  const { error: approveError } = await supabase
    .from("creators")
    .update({ approved: true })
    .eq("id", creatorId);

  if (approveError)
    return NextResponse.json(
      { error: approveError.message },
      { status: 500 }
    );

  const { data: creator } = await supabase
    .from("creators")
    .select("email, full_name")
    .eq("id", creatorId)
    .single();

  if (!creator)
    return NextResponse.json({ success: true, invited: false });

  const baseUrl = requestOrigin(req);
  let inviteUrl = `${baseUrl}/sign-in`;

  try {
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: creator.email,
      redirectUrl: `${baseUrl}/dashboard`,
      notify: false,
      publicMetadata: {
        role: "creator",
      },
    });
    if (invitation.url) {
      const ticket = new URL(invitation.url).searchParams.get("ticket");
      inviteUrl = ticket
        ? `${baseUrl}/sign-up?__clerk_ticket=${ticket}&redirect_url=${encodeURIComponent(`${baseUrl}/dashboard`)}`
        : invitation.url;
    }
  } catch (err) {
    console.error("[approve] Clerk invitation failed:", err);
  }

  try {
    await sendWelcomeEmail(creator.email, creator.full_name, inviteUrl);
  } catch (emailErr) {
    console.error("[approve] Welcome email failed:", emailErr);
    return NextResponse.json({ success: true, emailSent: false });
  }

  return NextResponse.json({ success: true, emailSent: true });
}
