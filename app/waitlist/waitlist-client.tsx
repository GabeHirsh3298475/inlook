"use client";

import { useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORMS = ["TikTok", "Instagram"];
const FOLLOWER_RANGES = [
  "Under 5K",
  "5K–25K",
  "25K–100K",
  "100K–500K",
  "500K+",
];
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

export function WaitlistClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [niche, setNiche] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !platform || !handle || !followers) {
      setError("Please fill in the required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn't look right.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          platform,
          handle,
          followers,
          niche,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card sm:p-8">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4"
            role="status"
            aria-live="polite"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-ink-950">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="font-sans text-sm text-ink-50">
              You&apos;re on the waitlist. We&apos;ll email you when we open up{" "}
              {platform || "your platform"}.
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
            noValidate
          >
            <Field label="Creator Name" className="sm:col-span-1">
              <input
                type="text"
                autoComplete="nickname"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Chen"
                className={inputCls}
              />
            </Field>

            <Field label="Email" className="sm:col-span-1">
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </Field>

            <Field label="Primary platform" className="sm:col-span-1">
              <Select
                value={platform}
                onChange={setPlatform}
                placeholder="Pick one"
                options={PLATFORMS}
              />
            </Field>

            <Field label="Follower / subscriber count" className="sm:col-span-1">
              <Select
                value={followers}
                onChange={setFollowers}
                placeholder="Choose a range"
                options={FOLLOWER_RANGES}
              />
            </Field>

            <Field label="Profile URL" className="sm:col-span-2">
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="tiktok.com/@yourhandle"
                className={inputCls}
              />
            </Field>

            <Field label="Primary niche (optional)" className="sm:col-span-2">
              <Select
                value={niche}
                onChange={setNiche}
                placeholder="Pick a niche"
                options={NICHES}
              />
            </Field>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Sending..." : "Join the waitlist"}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <p className="mt-3 font-sans text-[11px] leading-relaxed text-ink-400">
                By joining the waitlist, you agree to our{" "}
                <a href="/terms" className="text-accent hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-accent hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      {error ? (
        <p role="alert" className="mt-3 font-sans text-xs text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-sm text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <select
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
