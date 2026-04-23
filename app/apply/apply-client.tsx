"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Check,
  Youtube,
  Music2,
  Users,
  Loader2,
} from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";

const NICHES = [
  "Tech & Apps",
  "Productivity",
  "Gaming",
  "Finance",
  "Food",
  "Fitness",
  "Lifestyle",
  "Other",
];

const STORAGE_KEY = "inlook-apply-draft";

type FormState = {
  name: string;
  email: string;
  niche: string;
};

type YouTubeChannelStats = {
  displayName: string;
  profilePicture: string | null;
  subscriberCount: number;
};

type TikTokStatus = {
  connected: boolean;
  displayName?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  followerCount?: number | null;
};

export function ApplyClient() {
  const params = useSearchParams();
  const initialName = params.get("name") ?? "";
  const { data: session, status } = useSession();
  const ytConnected = status === "authenticated";
  const ytLoading = status === "loading";

  const [form, setForm] = useState<FormState>({
    name: initialName,
    email: "",
    niche: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [ytStats, setYtStats] = useState<YouTubeChannelStats | null>(null);
  const syncedRef = useRef(false);

  const [tiktok, setTiktok] = useState<TikTokStatus>({ connected: false });
  const [tiktokLoading, setTiktokLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {}
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tiktok/status", { cache: "no-store" });
        const data = (await res.json()) as TikTokStatus;
        if (!cancelled) setTiktok(data);
      } catch {
        if (!cancelled) setTiktok({ connected: false });
      }
      if (!cancelled) setTiktokLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ytConnected || !form.email || syncedRef.current) return;
    syncedRef.current = true;
    (async () => {
      setSyncing(true);
      try {
        await fetch("/api/apply/save-youtube-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const res = await fetch("/api/apply/sync-youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        if (data.channel) setYtStats(data.channel);
      } catch {}
      setSyncing(false);
    })();
  }, [ytConnected, form.email]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function persistDraft() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }

  function handleConnectYouTube() {
    persistDraft();
    signIn("google", { callbackUrl: "/apply" });
  }

  function handleConnectTikTok() {
    persistDraft();
    window.location.href = "/api/tiktok/start";
  }

  async function handleDisconnectTikTok() {
    try {
      await fetch("/api/tiktok/disconnect", { method: "POST" });
    } catch {}
    setTiktok({ connected: false });
  }

  const hasAnyConnection = ytConnected || tiktok.connected;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasAnyConnection) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          youtube: ytConnected
            ? {
                name: session?.user?.name ?? null,
                email: session?.user?.email ?? null,
              }
            : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
    } catch {
      setSubmitError("Network error. Try again.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
    sessionStorage.removeItem(STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <section className="relative">
      <div className="container-x pb-24 sm:pb-32">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-ink-800 bg-ink-900 shadow-card">
            <header className="flex items-center justify-between gap-4 border-b border-ink-800 px-7 py-5">
              <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
                Application
              </h2>
              {submitted ? (
                <VerifiedBadge label="Submitted" size="md" />
              ) : (
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                  3 fields · 2 min
                </span>
              )}
            </header>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                  className="p-7 sm:p-10"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-ink-950">
                      <Check className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <p className="font-display text-2xl font-normal leading-tight tracking-tight text-ink-50 sm:text-3xl">
                      Application received.
                    </p>
                  </div>
                  <p className="mt-5 font-sans text-[15px] leading-relaxed text-ink-300">
                    Thanks, {form.name || "friend"}. We&apos;ll review your
                    application and be in touch at{" "}
                    <span className="font-mono text-accent">{form.email}</span>{" "}
                    within 48 hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="grid gap-5 p-7 sm:grid-cols-2 sm:p-8"
                >
                  <Field label="Creator name" htmlFor="f-name" className="sm:col-span-1">
                    <input
                      id="f-name"
                      type="text"
                      required
                      autoComplete="nickname"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Alex Chen"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Email address" htmlFor="f-email" className="sm:col-span-1">
                    <input
                      id="f-email"
                      type="email"
                      inputMode="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Primary niche" htmlFor="f-niche" className="sm:col-span-2">
                    <SelectField
                      id="f-niche"
                      required
                      value={form.niche}
                      onChange={(v) => update("niche", v)}
                      placeholder="Select a niche"
                      options={NICHES}
                    />
                  </Field>

                  <div className="sm:col-span-2 mt-1 border-t border-ink-800 pt-6">
                    <div className="mb-4">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                        Connect at least one account
                      </p>
                      <p className="mt-1 font-sans text-xs text-ink-400">
                        Connect YouTube, TikTok, or both. Follower counts are
                        pulled automatically.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <YouTubeConnect
                        connected={ytConnected}
                        isLoading={ytLoading}
                        syncing={syncing}
                        channelStats={ytStats}
                        session={session}
                        onConnect={handleConnectYouTube}
                      />
                      <TikTokConnect
                        status={tiktok}
                        isLoading={tiktokLoading}
                        onConnect={handleConnectTikTok}
                        onDisconnect={handleDisconnectTikTok}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!hasAnyConnection || submitting}
                      className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {submitting ? "Submitting…" : "Submit application"}
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </button>
                    {!hasAnyConnection ? (
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                        Connect YouTube or TikTok above to submit
                      </p>
                    ) : (
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                        Required fields · We never share your email
                      </p>
                    )}
                    {submitError && (
                      <p className="mt-3 font-sans text-sm text-red-400">
                        {submitError}
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function YouTubeConnect({
  connected,
  isLoading,
  syncing,
  channelStats,
  session,
  onConnect,
}: {
  connected: boolean;
  isLoading: boolean;
  syncing: boolean;
  channelStats: YouTubeChannelStats | null;
  session: ReturnType<typeof useSession>["data"];
  onConnect: () => void;
}) {
  if (connected && syncing) {
    return (
      <ConnectedCard
        icon={<Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.6} />}
        title="Syncing your channel..."
        subtitle="Pulling stats from YouTube"
      />
    );
  }
  if (connected && channelStats) {
    return (
      <ConnectedCard
        imageUrl={channelStats.profilePicture ?? undefined}
        fallbackIcon={<Youtube className="h-5 w-5" strokeWidth={1.6} />}
        title={channelStats.displayName}
        subtitleLeft={<Users className="h-3 w-3 text-ink-400" strokeWidth={1.6} />}
        subtitle={`${channelStats.subscriberCount.toLocaleString()} subscribers`}
        onDisconnect={() => signOut({ redirect: false })}
      />
    );
  }
  if (connected) {
    return (
      <ConnectedCard
        fallbackIcon={<Youtube className="h-5 w-5" strokeWidth={1.6} />}
        title={session?.user?.name ?? "YouTube account"}
        subtitle={session?.user?.email ?? "Connected"}
        onDisconnect={() => signOut({ redirect: false })}
      />
    );
  }
  return (
    <DisconnectedCard
      icon={<Youtube className="h-4 w-4" strokeWidth={1.6} />}
      label="Connect YouTube"
      description="Read-only access — we verify views, subscribers, and engagement."
      onConnect={onConnect}
      disabled={isLoading}
    />
  );
}

function TikTokConnect({
  status,
  isLoading,
  onConnect,
  onDisconnect,
}: {
  status: TikTokStatus;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  if (isLoading) {
    return (
      <ConnectedCard
        icon={<Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.6} />}
        title="Checking TikTok status..."
        subtitle=""
      />
    );
  }
  if (status.connected) {
    return (
      <ConnectedCard
        imageUrl={status.avatarUrl ?? undefined}
        fallbackIcon={<Music2 className="h-5 w-5" strokeWidth={1.6} />}
        title={status.displayName ?? status.username ?? "TikTok account"}
        subtitleLeft={<Users className="h-3 w-3 text-ink-400" strokeWidth={1.6} />}
        subtitle={
          status.followerCount != null
            ? `${status.followerCount.toLocaleString()} followers`
            : status.username
            ? `@${status.username}`
            : "Connected"
        }
        onDisconnect={onDisconnect}
      />
    );
  }
  return (
    <DisconnectedCard
      icon={<Music2 className="h-4 w-4" strokeWidth={1.6} />}
      label="Connect TikTok"
      description="Read-only access — we verify followers and engagement via Login Kit."
      onConnect={onConnect}
    />
  );
}

function ConnectedCard({
  icon,
  imageUrl,
  fallbackIcon,
  title,
  subtitle,
  subtitleLeft,
  onDisconnect,
}: {
  icon?: React.ReactNode;
  imageUrl?: string;
  fallbackIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  subtitleLeft?: React.ReactNode;
  onDisconnect?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-11 w-11 flex-none rounded-full ring-1 ring-accent/30"
          />
        ) : (
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent/20 text-accent">
            {icon ?? fallbackIcon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-medium text-ink-50">
            {title}
          </p>
          {subtitle ? (
            <div className="flex items-center gap-1.5">
              {subtitleLeft}
              <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                {subtitle}
              </p>
            </div>
          ) : null}
        </div>
        <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent text-ink-950">
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </div>
      {onDisconnect && (
        <button
          type="button"
          onClick={onDisconnect}
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors hover:text-accent"
        >
          Disconnect
        </button>
      )}
    </div>
  );
}

function DisconnectedCard({
  icon,
  label,
  description,
  onConnect,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onConnect: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-950/40 p-5">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-200">
          {icon}
        </span>
        <div className="flex-1">
          <p className="font-display text-base font-medium leading-tight text-ink-50">
            {label}
          </p>
          <p className="mt-1 font-sans text-xs leading-relaxed text-ink-300">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onConnect}
        disabled={disabled}
        className="btn-primary mt-4 w-full disabled:cursor-wait disabled:opacity-60"
      >
        {icon}
        {disabled ? "Loading…" : label}
      </button>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-sm text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  id,
  value,
  onChange,
  placeholder,
  options,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none pr-10 ${
          value ? "text-ink-50" : "text-ink-400"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-ink-850 text-ink-50">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
        strokeWidth={1.6}
      />
    </div>
  );
}
