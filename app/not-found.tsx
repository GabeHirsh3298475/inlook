import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative">
      <div className="container-x py-24 text-center sm:py-32">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tightest text-ink-50 sm:text-6xl">
          Page not found.
        </h1>
        <p className="mx-auto mt-6 max-w-md font-sans text-base leading-relaxed text-ink-300">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-10 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-5 py-3 font-sans text-sm font-medium text-ink-50 transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
