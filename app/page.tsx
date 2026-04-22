import Link from "next/link";
import { ArrowRight, Gauge, Sparkles, ShieldCheck, User } from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";
import { LogoVerifiedBadge } from "@/components/creator-card";
import { PlatformIcon } from "@/components/platform-icon";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueProps />
      <Differentiator />
      <About />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="grid-lines absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      <div className="container-x relative pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-4xl animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-800 bg-ink-900/80 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-200 backdrop-blur">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Open beta · Q2 2026
          </span>
          <h1 className="mt-8 font-display text-[48px] font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-[68px] lg:text-[88px]">
            Connect your brand{" "}
            <span className="italic text-accent">with creators</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
            Creator marketplace with verified engagement data, clear pricing,
            and niche-specific matching.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/brands" className="btn-primary group w-full sm:w-auto">
              I&apos;m a Brand
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/creators"
              className="btn-secondary group w-full border-ink-500 hover:border-ink-400 sm:w-auto"
            >
              I&apos;m a Creator
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </Link>
          </div>
          <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Verified data · Fixed pricing · No negotiation
          </p>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  const props = [
    {
      icon: Gauge,
      title: "Transparent pricing.",
      bullets: ["Creators set their rate", "No negotiating"],
    },
    {
      icon: ShieldCheck,
      title: "Verified engagement.",
      bullets: ["Engagement data pulled from each platform"],
      highlight: true,
    },
    {
      icon: Sparkles,
      title: "Niche-matched creators.",
      bullets: [
        "Paste your product link",
        "Connect with creators who reach your target audience",
      ],
    },
  ];
  return (
    <section className="relative">
      <div className="container-x py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">How Inlook works</p>
          <h2 className="mt-4 font-display text-5xl font-normal tracking-tight text-ink-50 sm:text-6xl lg:text-7xl">
            Why <em className="italic text-blue-400">Inlook</em>?
          </h2>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {props.map(({ icon: Icon, title, bullets, highlight }, i) => (
            <article
              key={title}
              className={`relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-300 ${
                highlight
                  ? "border-accent/40 bg-gradient-to-b from-accent/[0.07] to-transparent"
                  : "border-ink-700 bg-ink-900 hover:border-ink-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                    highlight
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-ink-700 bg-ink-850 text-ink-200"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  0{i + 1}
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
              {highlight ? (
                <div className="mt-6 inline-flex items-center gap-2">
                  <VerifiedBadge label="The core differentiator" size="md" />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Differentiator() {
  return (
    <section className="relative py-4">
      <div className="container-x">
        <div className="overflow-hidden rounded-3xl border border-accent/50 bg-gradient-to-br from-accent/[0.10] via-ink-900 to-ink-900 shadow-[0_0_120px_-20px_rgba(74,144,255,0.35)]">
          <div className="grid gap-0 md:grid-cols-[1.1fr_1fr] md:[&>*]:border-b-0">
            <div className="border-b border-ink-800 p-8 sm:p-12 md:border-b-0 md:border-r">
              <p className="eyebrow">Our differentiator</p>
              <h2 className="mt-4 font-display text-4xl font-medium leading-[1.02] tracking-tight text-ink-50 sm:text-5xl lg:text-[56px]">
                The{" "}
                <em className="italic text-accent">verified engagement</em>{" "}
                badge.
              </h2>
              <p className="mt-5 font-sans text-base leading-relaxed text-ink-300 sm:text-lg">
                One number we refuse to let anyone fake.
              </p>
              <ul className="mt-6 space-y-3 font-sans text-sm text-ink-200">
                {[
                  "Pulled from platform data, not creator self-reports",
                  "Re-checked daily",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex items-center justify-center bg-gradient-to-br from-ink-850 via-ink-900 to-ink-950 p-8 sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 60% 30%, rgba(74,144,255,0.2), transparent 55%)",
                }}
              />
              <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-card">
                {/* Section 1: basic */}
                <header className="flex items-start justify-between gap-3 p-6 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full border border-ink-700 bg-ink-850"
                      aria-hidden
                    >
                      <User
                        className="h-6 w-6 text-ink-300"
                        strokeWidth={1.6}
                      />
                    </div>
                    <h4 className="font-display text-lg font-medium leading-tight tracking-tight text-ink-50">
                      Dev Patel
                    </h4>
                  </div>
                  <span className="rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-200">
                    Tech &amp; Apps
                  </span>
                </header>
                <section className="px-6 pb-5">
                  <p className="eyebrow">Total Followers</p>
                  <p className="mt-1 font-display text-3xl font-medium tracking-tight text-ink-50">
                    120K
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-ink-300">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[11px] text-ink-200">
                      <PlatformIcon platform="TikTok" className="h-3.5 w-3.5" />
                      <span>50K</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[11px] text-ink-200">
                      <PlatformIcon platform="YouTube" className="h-3.5 w-3.5" />
                      <span>70K</span>
                    </span>
                  </div>
                </section>
                <div className="mx-6 h-px bg-ink-800" aria-hidden />
                {/* Section 2: analytics */}
                <section className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">Performance</p>
                    <LogoVerifiedBadge emphasized />
                  </div>
                  <dl className="mt-3 space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-sans text-sm text-ink-300">
                        Avg. View Rate:
                      </dt>
                      <dd className="font-display text-base font-medium tracking-tight text-ink-50">
                        25.6%
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-sans text-sm text-ink-300">
                        Avg. Engagement Rate:
                      </dt>
                      <dd className="font-display text-base font-medium tracking-tight text-ink-50">
                        5.3%
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
          <div className="border-t border-ink-800 bg-ink-950/40 px-8 py-6 sm:px-12 sm:py-7">
            <p className="eyebrow">How we calculate it</p>
            <dl className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-sans text-sm font-medium text-ink-50">
                  Avg. View Rate
                </dt>
                <dd className="mt-2 font-sans text-[13px] leading-relaxed text-ink-300">
                  The average percentage of each video viewers watch.
                </dd>
              </div>
              <div>
                <dt className="font-sans text-sm font-medium text-ink-50">
                  Avg. Engagement Rate
                </dt>
                <dd className="mt-2 flex items-center font-sans text-[13px] leading-relaxed text-ink-300">
                  <span
                    className="inline-flex flex-col items-center align-middle font-mono text-[12px] text-ink-200"
                    aria-label="likes plus comments plus shares, divided by lifetime views"
                  >
                    <span className="px-2 leading-snug">
                      likes + comments + shares
                    </span>
                    <span className="my-0.5 h-px w-full bg-ink-500" aria-hidden />
                    <span className="px-2 leading-snug">lifetime views</span>
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="relative">
      <div className="container-x py-24 sm:py-32">
        <div className="grid gap-14 md:grid-cols-[0.9fr_1.3fr] md:items-start md:gap-20">
          <div>
            <p className="eyebrow">About the founders</p>
            <h2 className="mt-4 font-display text-3xl font-normal leading-[1.05] tracking-tight text-ink-50 sm:text-5xl">
              Built by founders, <em className="italic text-accent">for founders.</em>
            </h2>
          </div>
          <div className="space-y-6 font-sans text-[15px] leading-relaxed text-ink-200 sm:text-base">
            <p>
              We started Inlook after failing product launches because the
              distribution was too difficult. We couldn&apos;t reach our
              intended audience, and we didn&apos;t understand content
              creation.
            </p>
            <p>
              Our mission is to make product launches easier for small brands
              while helping small creators monetize their audience.
            </p>
            <p>– Gabe and Z</p>
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link href="/brands" className="btn-primary">
                Grow your brand
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link href="/network" className="btn-ghost">
                Or browse creators first →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
