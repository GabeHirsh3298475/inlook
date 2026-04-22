import Link from "next/link";
import { MessageSquare, ArrowUpRight } from "lucide-react";
import type { ConversationPreview } from "@/lib/supabase";
import { ChatAvatar } from "./chat-avatar";

export function MessagesPreview({
  conversations,
  counterpartyKind,
}: {
  conversations: ConversationPreview[];
  counterpartyKind: "brand" | "creator";
}) {
  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare
            className="h-4 w-4 text-ink-400"
            strokeWidth={1.6}
          />
          <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
            Messages
          </h2>
        </div>
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400 transition-colors hover:text-accent"
        >
          View all
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
        </Link>
      </div>
      {conversations.length === 0 ? (
        <p className="mt-4 font-sans text-sm text-ink-400">
          No conversations yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {conversations.slice(0, 5).map((c) => (
            <li key={c.conversationId}>
              <Link
                href={`/messages?thread=${c.conversationId}`}
                className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-850 px-4 py-3 transition-colors hover:border-accent/30"
              >
                <ChatAvatar
                  name={c.counterpartyName}
                  imageUrl={c.counterpartyImageUrl}
                  kind={counterpartyKind}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-medium text-ink-50">
                    {c.counterpartyName}
                  </p>
                  <p className="truncate font-sans text-xs text-ink-400">
                    {c.lastMessage ?? "No messages yet"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

