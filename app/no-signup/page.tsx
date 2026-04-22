import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Apply to Join · Inlook",
};

export default function NoSignupPage() {
  return (
    <section className="relative flex min-h-dvh items-center justify-center">
      <div
        aria-hidden
        className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div className="relative mx-auto max-w-md px-6 py-20 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-10 font-display text-3xl font-normal leading-snug tracking-tight text-ink-50 sm:text-4xl">
          You can&apos;t sign up — you need to apply.
        </h1>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-ink-300">
          Inlook is invite-only. Creators apply to join the network. Brands get
          early access by request.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/apply" className="btn-primary">
            Apply as a Creator
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link href="/brands" className="btn-secondary">
            Get Brand Access
          </Link>
        </div>
      </div>
    </section>
  );
}
