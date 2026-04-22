import type { Metadata } from "next";
import { Suspense } from "react";
import { ApplyClient } from "./apply-client";

export const metadata: Metadata = {
  title: "Apply · Inlook",
  description:
    "Apply to join Inlook as a creator. Submit your application and connect your YouTube account for verified stats.",
};

export default function ApplyPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div className="container-x relative pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Creator application</p>
            <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-6xl lg:text-[72px]">
              Apply to join{" "}
              <em className="italic text-accent">Inlook.</em>
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
              Tell us about your channel. Connect your YouTube account so we
              can verify your stats. We review every application by hand —
              approvals typically go out within 48 hours.
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <ApplyClient />
      </Suspense>
    </>
  );
}
