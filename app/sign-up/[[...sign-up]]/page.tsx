import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account · Inlook",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ __clerk_ticket?: string }>;
}) {
  const params = await searchParams;

  // Only allow sign-up via Clerk invitation ticket
  if (!params.__clerk_ticket) {
    redirect("/no-signup");
  }

  return (
    <section className="relative">
      <div className="container-x flex min-h-[70vh] items-center justify-center py-20">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-ink-900 border border-ink-800 shadow-card",
            },
          }}
        />
      </div>
    </section>
  );
}
