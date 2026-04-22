import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await currentUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  if (!isAdmin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId, hidden } = (await req.json()) as {
    creatorId: string;
    hidden: boolean;
  };

  const { error } = await supabase
    .from("creators")
    .update({ admin_hidden: hidden })
    .eq("id", creatorId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
