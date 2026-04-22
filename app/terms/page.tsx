import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · Inlook",
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
            Effective date: April 21, 2026 · Last updated: April 21, 2026
          </p>

          <div className="mt-10 space-y-8 font-sans text-[15px] leading-relaxed text-ink-200">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
              and use of the Inlook website, creator network, brand dashboard,
              and messaging tools (together, the &ldquo;Service&rdquo;). By
              creating an account, connecting your YouTube channel, submitting
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
                YouTube creators and communicate with them about paid
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
            </Section>

            <Section title="4. YouTube integration">
              <p>
                Connecting your YouTube channel is optional but required to
                publish a verified creator profile. By connecting, you grant
                Inlook read-only access to your YouTube channel data and
                30-day analytics through the Google OAuth flow. You may revoke
                access at any time at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  myaccount.google.com/permissions
                </a>
                . Revoking access may remove you from the creator network.
                Your use of YouTube data through our Service is also subject
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
            </Section>

            <Section title="5. Creator obligations — FTC disclosure (important)">
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
                content that violates the YouTube Terms of Service or
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
                Applying to Inlook is currently free for creators and brands.
                Inlook plans to charge a platform fee (currently expected to
                be 10% of the transaction value) on deals facilitated through
                the Service. Fees, billing methods, and payment timing will be
                disclosed at the time of the transaction and/or in an
                accompanying order form. Payment processing is handled by
                third-party processors such as Stripe, whose terms will apply
                to the payment itself.{" "}
                <strong>[⚠️ LEGAL REVIEW REQUIRED]</strong> Final fee
                structure, refund policy, and auto-renewal language must be
                reviewed before enabling paid transactions.
              </p>
            </Section>

            <Section title="10. Third-party services and links">
              <p>
                The Service integrates with third-party services, including
                Google/YouTube, Clerk, Supabase, and (in the future) Stripe.
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
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, INLOOK DISCLAIMS ALL
                WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY
                OF DATA PROVIDED BY THIRD PARTIES (INCLUDING YOUTUBE), AND THE
                RESULT OF ANY DEAL BETWEEN A BRAND AND A CREATOR. Verified
                analytics reflect data reported to us by the YouTube APIs at
                the time of sync and may not reflect real-time values.
              </p>
            </Section>

            <Section title="13. Limitation of liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, INLOOK AND ITS OWNERS,
                OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING LOST PROFITS OR REVENUE, LOSS OF DATA, OR
                LOSS OF GOODWILL, ARISING OUT OF OR RELATING TO THE SERVICE.
                OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM RELATING TO THE
                SERVICE IS LIMITED TO THE GREATER OF (A) THE AMOUNT YOU PAID
                TO INLOOK IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE
                TO THE CLAIM, OR (B) USD .
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
                <strong>[⚠️ LEGAL REVIEW REQUIRED]</strong> These Terms are
                governed by the laws of the State of [STATE], without regard to
                its conflict-of-laws principles. Any dispute arising out of or
                relating to these Terms or the Service will be resolved
                exclusively in the state or federal courts located in
                [COUNTY, STATE], and you consent to personal jurisdiction and
                venue there. An arbitration clause and class-action waiver
                should be evaluated by counsel before launch.
              </p>
            </Section>

            <Section title="17. Changes to these Terms">
              <p>
                We may update these Terms from time to time. If we make
                material changes, we will notify registered users by email
                and/or by posting a prominent notice on the Service at least
                30 days before the change takes effect. Your continued use of
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
