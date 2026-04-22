import type { Metadata } from "next";
import { WaitlistClient } from "./waitlist-client";

export const metadata: Metadata = {
  title: "Creator Waitlist · Inlook",
};

export default function WaitlistPage() {
  return (
    <section className="relative">
      <div className="container-x pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">For creators</p>
          <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-6xl">
            Join the <em className="italic text-accent">creator</em> waitlist.
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
            Inlook currently launches with YouTube creators. If you&apos;re
            mostly on TikTok or Instagram, drop your info and we&apos;ll
            reach out when we open up to your verified platform data.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <WaitlistClient />
        </div>
      </div>
    </section>
  );
}
