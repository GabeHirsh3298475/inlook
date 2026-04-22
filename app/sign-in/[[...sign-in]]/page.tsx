import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In · Inlook",
};

export default function SignInPage() {
  return (
    <section className="relative">
      <div className="container-x flex min-h-[70vh] items-center justify-center py-20">
        <SignIn
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
