import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Body = {
  conversationId?: string;
  who?: "brand" | "creator";
  format?: "long" | "short";
};

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.publicMetadata?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { conversationId, who, format } = (await req.json()) as Body;
  if (!conversationId)
    return NextResponse.json(
      { error: "Missing conversationId" },
      { status: 400 }
    );
  if (who !== "brand" && who !== "creator")
    return NextResponse.json({ error: "Invalid who" }, { status: 400 });
  if (format !== "long" && format !== "short")
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  const column =
    who === "brand"
      ? format === "long"
        ? "brand_agreed_long"
        : "brand_agreed_short"
      : format === "long"
      ? "creator_agreed_long"
      : "creator_agreed_short";
  const timestampColumn = `${column}_at`;

  const { error } = await supabase
    .from("conversations")
    .update({
      [column]: false,
      [timestampColumn]: null,
    })
    .eq("id", conversationId);

  if (error)
    return NextResponse.json(
      { error: error.message ?? "Failed to cancel" },
      { status: 500 }
    );

  return NextResponse.json({ ok: true });
}
