"use client";

import { Suspense, useEffect } from "react";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

function SignInTokenInner() {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token || !signIn) return;

    (async () => {
      try {
        const { error } = await signIn.create({
          strategy: "ticket",
          ticket: token,
        });
        if (error) {
          console.error("Magic link error:", error);
          router.push("/sign-in?error=invalid-token");
          return;
        }
        if (signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Magic link error:", err);
        router.push("/sign-in?error=invalid-token");
      }
    })();
  }, [signIn, searchParams, setActive, router]);

  return (
    <div className="text-center">
      <p className="font-display text-lg text-accent">Signing you in...</p>
      <p className="mt-2 font-sans text-sm text-ink-400">
        You&apos;ll be redirected to your dashboard in a moment.
      </p>
    </div>
  );
}

export default function SignInTokenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950">
      <Suspense
        fallback={
          <div className="text-center">
            <p className="font-display text-lg text-ink-300">Loading...</p>
          </div>
        }
      >
        <SignInTokenInner />
      </Suspense>
    </main>
  );
}
