import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email)
    return NextResponse.json({ error: "No email found" }, { status: 400 });

  const { error } = await supabase
    .from("creators")
    .update({ clerk_user_id: user.id })
    .eq("email", email)
    .is("clerk_user_id", null);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
