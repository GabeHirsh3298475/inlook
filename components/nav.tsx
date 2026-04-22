import Link from "next/link";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { Logo } from "./logo";

export function Nav() {
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
          <Link href="/network" className="btn-ghost">
            Network
          </Link>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="btn-ghost">
              Sign In
            </Link>
          </Show>
        </div>
      </div>
      <div className="hairline h-px w-full" aria-hidden />
    </header>
  );
}
