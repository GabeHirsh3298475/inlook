import { cn } from "@/lib/utils";

export function VerifiedBadge({
  size = "sm",
  label = "Verified",
  className,
}: {
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 font-mono font-medium uppercase tracking-[0.14em] text-accent",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        className
      )}
      title="Engagement numbers verified via platform APIs"
    >
      <svg
        viewBox="0 0 12 12"
        className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}
        aria-hidden
      >
        <path
          d="M6 0l1.4 1.2 1.8-.3.7 1.7 1.7.7-.3 1.8L12 6l-1.2 1.4.3 1.8-1.7.7-.7 1.7-1.8-.3L6 12 4.6 10.8l-1.8.3-.7-1.7-1.7-.7.3-1.8L0 6l1.2-1.4-.3-1.8 1.7-.7.7-1.7 1.8.3L6 0z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M3.5 6.2l1.7 1.7 3.3-3.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {label}
    </span>
  );
}
