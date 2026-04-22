import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — $0 for brands, 15% platform fee for creators",
  description:
    "Free for brands. Creators keep 85% of every deal. No subscriptions, no agency markup. Stripe Connect auto-splits payments at the time of purchase.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing — $0 for brands, 15% platform fee for creators · Inlook",
    description:
      "Free for brands. Creators keep 85% of every deal. Stripe Connect auto-split.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <section className="relative">
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">Pricing</p>
          <h1 className="mt-4 font-display text-4xl font-normal tracking-tight text-ink-50 sm:text-5xl">
            Simple, transparent pricing.
          </h1>
          <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-ink-300">
            Inlook is free to join for both brands and creators. We only make
            money when you do &mdash; a single platform fee is deducted at the
            moment of payment. No subscriptions, no hidden costs.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <PricingCard
              label="For brands"
              price="$0"
              priceSuffix=""
              headline="Free to use."
              points={[
                "Free to apply and browse the creator network.",
                "Free to message verified creators.",
                "You only pay the amount you agree to with the creator.",
                "No subscription, no per-seat fees.",
              ]}
            />
            <PricingCard
              label="For creators"
              price="15%"
              priceSuffix="platform fee"
              headline="Keep 85% of every deal."
              points={[
                "Free to apply and list your verified profile.",
                "85% of every deal is paid directly to your Stripe account.",
                "Payment processing fees are covered by Inlook.",
                "No upfront costs, no monthly minimums.",
              ]}
              accent
            />
          </div>

          <div className="mt-16">
            <h2 className="font-display text-2xl font-medium tracking-tight text-ink-50 sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-8 space-y-6 font-sans text-[15px] leading-relaxed text-ink-200">
              <Faq q="How do payments work?">
                Payments are handled through Stripe Connect. Once both sides
                accept a deal format, the brand pays through a secure Stripe
                link. Stripe automatically splits the payment: 85% goes
                directly to the creator&rsquo;s connected Stripe account, and
                15% goes to Inlook. One transaction, automatic split.
              </Faq>

              <Faq q="When is the platform fee deducted?">
                At the moment of payment. The split happens automatically
                inside Stripe, so creators never &ldquo;owe&rdquo; Inlook
                anything after the fact &mdash; the 85% you receive is yours
                to keep.
              </Faq>

              <Faq q="Are there any other fees?">
                No. Stripe&rsquo;s payment-processing fees (around 2.9% + 30&cent;)
                are covered by Inlook&rsquo;s 15%. Creators see the full 85%
                of the agreed deal value in their Stripe account &mdash; no
                surprise deductions.
              </Faq>

              <Faq q="When do creators get paid?">
                Stripe typically pays out to a creator&rsquo;s bank account
                within 2&ndash;7 business days of the transaction, depending
                on your country and Stripe payout schedule. You can track the
                status of every payout in your Stripe dashboard.
              </Faq>

              <Faq q="Do I have to use Stripe?">
                Yes &mdash; all deals facilitated through Inlook settle through
                Stripe Connect so we can guarantee verified payment,
                transparent splits, and a single source of truth for both
                sides. Creators set up a Stripe account during onboarding (it
                takes a few minutes).
              </Faq>

              <Faq q="What about refunds or disputes?">
                Because each deal is a direct agreement between the brand and
                the creator, refund and revision policy is set during
                negotiation in Inlook&rsquo;s messaging. Inlook&rsquo;s role
                is to facilitate payment, not to arbitrate creative disputes.
                Stripe&rsquo;s chargeback protections apply to the underlying
                payment. See our{" "}
                <Link href="/terms" className="text-accent">
                  Terms of Service
                </Link>{" "}
                for full details.
              </Faq>

              <Faq q="Will pricing change in the future?">
                We&rsquo;ll give at least 30 days&rsquo; notice before any
                change to the platform fee, and the rate in effect when a
                deal is agreed is the rate that applies to that deal.
              </Faq>
            </div>
          </div>

          <div className="mt-16 rounded-3xl border border-ink-800 bg-ink-900 p-8 shadow-card sm:p-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
              Heads up
            </p>
            <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-200">
              Stripe Connect integration is rolling out shortly. Early
              launch deals may be coordinated directly between brand and
              creator while Stripe is being finalized &mdash; the 85/15 split
              still applies, and we&rsquo;ll email both sides with settlement
              instructions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  label,
  price,
  priceSuffix,
  headline,
  points,
  accent,
}: {
  label: string;
  price: string;
  priceSuffix: string;
  headline: string;
  points: string[];
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border bg-ink-900 p-8 shadow-card sm:p-10 ${
        accent ? "border-accent/40" : "border-ink-800"
      }`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-300">
        {label}
      </p>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-5xl font-normal tracking-tight text-ink-50">
          {price}
        </span>
        {priceSuffix ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            {priceSuffix}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-200">
        {headline}
      </p>
      <ul className="mt-6 space-y-3">
        {points.map((p) => (
          <li
            key={p}
            className="flex items-start gap-3 font-sans text-sm leading-relaxed text-ink-200"
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                accent ? "bg-accent" : "bg-ink-400"
              }`}
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-lg font-medium tracking-tight text-ink-50">
        {q}
      </h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}
