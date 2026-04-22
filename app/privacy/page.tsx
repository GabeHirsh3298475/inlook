import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Inlook collects, stores, and uses your data. Covers YouTube OAuth, Supabase storage, Clerk authentication, and your rights as a user.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <section className="relative">
      <div className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 font-display text-4xl font-normal tracking-tight text-ink-50 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Effective date: April 21, 2026 · Last updated: April 21, 2026
          </p>

          <div className="prose-inlook mt-10 space-y-8 font-sans text-[15px] leading-relaxed text-ink-200">
            <p>
              This Privacy Policy explains how Inlook (&ldquo;Inlook,&rdquo;
              &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and shares
              information when you use our website, creator network, brand
              dashboard, and messaging tools (together, the
              &ldquo;Service&rdquo;). By using the Service, you agree to the
              practices described below. If you do not agree, please do not use
              the Service.
            </p>

            <Section title="1. Who we are">
              <p>
                Inlook is a marketplace that connects brands with verified
                YouTube creators for product-launch sponsorships. You can reach
                us at{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>
                .
              </p>
            </Section>

            <Section title="2. Information we collect">
              <p>
                <strong>Information you give us directly.</strong> When you
                apply as a creator we collect your name, email address, primary
                platform and niche, channel or profile URL, and follower range.
                When you apply as a brand we collect your business name,
                business email, product URL, and (optionally) a social URL and
                a short bio. When you send a message through the Service we
                collect the body of that message.
              </p>
              <p>
                <strong>Account and authentication data.</strong> We use{" "}
                <a
                  href="https://clerk.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  Clerk
                </a>{" "}
                for account sign-in, sign-up, and role management. Clerk
                provides us with a Clerk user ID, your primary email address,
                first/last name, and profile image URL so we can link your
                account to your creator or brand record.
              </p>
              <p>
                <strong>YouTube data.</strong> When a creator clicks
                &ldquo;Connect YouTube Account,&rdquo; we use Google OAuth to
                request read-only access to the YouTube Data API
                (<code>youtube.readonly</code>) and YouTube Analytics API
                (<code>yt-analytics.readonly</code>). We store the resulting
                OAuth access token and refresh token server-side so we can pull
                your channel ID, display name, profile picture, channel bio,
                subscriber count, total channel views, total videos, and
                30-day engagement and view metrics. We never post on your
                behalf and we never request write scopes. You can revoke our
                access at any time at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  myaccount.google.com/permissions
                </a>
                .
              </p>
              <p>
                <strong>Automatically collected data.</strong> Our hosting
                provider and infrastructure vendors log IP addresses, user-agent
                strings, and request timestamps for security and abuse
                prevention. We do not operate a third-party analytics or
                advertising tracker today; if we add one in the future we will
                update this Policy.
              </p>
              <p>
                <strong>[⚠️ LEGAL REVIEW REQUIRED]</strong> If the Service is
                ever made available to users in the EU / UK, California, or
                other regulated jurisdictions, additional disclosures and
                consent mechanisms (e.g., GDPR lawful basis, CCPA
                &ldquo;Do Not Sell or Share&rdquo; link) must be added.
              </p>
            </Section>

            <Section title="3. How we use information">
              <ul className="list-disc space-y-2 pl-6">
                <li>To provide and operate the Service (account setup, verification, messaging, brand discovery).</li>
                <li>To verify creator analytics via the YouTube APIs so brands see accurate engagement data.</li>
                <li>To send transactional emails: application confirmations, welcome / verification emails, first-message and first-reply notifications, and agreement notifications.</li>
                <li>To respond to support requests sent to <a href="mailto:support@inlookdeals.com" className="text-accent">support@inlookdeals.com</a>.</li>
                <li>To prevent fraud, abuse, and violations of our Terms of Service.</li>
                <li>To comply with legal obligations.</li>
              </ul>
              <p>
                We do not sell your personal information. We do not use your
                personal information for advertising.
              </p>
            </Section>

            <Section title="4. Who we share information with">
              <p>
                We share information with service providers that help us
                operate the Service, under contract and only for the purposes
                we direct:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Clerk</strong> — authentication, invitations, and role management.</li>
                <li><strong>Supabase</strong> — database and storage for creator, brand, conversation, and message records.</li>
                <li><strong>Google / YouTube</strong> — OAuth and read-only analytics, used only when a creator chooses to connect their channel.</li>
                <li><strong>Our SMTP email provider</strong> — transactional email delivery.</li>
                <li><strong>Stripe (planned)</strong> — payment processing once paid transactions launch. We will update this Policy before enabling Stripe.</li>
              </ul>
              <p>
                We may also disclose information if required by law, to protect
                our rights or the safety of users, or in connection with a
                merger, acquisition, or asset sale.
              </p>
              <p>
                <strong>What brands see.</strong> Approved brands signed in to
                the Service can see a creator&rsquo;s display name, niche,
                profile picture, social links, bio, pricing, and verified
                engagement metrics. Brands <em>never</em> see a
                creator&rsquo;s email through the Service. Similarly, creators
                viewing a brand profile see the business name, bio, product
                URL, and social URL &mdash; never the brand&rsquo;s email.
              </p>
            </Section>

            <Section title="5. YouTube API Services">
              <p>
                Inlook&rsquo;s use of information received from YouTube APIs
                adheres to the{" "}
                <a
                  href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  YouTube API Services Terms of Service
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
                . You can revoke Inlook&rsquo;s access to your YouTube data at
                any time at{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent"
                >
                  https://myaccount.google.com/permissions
                </a>
                .
              </p>
            </Section>

            <Section title="6. Cookies and similar technologies">
              <p>
                Inlook itself does not set advertising or analytics cookies
                today. Our authentication provider (Clerk) sets session cookies
                that are strictly necessary for you to stay signed in. Google
                may set cookies during the OAuth flow when you connect your
                YouTube account. You can clear or block cookies in your
                browser; doing so may prevent sign-in from working.{" "}
                <strong>[⚠️ LEGAL REVIEW REQUIRED]</strong> If we later add
                non-essential cookies (e.g., analytics), we will add a consent
                banner for EU/UK visitors.
              </p>
            </Section>

            <Section title="7. Data retention">
              <p>
                We retain creator and brand records for as long as the account
                is active. Messages are retained for the life of the
                conversation. If you ask us to delete your account, we will
                delete your personal data from our active systems within 30
                days and from encrypted backups within 90 days, except where we
                are required to keep records for legal, accounting, or
                fraud-prevention reasons.
              </p>
            </Section>

            <Section title="8. Your choices and rights">
              <p>
                You can update your profile information from your dashboard or
                by emailing us. You can revoke YouTube access at any time from
                your Google account. To request access, correction, or
                deletion of your personal data, email{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>{" "}
                from the address on file. We will respond within a reasonable
                time.{" "}
                <strong>[⚠️ LEGAL REVIEW REQUIRED]</strong> Jurisdiction-specific
                rights (GDPR access/portability/erasure; CCPA/CPRA rights to
                know, delete, correct, and opt out of sharing) must be
                expressly described here once Inlook serves those regions.
              </p>
            </Section>

            <Section title="9. Security">
              <p>
                We encrypt data in transit over HTTPS and rely on Supabase and
                Clerk for at-rest encryption of our database and authentication
                records. Access to production systems is limited to Inlook
                administrators and is protected by strong authentication. No
                system is 100% secure; we cannot guarantee the security of
                information you transmit to us.
              </p>
            </Section>

            <Section title="10. Children">
              <p>
                The Service is not directed to children under 13, and we do not
                knowingly collect personal information from children under 13.
                If you believe a child has provided us with personal
                information, please contact{" "}
                <a href="mailto:support@inlookdeals.com" className="text-accent">
                  support@inlookdeals.com
                </a>{" "}
                and we will delete it.
              </p>
            </Section>

            <Section title="11. International users">
              <p>
                <strong>[⚠️ LEGAL REVIEW REQUIRED]</strong> The Service is
                operated from the United States. If you access it from outside
                the US, you understand your information will be processed in
                the US. Cross-border transfer mechanisms (Standard Contractual
                Clauses, adequacy decisions) must be added before onboarding
                EU/UK users.
              </p>
            </Section>

            <Section title="12. Changes to this Policy">
              <p>
                We may update this Privacy Policy from time to time. If we make
                material changes, we will notify registered users by email or
                by posting a prominent notice on the Service. Continued use of
                the Service after changes take effect means you accept the
                updated Policy.
              </p>
            </Section>

            <Section title="13. Contact">
              <p>
                Questions or privacy requests:{" "}
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
