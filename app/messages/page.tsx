import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MessagesClient } from "./messages-client";

export const metadata: Metadata = {
  title: "Messages · Inlook",
};

export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  if (role !== "brand" && role !== "creator") redirect("/dashboard");

  const sp = await searchParams;
  return (
    <MessagesClient
      role={role as "brand" | "creator"}
      initialThreadId={sp.thread ?? null}
    />
  );
}
