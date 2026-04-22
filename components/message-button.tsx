"use client";

import { useUser } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MessageButton({
  creatorId,
  isSelf = false,
}: {
  creatorId: string;
  isSelf?: boolean;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const role = user?.publicMetadata?.role as string | undefined;
  const isBrand = role === "brand";

  if (isSelf) return null;

  if (!isLoaded || !isBrand) {
    return (
      <span className="group/msg relative inline-flex">
        <button
          type="button"
          disabled
          aria-disabled
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-4 py-2 font-sans text-sm text-ink-400 opacity-60"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
          Message
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max -translate-x-1/2 rounded-md border border-ink-700 bg-ink-850 px-3 py-2 font-sans text-[11px] font-normal leading-snug tracking-normal text-ink-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover/msg:opacity-100">
          Sign in as a brand to message
        </span>
      </span>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId }),
      });
      if (res.ok) {
        const { conversationId } = (await res.json()) as {
          conversationId: string;
        };
        router.push(`/messages?thread=${conversationId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 py-2 font-sans text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-60"
    >
      <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
      {loading ? "Opening\u2026" : "Message"}
    </button>
  );
}
