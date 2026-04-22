"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative z-40">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/network"
            className="btn-ghost"
            aria-label="Creator network"
          >
            Creator Network
          </Link>
          <span className="mx-3 h-5 w-px bg-ink-700" aria-hidden />
          <Link href="/creators" className="btn-ghost" aria-label="For creators">
            For Creators
          </Link>
          <Link href="/brands" className="btn-ghost" aria-label="For brands">
            For brands
          </Link>
          <Show when="signed-out">
            <Link href="/sign-in" className="btn-ghost">
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="btn-ghost">
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </Show>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
          </Show>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 bg-ink-900 text-ink-100 transition-colors hover:border-ink-600"
          >
            {open ? (
              <X className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
      <div className="hairline h-px w-full" aria-hidden />

      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 top-[72px] z-30 bg-ink-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 top-[72px] z-40 border-b border-ink-800 bg-ink-950 shadow-xl">
            <nav className="container-x flex flex-col gap-1 py-4">
              <MobileLink href="/network" onClick={() => setOpen(false)}>
                Creator Network
              </MobileLink>
              <MobileLink href="/creators" onClick={() => setOpen(false)}>
                For Creators
              </MobileLink>
              <MobileLink href="/brands" onClick={() => setOpen(false)}>
                For Brands
              </MobileLink>
              <MobileLink href="/pricing" onClick={() => setOpen(false)}>
                Pricing
              </MobileLink>
              <Show when="signed-in">
                <MobileLink href="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </MobileLink>
                <MobileLink href="/messages" onClick={() => setOpen(false)}>
                  Messages
                </MobileLink>
              </Show>
              <Show when="signed-out">
                <div className="mt-2 border-t border-ink-800 pt-3">
                  <MobileLink href="/sign-in" onClick={() => setOpen(false)}>
                    Sign In
                  </MobileLink>
                </div>
              </Show>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-4 py-3 font-sans text-base text-ink-100 transition-colors hover:bg-ink-900"
    >
      {children}
    </Link>
  );
}
