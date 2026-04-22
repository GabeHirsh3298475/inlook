import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft, ExternalLink, Share2, User } from "lucide-react";
import { supabase, type BrandRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("brands")
    .select("business_name")
    .eq("id", id)
    .single();
  const name = (data as { business_name: string } | null)?.business_name ?? "Brand";
  return { title: `${name} · Inlook` };
}

export default async function BrandProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata?.role;
  if (role !== "brand" && role !== "creator" && role !== "admin") {
    notFound();
  }

  const { id } = await params;

  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .eq("verified", true)
    .single();

  const brand = data as BrandRow | null;
  if (!brand) notFound();

  return (
    <section className="relative">
      <div className="container-x py-12 sm:py-16">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400 transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          Back to messages
        </Link>

        <div className="mx-auto mt-8 grid max-w-4xl gap-6">
          {/* Basic Information */}
          <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
            <p className="eyebrow">Basic Information</p>
            <div className="mt-5 flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full border border-ink-700 bg-ink-850"
                aria-hidden
              >
                <User className="h-8 w-8 text-ink-300" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50">
                  {brand.business_name}
                </h1>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                  Verified Brand
                </p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
            <p className="eyebrow">About</p>
            {brand.bio ? (
              <p className="mt-4 whitespace-pre-line font-sans text-[15px] leading-relaxed text-ink-200">
                {brand.bio}
              </p>
            ) : (
              <p className="mt-4 font-sans text-[14px] italic text-ink-400">
                This brand hasn&apos;t added a bio yet.
              </p>
            )}
          </div>

          {/* Links */}
          <div className="rounded-3xl border border-ink-800 bg-ink-900 p-7 shadow-card">
            <p className="eyebrow">Links</p>
            <div className="mt-4 space-y-3">
              <LinkRow
                icon={ExternalLink}
                label="Product"
                href={brand.product_url}
              />
              {brand.social_url && (
                <LinkRow
                  icon={Share2}
                  label="Social"
                  href={brand.social_url}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkRow({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof ExternalLink;
  label: string;
  href: string;
}) {
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300">
          {label}
        </span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="max-w-[70%] truncate break-all font-sans text-sm text-accent underline-offset-4 hover:underline"
      >
        {href}
      </a>
    </div>
  );
}
