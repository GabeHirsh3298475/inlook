import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-ink-800">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-ink-300">
              A creator marketplace with verified engagement numbers and clear
              prices.
            </p>
          </div>
          <FooterCol
            title="Product"
            items={[
              { label: "Creator network", href: "/network" },
              { label: "For brands", href: "/brands" },
              { label: "For creators", href: "/creators" },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "About", href: "/#about" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ]}
          />
          <FooterCol
            title="Contact"
            items={[
              {
                label: "support@inlookdeals.com",
                href: "mailto:support@inlookdeals.com",
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/tryinlook",
                external: true,
              },
              {
                label: "TikTok",
                href: "https://www.tiktok.com/@tryinlook",
                external: true,
              },
              {
                label: "X",
                href: "https://x.com/inlook_startup",
                external: true,
              },
            ]}
          />
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-800 pt-6 md:flex-row md:items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            © 2026 Inlook. All rights reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Built by founders, for founders.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h4 className="eyebrow">{title}</h4>
      <ul className="mt-4 space-y-3">
        {items.map((item) =>
          item.external ? (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-ink-200 transition-colors duration-200 hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ) : (
            <li key={item.label}>
              <Link
                href={item.href}
                className="font-sans text-sm text-ink-200 transition-colors duration-200 hover:text-accent"
              >
                {item.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
