import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 font-display text-[22px] font-medium tracking-tight text-ink-50",
        className
      )}
      aria-label="Inlook, home"
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-accent/20 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
          aria-hidden
        >
          <circle
            cx="14"
            cy="14"
            r="12.5"
            stroke="#4A90FF"
            strokeWidth="1.2"
            opacity="0.35"
          />
          <path
            d="M8 13.5l4 4 8-8"
            stroke="#4A90FF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display italic">Inlook</span>
      <span className="font-display text-[22px] font-bold italic tracking-tight text-accent">
        Beta
      </span>
    </Link>
  );
}
