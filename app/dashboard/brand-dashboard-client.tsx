"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Building2,
  Mail,
  Link2,
  Share2,
  ExternalLink,
  Save,
  Check,
} from "lucide-react";
import type { BrandRow, ConversationPreview } from "@/lib/supabase";
import { MessagesPreview } from "@/components/messages-preview";

type Props = {
  userName: string;
  brand: BrandRow | null;
  conversations: ConversationPreview[];
};

const MAX_BIO_LENGTH = 500;

export function BrandDashboardClient({ userName, brand, conversations }: Props) {
  const [bio, setBio] = useState(brand?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (brand && !brand.clerk_user_id) {
      fetch("/api/brand/link-account", { method: "POST" }).catch(() => {});
    }
  }, [brand]);

  async function onSaveBio() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/brand/update-bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!brand) {
    return (
      <section className="relative">
        <div className="container-x py-20 text-center">
          <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50">
            No brand application found
          </h1>
          <p className="mt-4 font-sans text-[15px] text-ink-300">
            We couldn&apos;t find a brand application linked to your account.
            Make sure you signed in with the same email you applied with.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="container-x py-10 sm:py-14">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50 sm:text-4xl">
              Welcome back, {userName}.
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Verified Brand
              </span>
            </div>
          </div>
          <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <InfoRow
            icon={Building2}
            label="Business Name"
            value={brand.business_name}
          />
          <InfoRow icon={Mail} label="Email" value={brand.email} />
          <InfoRow
            icon={Link2}
            label="Product Link"
            value={brand.product_url}
            link
            supportNote
          />
          <InfoRow
            icon={Share2}
            label="Social Media URL"
            value={brand.social_url ?? "—"}
            link={!!brand.social_url}
            supportNote
          />
        </div>

        <div className="mt-6 rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
          <h2 className="font-display text-xl font-medium tracking-tight text-ink-50">
            About
          </h2>
          <p className="mt-1 font-sans text-sm text-ink-400">
            Optional. Tell creators about your brand, product, and what kind of
            campaigns you&apos;re looking for.
          </p>
          <div className="mt-5">
            <textarea
              rows={5}
              maxLength={MAX_BIO_LENGTH}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your brand, your product, and the kind of creators you'd like to work with"
              className="w-full rounded-2xl border border-ink-700 bg-ink-850 px-4 py-3 font-sans text-sm leading-relaxed text-ink-50 placeholder:text-ink-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="mt-1 text-right font-mono text-[10px] text-ink-400">
              {bio.length}/{MAX_BIO_LENGTH}
            </p>
            <button
              type="button"
              onClick={onSaveBio}
              disabled={saving}
              className="btn-primary mt-2 disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2} /> Saved
                </>
              ) : saving ? (
                "Saving\u2026"
              ) : (
                <>
                  <Save className="h-4 w-4" strokeWidth={2} /> Save
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <MessagesPreview
            conversations={conversations}
            counterpartyKind="creator"
          />
        </div>

        <div className="mt-10">
          <a
            href="/network"
            className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-5 py-3 font-sans text-sm font-medium text-ink-50 transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.6} />
            Browse the creator network
          </a>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  link,
  supportNote,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  link?: boolean;
  supportNote?: boolean;
}) {
  const href =
    link && value && !value.startsWith("http") ? `https://${value}` : value;

  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
          {label}
        </p>
      </div>
      <div className="mt-3">
        {link && value && value !== "—" ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-sans text-[15px] text-accent underline-offset-4 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="break-all font-sans text-[15px] text-ink-50">{value}</p>
        )}
      </div>
      {supportNote && (
        <p className="mt-3 font-mono text-[10px] text-ink-400">
          Contact support to update
        </p>
      )}
    </div>
  );
}
