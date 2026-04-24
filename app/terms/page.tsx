import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Inlook Terms of Service. Marketplace rules, fees, FTC disclosure obligations, limitation of liability, and governing law.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
  return (
    <section className="relative">
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 font-display text-4xl font-normal tracking-tight text-ink-50 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Effective date: April 22, 2026 · Last updated: April 23, 2026
          </p>

          <div className="mt-10 space-y-8 font-sans text-[15px] leading-relaxed text-ink-200">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
              and use of the Inlook website, creator network, brand dashboard,
              and messaging tools (together, the &ldquo;Service&rdquo;). By
              creating an account, connecting your YouTube or TikTok account, submitting
              a brand application, or otherwise using the Service, you agree to
              these Terms and our{" "}
              <Link href="/privacy" className="text-accent">
                Privacy Policy
              </Link>
              . If you do not agree, do not use the Service.
            </p>

            <Section title="1. Who may use the Service">
              <p>
                You must be at least 18 years old and legally able to enter
                into a binding contract. If you are using the Service on behalf
                of a business, you represent that you are authorized to bind
                that business, and &ldquo;you&rdquo; refers to that business.
              </p>
            </Section>

            <Section title="2. Accounts">
              <p>
                Creator and brand accounts are invitation-only. Accounts are
                created through our verification flow (creator application or
                brand application) and activated through an email invitation
                sent by our authentication provider. You are responsible for
                keeping your credentials secure, for all activity on your
                account, and for notifying us promptly at{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>{" "}
                if you suspect unauthorized access. Account sharing is
                prohibited.
              </p>
            </Section>

            <Section title="3. What the Service does (and what it does not)">
              <p>
                Inlook is a marketplace that helps brands discover verified
                YouTube and TikTok creators and communicate with them about paid
                product-launch sponsorships. Inlook provides profile hosting,
                analytics verification, messaging, and (where applicable)
                payment facilitation.
              </p>
              <p>
                <strong>Inlook is not a party to any agreement between a brand
                and a creator.</strong> The actual sponsorship agreement
                &mdash; including deliverables, deadlines, exclusivity,
                usage rights, and any other commercial terms &mdash; is a
                direct contract between the brand and the creator. Inlook
                does not act as an agent, talent manager, or employer of
                creators, and does not guarantee any outcome, traffic,
                conversion, or return on investment.
              </p>
              <p>
                <strong>Administrator access.</strong> You acknowledge that
                Inlook administrators (authorized Inlook personnel) can view
                all account data, including verified engagement and analytics
                metrics (e.g. subscriber counts, subscriber growth, average
                view rate, engagement rate, view totals), profile information,
                pricing, contact emails, and message content, for purposes of
                operating and moderating the Service, verifying accounts,
                resolving disputes, and complying with legal obligations.
                Administrator access is limited to authorized personnel.
              </p>
            </Section>

            <Section title="4. Platform integrations (YouTube and TikTok)">
              <p>
                Connecting at least one supported platform account (YouTube
                and/or TikTok) is optional but required to publish a
                verified creator profile on Inlook. Creators may connect
                either platform, or both; the platform(s) they connect
                determine which verified metrics appear on the creator
                network.
              </p>
              <p>
                <strong>YouTube.</strong> By connecting, you grant Inlook
                read-only access to your YouTube channel data and analytics
                through the Google OAuth flow (<code>youtube.readonly</code>{" "}
                and <code>yt-analytics.readonly</code> scopes). You may
                revoke access at any time at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  myaccount.google.com/permissions
                </a>
                . Your use of YouTube data through our Service is subject
                to the{" "}
                <a
                  href="https://www.youtube.com/t/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  YouTube Terms of Service
                </a>{" "}
                and the{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Google Privacy Policy
                </a>
                .
              </p>
              <p>
                <strong>TikTok.</strong> By connecting, you grant Inlook
                read-only access to your TikTok account data and public
                video metrics through TikTok Login Kit (OAuth 2.0 with
                PKCE) under the <code>user.info.basic</code>,{" "}
                <code>user.info.profile</code>, <code>user.info.stats</code>
                , and <code>video.list</code> scopes. Inlook does not post
                on your behalf, does not access private videos, and does
                not request publish or write scopes. You may revoke access
                at any time at{" "}
                <a
                  href="https://www.tiktok.com/setting/connected-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  tiktok.com/setting/connected-apps
                </a>{" "}
                (or, in the TikTok mobile app: Settings and privacy
                &rarr; Security and permissions &rarr; Apps and services
                permissions &rarr; choose Inlook &rarr; click &ldquo;Remove
                access&rdquo;). To also have Inlook delete the cached
                TikTok fields (tokens, display name, avatar URL, follower
                count, video aggregates, profile deep link) from our
                records, email{" "}
                <a
                  href="mailto:support@inlookdeals.com"
                  className="text-accent"
                >
                  support@inlookdeals.com
                </a>{" "}
                from the address on file &mdash; see our{" "}
                <a href="/privacy" className="text-accent">
                  Privacy Policy &sect; 5
                </a>{" "}
                for full procedure and timelines. Your use of TikTok data
                through our Service is subject to the{" "}
                <a
                  href="https://www.tiktok.com/legal/page/global/terms-of-service/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  TikTok Terms of Service
                </a>
                , the{" "}
                <a
                  href="https://developers.tiktok.com/doc/tiktok-api-terms-of-service/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  TikTok API Terms of Service
                </a>
                , and the{" "}
                <a
                  href="https://www.tiktok.com/legal/page/global/privacy-policy/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  TikTok Privacy Policy
                </a>
                .
              </p>
              <p>
                Revoking access on either platform may remove you from the
                creator network if the revoked platform is your only
                connected account; reconnecting (or connecting the other
                platform) restores eligibility.
              </p>
            </Section>

            <Section title="5. Creator obligations — FTC disclosure">
              <p>
                <strong>
                  Creators must clearly and conspicuously disclose that any
                  sponsored content produced through Inlook is an
                  advertisement.
                </strong>{" "}
                This is required by the U.S. Federal Trade Commission&rsquo;s
                Endorsement Guides and by similar rules in other jurisdictions.
                At minimum, creators must include the{" "}
                <code>#ad</code> hashtag (or an equivalent clear disclosure
                such as <code>#sponsored</code> or
                &ldquo;Paid partnership with [Brand]&rdquo;) in a place where
                viewers are likely to see it &mdash; for example, in the first
                line of the video description, in on-screen text near the
                start of the video, and/or in the spoken introduction.
                &ldquo;<code>#ad</code>&rdquo; buried at the end of a long
                description, hidden under a &ldquo;more&rdquo; fold, or
                included only in hashtag soup does not satisfy this
                requirement.
              </p>
              <p>
                Creators are solely responsible for their compliance with
                applicable advertising, endorsement, and consumer-protection
                laws in their country of residence and the country the content
                is aimed at. Failure to disclose may result in removal from
                the Inlook network, forfeiture of fees, and personal liability
                to regulators or affected brands. Creators agree to indemnify
                Inlook (see Section 13) for any claim arising from a failure to
                disclose a paid partnership.
              </p>
            </Section>

            <Section title="6. Brand obligations">
              <p>
                Brands must provide accurate business information, own or be
                authorized to promote the products or services they link to,
                and comply with applicable laws (including advertising,
                consumer-protection, and intellectual-property law). Brands
                must not use the Service to promote illegal products,
                age-restricted products to minors, misleading claims, or
                content that violates the YouTube or TikTok Terms of Service or
                Community Guidelines.
              </p>
            </Section>

            <Section title="7. Acceptable use">
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Use the Service for any unlawful, deceptive, harassing, or harmful purpose.</li>
                <li>Impersonate another person, brand, or creator, or misrepresent your affiliation.</li>
                <li>Upload content that infringes intellectual-property rights, violates privacy, or contains malware.</li>
                <li>Scrape, reverse-engineer, or access the Service by automated means, except publicly available pages via normal search-engine crawlers.</li>
                <li>Use messaging to send spam, unsolicited bulk offers, or off-platform recruitment that bypasses Inlook.</li>
                <li>Circumvent Inlook to avoid platform fees on deals that originated through the Service.</li>
                <li>Interfere with the Service&rsquo;s security, availability, or integrity.</li>
              </ul>
            </Section>

            <Section title="8. User content">
              <p>
                You retain ownership of the content you submit (bios,
                messages, profile data, uploaded images). You grant Inlook a
                worldwide, non-exclusive, royalty-free license to host,
                display, and transmit your content solely to operate and
                promote the Service. You represent that you have the rights to
                grant that license. We may remove content that violates these
                Terms or applicable law.
              </p>
            </Section>

            <Section title="9. Fees and payments">
              <p>
                Applying to Inlook is free for creators and brands. Inlook
                charges a platform fee equal to 15% of the agreed deal value
                on transactions facilitated through the Service. The platform
                fee is deducted automatically at the time of payment via
                Stripe Connect: 85% of the agreed deal value is paid directly
                to the creator&rsquo;s connected Stripe account and 15% is
                retained by Inlook as its platform fee. Inlook&rsquo;s
                platform fee covers standard Stripe payment-processing fees;
                creators receive 85% of the agreed deal value with no
                additional deductions by Inlook. Payment processing itself is
                performed by Stripe, and your use of Stripe Connect is also
                governed by Stripe&rsquo;s{" "}
                <a
                  href="https://stripe.com/connect-account/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Connected Account Agreement
                </a>{" "}
                and Services Agreement.
              </p>
              <p>
                <strong>Refunds.</strong> Because Inlook is not a party to the
                underlying sponsorship agreement between the brand and the
                creator, refund eligibility is determined by the terms the
                brand and creator agree to between themselves. Once a
                sponsorship payment has been settled to the creator&rsquo;s
                Stripe account, Inlook does not unilaterally reverse payments.
                If the parties agree to a refund, the creator may initiate the
                refund from their Stripe dashboard; Inlook&rsquo;s 15%
                platform fee on the refunded portion is returned in the same
                transaction.
              </p>
              <p>
                <strong>Chargebacks and disputes.</strong> If a brand files a
                chargeback or payment dispute with its card issuer, Stripe
                will debit the disputed amount (plus any dispute fees) from
                the creator&rsquo;s Stripe balance while the dispute is under
                review. The creator is responsible for submitting evidence to
                Stripe. If the creator wins the dispute, the funds (less
                Stripe&rsquo;s non-refundable dispute fee, which Inlook does
                not absorb) are returned to the creator. If the brand wins,
                the disputed amount stays with the brand and Inlook will
                return its 15% platform fee on the disputed portion.
              </p>
              <p>
                <strong>Good-faith disputes.</strong> If a brand and creator
                cannot resolve a dispute between themselves, either party may
                email{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>{" "}
                within 30 days of the disputed event. Inlook may, at its sole
                discretion, offer mediation, freeze a pending payout, or
                reverse its platform fee, but Inlook has no obligation to
                adjudicate the underlying commercial dispute and is not liable
                for the outcome.
              </p>
            </Section>

            <Section title="10. Third-party services and links">
              <p>
                The Service integrates with third-party services, including
                Google/YouTube, TikTok, Clerk, Supabase, and (in the future) Stripe.
                Your use of those services is governed by their own terms and
                privacy policies. We are not responsible for third-party
                services or for content linked from the Service.
              </p>
            </Section>

            <Section title="11. Service availability">
              <p>
                The Service is provided on an &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; basis. We do not guarantee any
                particular uptime, and we may change, suspend, or discontinue
                features at any time. We will use commercially reasonable
                efforts to notify users of material changes.
              </p>
            </Section>

            <Section title="12. Disclaimers">
              <p>
                <strong>In plain English:</strong> Inlook is a marketplace, not
                a guarantor. We cannot promise that any brand-creator deal
                will succeed, that a creator&rsquo;s content will convert, or
                that third-party data (like YouTube or TikTok analytics) is always
                perfectly current or error-free. The Service is provided
                &ldquo;as is.&rdquo;
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, INLOOK DISCLAIMS ALL
                WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY
                OF DATA PROVIDED BY THIRD PARTIES (INCLUDING YOUTUBE AND
                TIKTOK), AND THE RESULT OF ANY DEAL BETWEEN A BRAND AND A
                CREATOR. Verified analytics reflect data reported to us by
                the YouTube and TikTok APIs at the time of sync and may not
                reflect real-time values.
              </p>
            </Section>

            <Section title="13. Limitation of liability">
              <p>
                <strong>In plain English:</strong> If something goes wrong
                with the Service, Inlook&rsquo;s financial responsibility to
                you is capped. We are not responsible for knock-on losses like
                lost profits, lost deals, or lost opportunity &mdash; only for
                direct damages, and only up to a fixed cap. The cap is the
                greater of (i) what you paid Inlook in the past 12 months, or
                (ii) USD $100. This kind of cap is standard for software
                services and is a core reason Inlook can offer the Service at
                the price it does.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, INLOOK AND ITS OWNERS,
                OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING LOST PROFITS OR REVENUE, LOSS OF DATA, OR
                LOSS OF GOODWILL, ARISING OUT OF OR RELATING TO THE SERVICE.
                OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM RELATING TO THE
                SERVICE IS LIMITED TO THE GREATER OF (A) THE AMOUNT YOU PAID
                TO INLOOK IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE
                TO THE CLAIM, OR (B) USD $100.
              </p>
            </Section>

            <Section title="14. Indemnification">
              <p>
                You agree to indemnify and hold harmless Inlook and its
                owners, officers, employees, and agents from any claim,
                demand, loss, or expense (including reasonable attorneys&rsquo;
                fees) arising out of: (a) your use of the Service; (b) your
                breach of these Terms; (c) your violation of any third-party
                right, including intellectual-property or privacy rights; (d)
                your failure to disclose sponsored content as required by
                Section 5; or (e) any agreement you enter into with a
                counterparty through the Service.
              </p>
            </Section>

            <Section title="15. Termination">
              <p>
                You may stop using the Service at any time and may request
                account deletion by emailing{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>
                . We may suspend or terminate your access if you violate
                these Terms, put the Service or other users at risk, or for
                any reason at our reasonable discretion. Sections 5, 8, 12,
                13, 14, 16, and 17 survive termination.
              </p>
            </Section>

            <Section title="16. Governing law and disputes">
              <p>
                These Terms are governed by the laws of the State of New
                Jersey, without regard to its conflict-of-laws principles.
                Any dispute arising out of or relating to these Terms or the
                Service will be resolved exclusively in the state or federal
                courts located in Essex County, New Jersey, and you consent
                to personal jurisdiction and venue there.
              </p>
            </Section>

            <Section title="17. Changes to these Terms">
              <p>
                We may update these Terms from time to time. If we make
                material changes, we will notify registered users by email
                and/or by posting a prominent notice on the Service at least
                3 days before the change takes effect. Your continued use of
                the Service after the effective date means you accept the
                updated Terms.
              </p>
            </Section>

            <Section title="18. Miscellaneous">
              <p>
                These Terms, together with the{" "}
                <Link href="/privacy" className="text-accent">
                  Privacy Policy
                </Link>
                , are the entire agreement between you and Inlook about the
                Service. If any provision is held unenforceable, the remaining
                provisions will remain in effect. Our failure to enforce any
                right is not a waiver of that right. You may not assign these
                Terms without our consent; we may assign them in connection
                with a merger, acquisition, or sale of assets. Notices to
                Inlook should be sent to{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </div>
    </section>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-xl font-medium tracking-tight text-ink-50 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
