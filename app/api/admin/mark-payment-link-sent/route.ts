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
    .select(
      `brand_agreed_${format}, creator_agreed_${format}, payment_link_sent_${format}, paid_${format}`
    )
    .eq("id", conversationId)
    .single();
  if (readErr || !conv)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brandOffered = (conv as Record<string, unknown>)[
    `brand_agreed_${format}`
  ];
  const creatorAgreed = (conv as Record<string, unknown>)[
    `creator_agreed_${format}`
  ];
  const alreadySent = (conv as Record<string, unknown>)[
    `payment_link_sent_${format}`
  ];
  const alreadyPaid = (conv as Record<string, unknown>)[`paid_${format}`];
  if (!brandOffered || !creatorAgreed)
    return NextResponse.json(
      { error: "Both parties must have agreed" },
      { status: 400 }
    );
  if (alreadyPaid)
    return NextResponse.json(
      { error: "Already marked paid" },
      { status: 400 }
    );
  if (alreadySent)
    return NextResponse.json({ ok: true, alreadySet: true });

  const { error } = await supabase
    .from("conversations")
    .update({
      [`payment_link_sent_${format}`]: true,
      [`payment_link_sent_${format}_at`]: new Date().toISOString(),
    })
    .eq("id", conversationId);
  if (error)
    return NextResponse.json(
      { error: error.message ?? "Failed" },
      { status: 500 }
    );

  return NextResponse.json({ ok: true });
}
