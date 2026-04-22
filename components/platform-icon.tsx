import type { Platform } from "@/lib/creators";
import { Youtube, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.6 6.3a5.3 5.3 0 0 1-3.2-1.9 5.3 5.3 0 0 1-1.2-3H11.8v12.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V7.8a6.3 6.3 0 0 0-.8-.1 6.2 6.2 0 1 0 6.2 6.2v-6a8.7 8.7 0 0 0 5.1 1.7V6.3Z" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className,
}: {
  platform: Platform;
  className?: string;
}) {
  const cls = cn("h-4 w-4", className);
  switch (platform) {
    case "YouTube":
      return <Youtube className={cls} strokeWidth={1.5} aria-label="YouTube" />;
    case "Instagram":
      return (
        <Instagram className={cls} strokeWidth={1.5} aria-label="Instagram" />
      );
    case "TikTok":
      return <TikTokIcon className={cls} />;
  }
}
