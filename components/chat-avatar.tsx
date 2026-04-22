import { User } from "lucide-react";

const SIZE_CLASS = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-16 w-16",
} as const;

const ICON_CLASS = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

const INITIAL_CLASS = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-xl",
} as const;

export function ChatAvatar({
  name,
  imageUrl,
  kind,
  size = "sm",
}: {
  name: string;
  imageUrl: string | null;
  kind: "brand" | "creator";
  size?: "sm" | "md" | "lg";
}) {
  if (kind === "brand") {
    return (
      <div
        className={`relative flex flex-none items-center justify-center overflow-hidden rounded-full border border-ink-700 bg-ink-850 ${SIZE_CLASS[size]}`}
        aria-hidden
      >
        <User
          className={`${ICON_CLASS[size]} text-ink-300`}
          strokeWidth={1.6}
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`flex-none rounded-full object-cover ring-1 ring-ink-700 ${SIZE_CLASS[size]}`}
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={`flex flex-none items-center justify-center overflow-hidden rounded-full ${SIZE_CLASS[size]}`}
      style={{
        background:
          "radial-gradient(120% 120% at 20% 10%, #d4ff3a, #0a0a0b 70%)",
      }}
      aria-hidden
    >
      <span
        className={`font-display font-semibold text-ink-950 mix-blend-screen ${INITIAL_CLASS[size]}`}
      >
        {initials || "?"}
      </span>
    </div>
  );
}
