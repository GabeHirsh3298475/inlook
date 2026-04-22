"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Send, Check, X } from "lucide-react";
import type { ConversationPreview, MessageRow } from "@/lib/supabase";
import { ChatAvatar } from "@/components/chat-avatar";

const POLL_MS = 5000;

type AgreementFlags = {
  brandLong: boolean;
  brandShort: boolean;
  creatorLong: boolean;
  creatorShort: boolean;
};

type ThreadPayload = {
  counterpartyName: string;
  counterpartyImageUrl: string | null;
  counterpartyId: string;
  counterpartyKind: "brand" | "creator";
  messages: MessageRow[];
  agreements: AgreementFlags;
};

export function MessagesClient({
  role,
  initialThreadId,
}: {
  role: "brand" | "creator";
  initialThreadId: string | null;
}) {
  const counterpartyKind: "brand" | "creator" =
    role === "brand" ? "creator" : "brand";
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialThreadId);
  const [thread, setThread] = useState<ThreadPayload | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchList = useCallback(async () => {
    const res = await fetch("/api/messages/list");
    if (!res.ok) return;
    const data = (await res.json()) as { conversations: ConversationPreview[] };
    setConversations(data.conversations);
  }, []);

  const fetchThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/messages/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as ThreadPayload;
    setThread(data);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    if (!activeId) {
      setThread(null);
      return;
    }
    fetchThread(activeId);
    const intv = setInterval(() => fetchThread(activeId), POLL_MS);
    return () => clearInterval(intv);
  }, [activeId, fetchThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function handleSend() {
    if (!activeId || !draft.trim() || sending) return;
    setSending(true);
    const body = draft;
    setDraft("");
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, body }),
      });
      if (!res.ok) {
        setDraft(body);
      } else {
        await Promise.all([fetchThread(activeId), fetchList()]);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleAgree(format: "long" | "short") {
    if (!activeId) return;
    const res = await fetch(`/api/messages/${activeId}/agree`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format }),
    });
    if (res.ok) await fetchThread(activeId);
  }

  return (
    <section className="relative">
      <div className="container-x py-10 sm:py-14">
        <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50 sm:text-4xl">
          Messages
        </h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => setActiveId(id)}
            counterpartyKind={counterpartyKind}
          />
          <div className="min-h-[520px] rounded-3xl border border-ink-800 bg-ink-900 shadow-card">
            {!activeId ? (
              <EmptyPane text="Select a conversation to start messaging." />
            ) : !thread ? (
              <EmptyPane text={"Loading\u2026"} />
            ) : (
              <ThreadView
                thread={thread}
                myRole={role}
                draft={draft}
                setDraft={setDraft}
                sending={sending}
                onSend={handleSend}
                onAgree={handleAgree}
                endRef={endRef}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
  counterpartyKind,
}: {
  conversations: ConversationPreview[];
  activeId: string | null;
  onSelect: (id: string) => void;
  counterpartyKind: "brand" | "creator";
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-3xl border border-ink-800 bg-ink-900 p-6 shadow-card">
        <p className="font-sans text-sm text-ink-400">
          No conversations yet.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {conversations.map((c) => {
        const active = c.conversationId === activeId;
        return (
          <li key={c.conversationId}>
            <button
              type="button"
              onClick={() => onSelect(c.conversationId)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-accent/50 bg-accent/10"
                  : "border-ink-800 bg-ink-900 hover:border-ink-700"
              }`}
            >
              <div className="flex items-center gap-3">
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
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ThreadView({
  thread,
  myRole,
  draft,
  setDraft,
  sending,
  onSend,
  onAgree,
  endRef,
}: {
  thread: ThreadPayload;
  myRole: "brand" | "creator";
  draft: string;
  setDraft: (v: string) => void;
  sending: boolean;
  onSend: () => void;
  onAgree: (format: "long" | "short") => void;
  endRef: React.RefObject<HTMLDivElement>;
}) {
  const myLong =
    myRole === "brand"
      ? thread.agreements.brandLong
      : thread.agreements.creatorLong;
  const myShort =
    myRole === "brand"
      ? thread.agreements.brandShort
      : thread.agreements.creatorShort;

  const showLong = myRole === "brand" ? true : thread.agreements.brandLong;
  const showShort = myRole === "brand" ? true : thread.agreements.brandShort;
  const verb: "Offer" | "Accept" = myRole === "brand" ? "Offer" : "Accept";

  return (
    <div className="flex h-full min-h-[520px] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <ChatAvatar
            name={thread.counterpartyName}
            imageUrl={thread.counterpartyImageUrl}
            kind={thread.counterpartyKind}
          />
          <p className="font-display text-lg font-medium text-ink-50">
            {thread.counterpartyName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showLong ? (
            <AcceptButton
              format="long"
              verb={verb}
              agreed={myLong}
              onConfirm={() => onAgree("long")}
            />
          ) : null}
          {showShort ? (
            <AcceptButton
              format="short"
              verb={verb}
              agreed={myShort}
              onConfirm={() => onAgree("short")}
            />
          ) : null}
        </div>
        <Link
          href={
            thread.counterpartyKind === "creator"
              ? `/network/${thread.counterpartyId}`
              : `/brands/${thread.counterpartyId}`
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 font-sans text-xs font-medium text-ink-200 transition-colors hover:border-accent/40 hover:text-accent"
        >
          View profile
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.8} />
        </Link>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
        {thread.messages.length === 0 ? (
          <p className="text-center font-sans text-sm text-ink-400">
            No messages yet. Say hi.
          </p>
        ) : (
          thread.messages.map((m) => (
            <MessageBubble
              key={m.id}
              mine={m.sender_role === myRole}
              body={m.body}
            />
          ))
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-ink-800 p-4">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={"Write a message\u2026"}
            className="flex-1 resize-none rounded-2xl border border-ink-700 bg-ink-850 px-4 py-3 font-sans text-sm text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !draft.trim()}
            className="btn-primary h-11 disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
            {sending ? "Sending\u2026" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AcceptButton({
  format,
  verb,
  agreed,
  onConfirm,
}: {
  format: "long" | "short";
  verb: "Offer" | "Accept";
  agreed: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [mode, setMode] = useState<"idle" | "confirming">("idle");
  const [submitting, setSubmitting] = useState(false);
  const label = format === "long" ? "long" : "short";
  const agreedLabel = verb === "Offer" ? "Offered" : "Agreed";

  if (agreed) {
    return (
      <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-4 font-sans text-[13px] font-medium text-accent">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        {agreedLabel} · {cap(label)}
      </div>
    );
  }

  if (mode === "confirming") {
    return (
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true);
            try {
              await onConfirm();
            } finally {
              setSubmitting(false);
              setMode("idle");
            }
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 font-sans text-[13px] font-medium text-ink-950 transition-all hover:bg-accent-dim disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          {submitting ? "Saving\u2026" : `Confirm ${label}`}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => setMode("idle")}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3 font-sans text-[13px] font-medium text-ink-300 transition-all hover:border-ink-600 hover:text-ink-50 disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setMode("confirming")}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-200 transition-all hover:border-accent/40 hover:text-accent"
    >
      {verb} {label}
    </button>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function MessageBubble({ mine, body }: { mine: boolean; body: string }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-sans text-sm leading-relaxed ${
          mine
            ? "bg-accent text-ink-950"
            : "border border-ink-700 bg-ink-850 text-ink-50"
        }`}
      >
        {body}
      </div>
    </div>
  );
}

function EmptyPane({ text }: { text: string }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <p className="font-sans text-sm text-ink-400">{text}</p>
    </div>
  );
}
