import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Trophy, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "For creators · Inlook",
  description:
    "List your rate, own your numbers. Join the founding creator cohort at Inlook.",
};

const BENEFITS: {
  icon: typeof ShieldCheck;
  title: string;
  bullets: string[];
}[] = [
  {
    icon: ShieldCheck,
    title: "A verified-stats badge.",
    bullets: [
      "Your engagement rate pulled from the source",
      "Lower offer—deal time",
    ],
  },
  {
    icon: Trophy,
    title: "Build a deal history.",
    bullets: ["Build an Inlook-verified deal history record"],
  },
  {
    icon: Sparkles,
    title: "Founding creator perks.",
    bullets: [
      "Start building your profile record",
      "Direct contact to us if something breaks",
    ],
  },
];

export default function JoinPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <div className="container-x relative pt-16 pb-16 sm:pt-24 sm:pb-20">
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-16">
            <div>
              <p className="eyebrow">For creators</p>
              <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-6xl lg:text-[80px]">
                List <em className="italic text-accent">your</em> rate.
              </h1>
              <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
                Stop negotiating in DMs. Set your rate once, let your real
                engagement do the talking.
              </p>
            </div>
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-accent/10 blur-3xl"
              />
              <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
                <p className="eyebrow">Join the waitlist</p>
                <h2 className="mt-3 font-display text-2xl font-normal leading-snug tracking-tight text-ink-50">
                  Claim your founding-creator spot.
                </h2>
                <form
                  action="/apply"
                  method="GET"
                  className="mt-6 flex flex-col gap-3 sm:flex-row"
                >
                  <label className="sr-only" htmlFor="join-name">
                    Your creator name
                  </label>
                  <input
                    id="join-name"
                    name="name"
                    type="text"
                    autoComplete="nickname"
                    placeholder="Your creator name"
                    className="h-12 w-full flex-1 rounded-full border border-ink-700 bg-ink-850 px-5 font-sans text-sm text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <button
                    type="submit"
                    className="btn-primary h-12 px-6 text-[13px]"
                  >
                    Apply to join
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </form>
                <ul className="mt-6 space-y-2 border-t border-ink-800 pt-5 font-sans text-sm text-ink-200">
                  {[
                    "No negotiating with brands",
                    "Approve the brands you match with",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-[8px] h-1 w-1 flex-none rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="container-x py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Why creators list here</p>
            <h2 className="mt-4 font-display text-3xl font-normal tracking-tight text-ink-50 sm:text-5xl">
              Show brands <em className="italic text-accent">exactly</em> what they&apos;re looking for.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, bullets }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-3xl border border-ink-800 bg-ink-900 p-7 transition-colors duration-300 hover:border-ink-700"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
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
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="container-x pb-28">
          <div className="relative overflow-hidden rounded-3xl border border-ink-800 bg-gradient-to-br from-ink-900 via-ink-900 to-ink-850 p-8 sm:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 85% 30%, rgba(74,144,255,0.14), transparent 50%)",
              }}
            />
            <div className="relative grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <p className="eyebrow">A note from the team</p>
                <p className="mt-5 font-display text-2xl font-normal leading-snug tracking-tight text-ink-50 sm:text-3xl">
                  &ldquo;We&apos;re trying to build the tool we wanted back when
                  we were builders ourselves — more exposure, more deals.&rdquo;
                </p>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-50">
                  — Z &amp; Gabe, Inlook founders
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link href="/apply" className="btn-primary">
                  Apply
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
