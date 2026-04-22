import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendPolicyUpdateEmail } from "@/lib/email";

type Body = {
  type?: "terms" | "privacy" | "both";
  summary?: string;
};

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.publicMetadata?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { type, summary = "" } = (await req.json()) as Body;
  if (type !== "terms" && type !== "privacy" && type !== "both")
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  if (summary.length > 1000)
    return NextResponse.json(
      { error: "Summary too long" },
      { status: 400 }
    );

  const [{ data: creators }, { data: brands }] = await Promise.all([
    supabase
      .from("creators")
      .select("email, full_name, display_name")
      .not("clerk_user_id", "is", null),
    supabase
      .from("brands")
      .select("email, business_name")
      .not("clerk_user_id", "is", null),
  ]);

  const recipients: { email: string; name: string }[] = [];
  for (const c of creators ?? []) {
    const email = (c.email as string | null)?.trim();
    if (!email) continue;
    const name =
      ((c.display_name as string | null) ??
        (c.full_name as string | null) ??
        "").trim();
    recipients.push({ email, name });
  }
  for (const b of brands ?? []) {
    const email = (b.email as string | null)?.trim();
    if (!email) continue;
    const name = ((b.business_name as string | null) ?? "").trim();
    recipients.push({ email, name });
  }

  const seen = new Set<string>();
  const deduped = recipients.filter((r) => {
    const key = r.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let sent = 0;
  let failed = 0;
  for (const r of deduped) {
    try {
      await sendPolicyUpdateEmail(r.email, r.name, type, summary);
      sent++;
    } catch (err) {
      console.error("[send-policy-update] failed", r.email, err);
      failed++;
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: deduped.length });
}
