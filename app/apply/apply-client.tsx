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
  HelpCircle,
  Users,
  Loader2,
} from "lucide-react";
import { VerifiedBadge } from "@/components/verified-badge";

const PLATFORMS = ["YouTube", "TikTok", "Instagram", "Multiple"];
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
const FOLLOWER_RANGES = [
  "Under 5K",
  "5K–25K",
  "25K–100K",
  "100K–500K",
  "500K+",
];

const STORAGE_KEY = "inlook-apply-draft";

type FormState = {
  name: string;
  email: string;
  platform: string;
  url: string;
  niche: string;
  followers: string;
};

type ChannelStats = {
  displayName: string;
  profilePicture: string | null;
  subscriberCount: number;
};

export function ApplyClient() {
  const params = useSearchParams();
  const initialName = params.get("name") ?? "";
  const { data: session, status } = useSession();
  const connected = status === "authenticated";
  const isLoading = status === "loading";

  const [form, setForm] = useState<FormState>({
    name: initialName,
    email: "",
    platform: "",
    url: "",
    niche: "",
    followers: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const syncedRef = useRef(false);

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
    if (!connected || !form.email || syncedRef.current) return;
    syncedRef.current = true;

    async function syncYouTube() {
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
        if (data.channel) {
          setChannelStats(data.channel);
        }
      } catch {}
      setSyncing(false);
    }

    syncYouTube();
  }, [connected, form.email]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleConnectYouTube() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    signIn("google", { callbackUrl: "/apply" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!connected) return;
    setSubmitting(true);
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          youtube: {
            name: session?.user?.name ?? null,
            email: session?.user?.email ?? null,
          },
        }),
      });
    } catch {}
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
                  6 fields · 2 min
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
                  noValidate={false}
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

                  <Field label="Primary platform" htmlFor="f-platform" className="sm:col-span-1">
                    <SelectField
                      id="f-platform"
                      required
                      value={form.platform}
                      onChange={(v) => update("platform", v)}
                      placeholder="Select a platform"
                      options={PLATFORMS}
                    />
                  </Field>

                  <Field label="Primary niche" htmlFor="f-niche" className="sm:col-span-1">
                    <SelectField
                      id="f-niche"
                      required
                      value={form.niche}
                      onChange={(v) => update("niche", v)}
                      placeholder="Select a niche"
                      options={NICHES}
                    />
                  </Field>

                  <Field label="Channel / profile URL" htmlFor="f-url" className="sm:col-span-2">
                    <input
                      id="f-url"
                      type="text"
                      required
                      autoComplete="url"
                      value={form.url}
                      onChange={(e) => update("url", e.target.value)}
                      placeholder="youtube.com/@yourchannel"
                      className={inputCls}
                    />
                  </Field>

                  <Field
                    label="Follower / subscriber count"
                    htmlFor="f-followers"
                    className="sm:col-span-1"
                  >
                    <SelectField
                      id="f-followers"
                      required
                      value={form.followers}
                      onChange={(v) => update("followers", v)}
                      placeholder="Choose a range"
                      options={FOLLOWER_RANGES}
                    />
                  </Field>

                  <div className="sm:col-span-2 mt-1 border-t border-ink-800 pt-6">
                    <YouTubeConnect
                      connected={connected}
                      isLoading={isLoading}
                      syncing={syncing}
                      channelStats={channelStats}
                      session={session}
                      onConnect={handleConnectYouTube}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!connected || submitting}
                      className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {submitting ? "Submitting\u2026" : "Submit application"}
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </button>
                    {!connected ? (
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                        Connect your YouTube account above to submit
                      </p>
                    ) : (
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                        Required fields · We never share your email
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
  channelStats: ChannelStats | null;
  session: ReturnType<typeof useSession>["data"];
  onConnect: () => void;
}) {
  if (connected && syncing) {
    return (
      <div>
        <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent/20 text-accent">
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-medium text-ink-50">
              Syncing your channel...
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
              Pulling stats from YouTube
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (connected && channelStats) {
    return (
      <div>
        <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
          {channelStats.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channelStats.profilePicture}
              alt=""
              className="h-11 w-11 flex-none rounded-full ring-1 ring-accent/30"
            />
          ) : (
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent/20 text-accent">
              <Youtube className="h-5 w-5" strokeWidth={1.6} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-medium text-ink-50">
              {channelStats.displayName}
            </p>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-ink-400" strokeWidth={1.6} />
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
                {channelStats.subscriberCount.toLocaleString()} subscribers
              </p>
            </div>
          </div>
          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent text-ink-950">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
        <p className="mt-4 font-sans text-[14px] leading-relaxed text-ink-200">
          YouTube connected — your stats have been verified and saved.
        </p>
        <button
          type="button"
          onClick={() => signOut({ redirect: false })}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors duration-200 hover:text-accent"
        >
          Disconnect account
        </button>
      </div>
    );
  }

  if (connected) {
    return (
      <div>
        <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.06] px-5 py-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent/20 text-accent">
            <Youtube className="h-5 w-5" strokeWidth={1.6} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-medium text-ink-50">
              {session?.user?.name ?? "YouTube account"}
            </p>
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
              {session?.user?.email ?? "Connected"}
            </p>
          </div>
          <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent text-ink-950">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
        <p className="mt-4 font-sans text-[14px] leading-relaxed text-ink-200">
          YouTube connected — your stats will be verified when your application
          is reviewed.
        </p>
        <button
          type="button"
          onClick={() => signOut({ redirect: false })}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors duration-200 hover:text-accent"
        >
          Disconnect account
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 font-sans text-[14px] leading-relaxed text-ink-200">
        Don&apos;t have a YouTube channel?{" "}
        <a href="/waitlist" className="text-accent hover:underline">
          Join the waitlist
        </a>
        .
      </p>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-700 bg-ink-850 text-ink-200">
          <Youtube className="h-4 w-4" strokeWidth={1.6} />
        </span>
        <p className="flex-1 font-display text-lg font-medium leading-tight text-ink-50">
          Connect your YouTube account
        </p>
        <span className="group relative">
          <HelpCircle className="h-4 w-4 cursor-help text-ink-400" strokeWidth={1.6} />
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 font-sans text-xs leading-relaxed text-ink-200 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
            Waiting to get approved for TikTok and Instagram.
          </span>
        </span>
      </div>
      <p className="mt-4 font-sans text-[14px] leading-relaxed text-ink-300">
        Connect your Google account to let us read your channel&apos;s public
        stats and verified analytics.
      </p>
      <button
        type="button"
        onClick={onConnect}
        disabled={isLoading}
        className="btn-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60"
      >
        <Youtube className="h-4 w-4" strokeWidth={1.8} />
        {isLoading ? "Loading\u2026" : "Connect YouTube Account"}
      </button>
      <p className="mt-3 text-center font-sans text-[11px] leading-relaxed text-ink-400">
        By connecting YouTube, you agree to our{" "}
        <a href="/terms" className="text-accent hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </a>
        .
      </p>
      <ul className="mt-5 space-y-2 border-t border-ink-800 pt-4 font-sans text-sm text-ink-200">
        {[
          "Read-only access \u00b7 we never post on your behalf",
          "Revoke any time from your Google account",
          "Only used to verify views, subscribers, and engagement",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-[8px] h-1 w-1 flex-none rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
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
