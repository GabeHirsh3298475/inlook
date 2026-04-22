"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BrandApplicationForm() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !email.trim() || !productUrl.trim()) {
      setError("Business name, email, and product link are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email doesn't look right — try again.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/brands/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          email,
          productUrl,
          socialUrl,
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

  const inputClass =
    "h-12 w-full rounded-full border border-ink-600 bg-ink-800 px-5 font-sans text-sm text-ink-50 placeholder:text-ink-300 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

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
              Application received. We&apos;ll be in touch.
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full flex-col gap-3"
            noValidate
          >
            <label className="sr-only" htmlFor="brand-business">
              Business name
            </label>
            <input
              id="brand-business"
              type="text"
              autoComplete="organization"
              required
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Business name"
              className={inputClass}
            />

            <label className="sr-only" htmlFor="brand-email">
              Business email
            </label>
            <input
              id="brand-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Business email"
              className={inputClass}
            />

            <label className="sr-only" htmlFor="brand-product">
              Product link
            </label>
            <input
              id="brand-product"
              type="url"
              autoComplete="url"
              required
              value={productUrl}
              onChange={(e) => {
                setProductUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Product link"
              className={inputClass}
            />

            <label className="sr-only" htmlFor="brand-social">
              Social media URL (optional)
            </label>
            <input
              id="brand-social"
              type="url"
              autoComplete="url"
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
              placeholder="Social media URL (optional)"
              className={inputClass}
            />

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary h-12 px-6 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Request access"}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {error ? (
        <p role="alert" className="mt-2 font-sans text-xs text-red-300">
          {error}
        </p>
      ) : !submitted ? (
        <>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            We&apos;ll email you to verify brand ownership.
          </p>
          <p className="mt-3 font-sans text-[11px] leading-relaxed text-ink-400">
            By clicking Request access, you agree to our{" "}
            <a href="/terms" className="text-accent hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </>
      ) : null}
    </div>
  );
}
