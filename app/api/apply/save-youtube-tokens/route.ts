import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "No session" }, { status: 401 });

  const { email } = (await req.json()) as { email: string };
  if (!email) return Response.json({ error: "Missing email" }, { status: 400 });

  // Guard against token-hijacking: only allow writing tokens onto rows that
  // don't already have a clerk_user_id (i.e. the creator hasn't signed up yet).
  // After sign-up, token refresh goes through /api/creator/refresh-stats which
  // is scoped to clerk_user_id.
  const { data: row } = await supabase
    .from("creators")
    .select("id, clerk_user_id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (row?.clerk_user_id) {
    return Response.json(
      { error: "This account is already linked. Reconnect from the dashboard." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("creators")
    .update({
      youtube_access_token: session.accessToken ?? null,
      youtube_refresh_token: session.refreshToken ?? null,
      connected_at: new Date().toISOString(),
    })
    .eq("email", email.toLowerCase())
    .is("clerk_user_id", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
