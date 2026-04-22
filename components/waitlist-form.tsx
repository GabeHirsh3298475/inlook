"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WaitlistForm({
  placeholder = "you@company.com",
  cta = "Join the waitlist",
  note,
}: {
  placeholder?: string;
  cta?: string;
  note?: string;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      setError("That email doesn't look right — try again.");
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex items-center gap-3 rounded-full border border-accent/40 bg-accent/10 px-5 py-3 text-sm"
            role="status"
            aria-live="polite"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-ink-950">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="font-sans text-ink-50">
              You&apos;re on the list.
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
              {email}
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full flex-col gap-3 sm:flex-row"
            noValidate
          >
            <label className="sr-only" htmlFor="waitlist-email">
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder={placeholder}
              className="h-12 w-full flex-1 rounded-full border border-ink-700 bg-ink-900 px-5 font-sans text-sm text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "waitlist-error" : undefined}
            />
            <button
              type="submit"
              className="btn-primary h-12 px-6 text-[13px]"
              aria-label={cta}
            >
              {cta}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {error ? (
        <p
          id="waitlist-error"
          role="alert"
          className="mt-2 font-sans text-xs text-red-300"
        >
          {error}
        </p>
      ) : note && !submitted ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
          {note}
        </p>
      ) : null}
    </div>
  );
}
