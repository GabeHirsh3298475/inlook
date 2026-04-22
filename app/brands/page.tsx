import type { Metadata } from "next";
import { Link2, ShieldCheck, Handshake, CheckCircle2 } from "lucide-react";
import { BrandApplicationForm } from "@/components/brand-application-form";

export const metadata: Metadata = {
  title: "For brands — Find YouTube creators who move product",
  description:
    "Skip the agency middle layer. Browse verified YouTube creators with real engagement data. Paste a link, verify ownership, close deals in under a week. Free for brands.",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "For brands — Find YouTube creators who move product · Inlook",
    description:
      "Skip the agency middle layer. Browse verified YouTube creators with real engagement data. Free for brands.",
    url: "/brands",
  },
};

const STEPS: {
  icon: typeof Link2;
  title: string;
  bullets: string[];
}[] = [
  {
    icon: Link2,
    title: "Paste your app link.",
    bullets: ["Landing page, App Store, wherever you send traffic"],
  },
  {
    icon: ShieldCheck,
    title: "Verify ownership.",
    bullets: ["We reach out to you to verify you own the business"],
  },
  {
    icon: Handshake,
    title: "Close deals.",
    bullets: [
      "Browse our creator network",
      "Tell them what you're looking for",
      "Close the deal",
    ],
  },
];

export default function BrandsPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div className="container-x relative pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">For brands</p>
            <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-6xl lg:text-7xl">
              Find creators who move{" "}
              <em className="italic text-accent">your</em> product.
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
              Skip the agency middle layer. See real engagement stats. Paste a
              link, verify ownership, pick a creator, run the deal in under a
              week.
            </p>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="container-x pb-12">
          <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 p-8 sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
            />
            <div className="relative">
              <div className="mx-auto max-w-xl text-center">
                <h2 className="font-display text-3xl font-normal leading-snug tracking-tight text-ink-50 sm:text-4xl">
                  Join the brand waitlist.
                </h2>
                <div className="mx-auto mt-8 max-w-md">
                  <BrandApplicationForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="container-x py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
          </div>
          <ol className="mt-16 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, bullets }, i) => (
              <li
                key={title}
                className="relative flex h-full flex-col rounded-3xl border border-ink-800 bg-ink-900 p-7 transition-colors duration-300 hover:border-ink-700"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-200">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                    Step 0{i + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-medium leading-snug tracking-tight text-ink-50">
                  {title}
                </h3>
                <ul className="mt-4 space-y-2 font-sans text-[15px] leading-relaxed text-ink-300">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="mt-[8px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative">
        <div className="container-x pb-28">
          <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div>
              <p className="eyebrow">What brands get</p>
              <h2 className="mt-4 font-display text-3xl font-normal leading-[1.05] tracking-tight text-ink-50 sm:text-4xl">
                Everything you{" "}
                <em className="italic text-accent">actually</em> need.
              </h2>
              <div className="mt-8 rounded-3xl border border-accent/40 bg-ink-900 p-6 shadow-card sm:p-8">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-5xl font-normal tracking-tight text-ink-50 sm:text-6xl">
                    $0
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
                    fees &middot; free subscription
                  </span>
                </div>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink-200">
                  No subscription, no per-seat fees, no agency markup. You
                  pay only what you agree to with the creator.
                </p>
              </div>
            </div>
            <ul className="grid gap-3">
              {[
                "Verified engagement on every creator profile",
                "Flat-rate pricing — no agency markup",
                "Audience overlap warnings if you book two similar creators",
                "One central dashboard for messages, saved creators, and ongoing deals",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-4 py-3 font-sans text-sm text-ink-200"
                >
                  <CheckCircle2
                    className="mt-[2px] h-4 w-4 flex-none text-accent"
                    strokeWidth={1.8}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
