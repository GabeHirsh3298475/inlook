import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Body = {
  conversationId?: string;
  format?: "long" | "short";
};

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.publicMetadata?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { conversationId, format } = (await req.json()) as Body;
  if (!conversationId)
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  if (format !== "long" && format !== "short")
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  const { data: conv, error: readErr } = await supabase
    .from("conversations")
    .select(`payment_link_sent_${format}, paid_${format}, creator_id`)
    .eq("id", conversationId)
    .single();
  if (readErr || !conv)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const alreadySent = (conv as Record<string, unknown>)[
    `payment_link_sent_${format}`
  ];
  const alreadyPaid = (conv as Record<string, unknown>)[`paid_${format}`];
  if (!alreadySent)
    return NextResponse.json(
      { error: "Payment link must be sent first" },
      { status: 400 }
    );
  if (alreadyPaid) return NextResponse.json({ ok: true, alreadySet: true });

  const { error } = await supabase
    .from("conversations")
    .update({
      [`paid_${format}`]: true,
      [`paid_${format}_at`]: new Date().toISOString(),
    })
    .eq("id", conversationId);
  if (error)
    return NextResponse.json(
      { error: error.message ?? "Failed" },
      { status: 500 }
    );

  // Increment creator deals_completed counter.
  const creatorId = (conv as Record<string, unknown>).creator_id as
    | string
    | undefined;
  if (creatorId) {
    const { data: creatorRow } = await supabase
      .from("creators")
      .select("deals_completed")
      .eq("id", creatorId)
      .single();
    const current = (creatorRow?.deals_completed as number | null) ?? 0;
    await supabase
      .from("creators")
      .update({ deals_completed: current + 1 })
      .eq("id", creatorId);
  }

  return NextResponse.json({ ok: true });
}
