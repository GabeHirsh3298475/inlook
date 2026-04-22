"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  Check,
  X,
  Users,
  ShieldCheck,
  Radio,
  Handshake,
  ExternalLink,
  RotateCcw,
  Building2,
  BadgeCheck,
  Eye,
  Share2,
} from "lucide-react";
import type {
  CreatorRow,
  BrandRow,
  AgreementEntry,
} from "@/lib/supabase";

type Section = "creators" | "brands" | "agreements";
type Tab = "pending" | "approved" | "rejected";

export function AdminClient({
  creators: initialCreators,
  brands: initialBrands,
  agreements: initialAgreements,
}: {
  creators: CreatorRow[];
  brands: BrandRow[];
  agreements: AgreementEntry[];
}) {
  const [section, setSection] = useState<Section>("creators");
  const [creators, setCreators] = useState(initialCreators);
  const [brands, setBrands] = useState(initialBrands);
  const [agreements, setAgreements] = useState(initialAgreements);
  const [tab, setTab] = useState<Tab>("pending");

  const pendingCreators = creators.filter((c) => !c.approved && !c.rejected);
  const approvedCreators = creators.filter((c) => c.approved);
  const rejectedCreators = creators.filter((c) => c.rejected);
  const liveCreators = approvedCreators.filter(
    (c) => c.published && !c.admin_hidden
  );
  const totalDeals = creators.reduce(
    (sum, c) => sum + (c.deals_completed ?? 0),
    0
  );

  const pendingBrands = brands.filter((b) => !b.verified && !b.rejected);
  const verifiedBrands = brands.filter((b) => b.verified);
  const rejectedBrands = brands.filter((b) => b.rejected);

  async function handleApprove(id: string) {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, approved: true, rejected: false } : c
      )
    );
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: id }),
    });
  }

  async function handleReject(id: string) {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, rejected: true, approved: false } : c
      )
    );
    await fetch("/api/admin/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: id }),
    });
  }

  async function handleToggleVisibility(id: string, hidden: boolean) {
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, admin_hidden: hidden } : c))
    );
    await fetch("/api/admin/toggle-visibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: id, hidden }),
    });
  }

  async function handleUnreject(id: string) {
    setCreators((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, rejected: false, approved: false } : c
      )
    );
    await fetch("/api/admin/unreject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorId: id }),
    });
  }

  async function handleVerifyBrand(id: string) {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, verified: true, rejected: false } : b
      )
    );
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: id }),
    });
  }

  async function handleRejectBrand(id: string) {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, rejected: true, verified: false } : b
      )
    );
    await fetch("/api/admin/reject-brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: id }),
    });
  }

  async function handleUnrejectBrand(id: string) {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, rejected: false, verified: false } : b
      )
    );
    await fetch("/api/admin/unreject-brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: id }),
    });
  }

  async function handleCancelAgreement(entry: AgreementEntry) {
    setAgreements((prev) =>
      prev.filter(
        (a) =>
          !(
            a.conversationId === entry.conversationId &&
            a.who === entry.who &&
            a.format === entry.format
          )
      )
    );
    await fetch("/api/admin/cancel-agreement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: entry.conversationId,
        who: entry.who,
        format: entry.format,
      }),
    });
  }

  return (
    <section className="relative">
      <div className="container-x py-10 sm:py-14">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-normal tracking-tight text-ink-50 sm:text-4xl">
              Admin Panel
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
              {section === "creators"
                ? "Creator management"
                : section === "brands"
                ? "Brand management"
                : "Agreements"}
            </p>
          </div>
          <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
        </header>

        <div className="mt-6 inline-flex rounded-full border border-ink-800 bg-ink-900 p-1">
          <SectionButton
            active={section === "creators"}
            onClick={() => {
              setSection("creators");
              setTab("pending");
            }}
          >
            Creators
          </SectionButton>
          <SectionButton
            active={section === "brands"}
            onClick={() => {
              setSection("brands");
              setTab("pending");
            }}
          >
            Brands
          </SectionButton>
          <SectionButton
            active={section === "agreements"}
            onClick={() => setSection("agreements")}
          >
            Agreements
          </SectionButton>
        </div>

        {section === "agreements" ? (
          <AgreementsPanel
            agreements={agreements}
            onCancel={handleCancelAgreement}
          />
        ) : section === "creators" ? (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total Applications"
                value={creators.length}
              />
              <StatCard
                icon={ShieldCheck}
                label="Approved"
                value={approvedCreators.length}
              />
              <StatCard
                icon={Radio}
                label="Live on Network"
                value={liveCreators.length}
              />
              <StatCard
                icon={Handshake}
                label="Deals Completed"
                value={totalDeals}
              />
            </div>

            <div className="mt-8 flex items-center gap-1 border-b border-ink-800">
              <TabButton
                active={tab === "pending"}
                onClick={() => setTab("pending")}
                count={pendingCreators.length}
              >
                Pending
              </TabButton>
              <TabButton
                active={tab === "approved"}
                onClick={() => setTab("approved")}
                count={approvedCreators.length}
              >
                Approved
              </TabButton>
              <TabButton
                active={tab === "rejected"}
                onClick={() => setTab("rejected")}
                count={rejectedCreators.length}
              >
                Rejected
              </TabButton>
            </div>

            <div className="mt-6">
              {tab === "pending" ? (
                pendingCreators.length === 0 ? (
                  <EmptyState text="No pending applications." />
                ) : (
                  <div className="space-y-3">
                    {pendingCreators.map((c) => (
                      <PendingRow
                        key={c.id}
                        creator={c}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )
              ) : tab === "approved" ? (
                approvedCreators.length === 0 ? (
                  <EmptyState text="No approved creators yet." />
                ) : (
                  <div className="space-y-3">
                    {approvedCreators.map((c) => (
                      <ApprovedRow
                        key={c.id}
                        creator={c}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    ))}
                  </div>
                )
              ) : rejectedCreators.length === 0 ? (
                <EmptyState text="No rejected applications." />
              ) : (
                <div className="space-y-3">
                  {rejectedCreators.map((c) => (
                    <RejectedRow
                      key={c.id}
                      creator={c}
                      onUnreject={handleUnreject}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard
                icon={Building2}
                label="Total Applications"
                value={brands.length}
              />
              <StatCard
                icon={BadgeCheck}
                label="Verified"
                value={verifiedBrands.length}
              />
              <StatCard
                icon={X}
                label="Rejected"
                value={rejectedBrands.length}
              />
            </div>

            <div className="mt-8 flex items-center gap-1 border-b border-ink-800">
              <TabButton
                active={tab === "pending"}
                onClick={() => setTab("pending")}
                count={pendingBrands.length}
              >
                Pending
              </TabButton>
              <TabButton
                active={tab === "approved"}
                onClick={() => setTab("approved")}
                count={verifiedBrands.length}
              >
                Verified
              </TabButton>
              <TabButton
                active={tab === "rejected"}
                onClick={() => setTab("rejected")}
                count={rejectedBrands.length}
              >
                Rejected
              </TabButton>
            </div>

            <div className="mt-6">
              {tab === "pending" ? (
                pendingBrands.length === 0 ? (
                  <EmptyState text="No pending applications." />
                ) : (
                  <div className="space-y-3">
                    {pendingBrands.map((b) => (
                      <BrandPendingRow
                        key={b.id}
                        brand={b}
                        onVerify={handleVerifyBrand}
                        onReject={handleRejectBrand}
                      />
                    ))}
                  </div>
                )
              ) : tab === "approved" ? (
                verifiedBrands.length === 0 ? (
                  <EmptyState text="No verified brands yet." />
                ) : (
                  <div className="space-y-3">
                    {verifiedBrands.map((b) => (
                      <BrandVerifiedRow key={b.id} brand={b} />
                    ))}
                  </div>
                )
              ) : rejectedBrands.length === 0 ? (
                <EmptyState text="No rejected applications." />
              ) : (
                <div className="space-y-3">
                  {rejectedBrands.map((b) => (
                    <BrandRejectedRow
                      key={b.id}
                      brand={b}
                      onUnreject={handleUnrejectBrand}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SectionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 font-sans text-sm font-medium transition-colors ${
        active
          ? "bg-accent text-ink-950"
          : "text-ink-300 hover:text-ink-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900 p-5">
      <Icon className="h-4 w-4 text-ink-400" strokeWidth={1.6} />
      <p className="mt-3 font-display text-2xl font-medium tracking-tight text-ink-50">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 pb-3 pt-2 font-sans text-sm font-medium transition-colors ${
        active
          ? "border-accent text-ink-50"
          : "border-transparent text-ink-400 hover:text-ink-200"
      }`}
    >
      {children}
      <span
        className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
          active ? "bg-accent/10 text-accent" : "bg-ink-800 text-ink-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function PendingRow({
  creator,
  onApprove,
  onReject,
}: {
  creator: CreatorRow;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-medium text-ink-50">
          {creator.full_name}
        </p>
        <p className="truncate font-mono text-[11px] text-ink-400">
          {creator.email}
        </p>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        <Detail label="Niche" value={creator.niche} />
        <Detail label="Followers" value={creator.follower_count_range} />
        {creator.subscriber_count != null && creator.subscriber_count > 0 && (
          <Detail
            label="Subs (verified)"
            value={creator.subscriber_count.toLocaleString()}
            accent
          />
        )}
        {creator.avg_engagement_rate != null &&
          creator.avg_engagement_rate > 0 && (
            <Detail
              label="ER"
              value={`${creator.avg_engagement_rate.toFixed(1)}%`}
              accent
            />
          )}
      </div>
      {creator.channel_url && (
        <a
          href={
            creator.channel_url.startsWith("http")
              ? creator.channel_url
              : `https://${creator.channel_url}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />
        </a>
      )}
      <div className="group relative">
        <button
          type="button"
          onClick={() => onReject(creator.id)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-300 transition-all hover:border-red-500/40 hover:text-red-300"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          Reject
        </button>
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink-700 bg-ink-850 px-2.5 py-1.5 font-sans text-xs text-ink-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          Move to rejected
        </span>
      </div>
      <button
        type="button"
        onClick={() => onApprove(creator.id)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 font-sans text-[13px] font-medium text-ink-950 transition-all hover:bg-accent-dim"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Approve
      </button>
    </div>
  );
}

function ApprovedRow({
  creator,
  onToggleVisibility,
}: {
  creator: CreatorRow;
  onToggleVisibility: (id: string, hidden: boolean) => void;
}) {
  const daysConnected = creator.connected_at
    ? Math.floor(
        (Date.now() - new Date(creator.connected_at).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 1;

  const isLive = creator.published && !creator.admin_hidden;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display text-base font-medium text-ink-50">
            {creator.full_name}
          </p>
          {creator.admin_hidden ? (
            <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 font-mono text-[10px] text-yellow-300">
              Hidden
            </span>
          ) : creator.published ? (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
              Live
            </span>
          ) : (
            <span className="rounded-full bg-ink-800 px-2 py-0.5 font-mono text-[10px] text-ink-400">
              Draft
            </span>
          )}
        </div>
        <p className="truncate font-mono text-[11px] text-ink-400">
          {creator.email}
        </p>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        {creator.subscriber_count != null && creator.subscriber_count > 0 && (
          <Detail
            label="Subs"
            value={creator.subscriber_count.toLocaleString()}
          />
        )}
        {creator.avg_engagement_rate != null &&
          creator.avg_engagement_rate > 0 && (
            <Detail
              label="ER"
              value={`${creator.avg_engagement_rate.toFixed(1)}%`}
              accent
            />
          )}
        <Detail label="Days" value={daysConnected.toString()} />
        <Detail
          label="Deals"
          value={(creator.deals_completed ?? 0).toString()}
        />
      </div>
      <VisibilitySwitch
        visible={!creator.admin_hidden}
        onChange={(visible) => onToggleVisibility(creator.id, !visible)}
      />
      {isLive && (
        <a
          href={`/network/${creator.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-200 transition-all hover:border-accent/40 hover:text-accent"
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
          View profile
        </a>
      )}
    </div>
  );
}

function VisibilitySwitch({
  visible,
  onChange,
}: {
  visible: boolean;
  onChange: (visible: boolean) => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onChange(!visible)}
        role="switch"
        aria-checked={visible}
        aria-label="Toggle marketplace visibility"
        className={`relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors ${
          visible
            ? "border-accent/40 bg-accent/20"
            : "border-yellow-500/40 bg-yellow-500/10"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
            visible
              ? "translate-x-6 bg-accent"
              : "translate-x-1 bg-yellow-300"
          }`}
        />
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-ink-700 bg-ink-850 px-2.5 py-1.5 font-sans text-xs text-ink-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {visible ? "Visible on marketplace" : "Hidden from marketplace"}
      </span>
    </div>
  );
}

function RejectedRow({
  creator,
  onUnreject,
}: {
  creator: CreatorRow;
  onUnreject: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-medium text-ink-50">
          {creator.full_name}
        </p>
        <p className="truncate font-mono text-[11px] text-ink-400">
          {creator.email}
        </p>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        <Detail label="Niche" value={creator.niche} />
        <Detail label="Followers" value={creator.follower_count_range} />
        {creator.subscriber_count != null && creator.subscriber_count > 0 && (
          <Detail
            label="Subs (verified)"
            value={creator.subscriber_count.toLocaleString()}
            accent
          />
        )}
        {creator.avg_engagement_rate != null &&
          creator.avg_engagement_rate > 0 && (
            <Detail
              label="ER"
              value={`${creator.avg_engagement_rate.toFixed(1)}%`}
              accent
            />
          )}
      </div>
      {creator.channel_url && (
        <a
          href={
            creator.channel_url.startsWith("http")
              ? creator.channel_url
              : `https://${creator.channel_url}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />
        </a>
      )}
      <button
        type="button"
        onClick={() => onUnreject(creator.id)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-200 transition-all hover:border-accent/40 hover:text-accent"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
        Move to Pending
      </button>
    </div>
  );
}

function BrandPendingRow({
  brand,
  onVerify,
  onReject,
}: {
  brand: BrandRow;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-medium text-ink-50">
          {brand.business_name}
        </p>
        <p className="truncate font-mono text-[11px] text-ink-400">
          {brand.email}
        </p>
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        {brand.social_url && (
          <Detail label="Social" value={truncateUrl(brand.social_url)} />
        )}
      </div>
      <a
        href={
          brand.product_url.startsWith("http")
            ? brand.product_url
            : `https://${brand.product_url}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
      >
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />
      </a>
      <button
        type="button"
        onClick={() => onReject(brand.id)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-300 transition-all hover:border-red-500/40 hover:text-red-300"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
        Reject
      </button>
      <button
        type="button"
        onClick={() => onVerify(brand.id)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 font-sans text-[13px] font-medium text-ink-950 transition-all hover:bg-accent-dim"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        Verify
      </button>
      </div>
      <BrandBio bio={brand.bio} />
    </div>
  );
}

function BrandVerifiedRow({ brand }: { brand: BrandRow }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display text-base font-medium text-ink-50">
            {brand.business_name}
          </p>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            Verified
          </span>
        </div>
        <p className="truncate font-mono text-[11px] text-ink-400">
          {brand.email}
        </p>
      </div>
      {brand.social_url && (
        <a
          href={
            brand.social_url.startsWith("http")
              ? brand.social_url
              : `https://${brand.social_url}`
          }
          target="_blank"
          rel="noopener noreferrer"
          title="Social media"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.6} />
        </a>
      )}
      <a
        href={
          brand.product_url.startsWith("http")
            ? brand.product_url
            : `https://${brand.product_url}`
        }
        target="_blank"
        rel="noopener noreferrer"
        title="Product link"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
      >
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />
      </a>
      </div>
      <BrandBio bio={brand.bio} />
    </div>
  );
}

function BrandRejectedRow({
  brand,
  onUnreject,
}: {
  brand: BrandRow;
  onUnreject: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-medium text-ink-50">
          {brand.business_name}
        </p>
        <p className="truncate font-mono text-[11px] text-ink-400">
          {brand.email}
        </p>
      </div>
      <a
        href={
          brand.product_url.startsWith("http")
            ? brand.product_url
            : `https://${brand.product_url}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-50"
      >
        <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.6} />
      </a>
      <button
        type="button"
        onClick={() => onUnreject(brand.id)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-200 transition-all hover:border-accent/40 hover:text-accent"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
        Move to Pending
      </button>
      </div>
      <BrandBio bio={brand.bio} />
    </div>
  );
}

function BrandBio({ bio }: { bio: string | null }) {
  const hasBio = bio && bio.trim().length > 0;
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-850 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
        About
      </p>
      <p
        className={`mt-1.5 whitespace-pre-wrap font-sans text-[13px] leading-relaxed ${
          hasBio ? "text-ink-200" : "italic text-ink-500"
        }`}
      >
        {hasBio ? bio : "No bio yet."}
      </p>
    </div>
  );
}

function truncateUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").slice(0, 24);
}

function Detail({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="text-right">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-400">
        {label}
      </p>
      <p
        className={`font-display text-sm font-medium tracking-tight ${
          accent ? "text-accent" : "text-ink-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-700 bg-ink-900/50 py-12 text-center">
      <p className="font-sans text-sm text-ink-400">{text}</p>
    </div>
  );
}

function AgreementsPanel({
  agreements,
  onCancel,
}: {
  agreements: AgreementEntry[];
  onCancel: (entry: AgreementEntry) => Promise<void>;
}) {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Handshake}
          label="Total Agreements"
          value={agreements.length}
        />
        <StatCard
          icon={BadgeCheck}
          label="Brand Agreements"
          value={agreements.filter((a) => a.who === "brand").length}
        />
        <StatCard
          icon={Users}
          label="Creator Agreements"
          value={agreements.filter((a) => a.who === "creator").length}
        />
      </div>
      <div className="mt-8">
        {agreements.length === 0 ? (
          <EmptyState text="No agreements yet." />
        ) : (
          <div className="space-y-3">
            {agreements.map((a) => (
              <AgreementRow
                key={`${a.conversationId}:${a.who}:${a.format}`}
                entry={a}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgreementRow({
  entry,
  onCancel,
}: {
  entry: AgreementEntry;
  onCancel: (entry: AgreementEntry) => Promise<void>;
}) {
  const [mode, setMode] = useState<"idle" | "confirming">("idle");
  const [submitting, setSubmitting] = useState(false);
  const date = entry.agreedAt
    ? new Date(entry.agreedAt).toLocaleString()
    : "—";

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 px-5 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display text-base font-medium text-ink-50">
            {entry.brandName}
          </p>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
            &mdash;
          </span>
          <p className="font-display text-base font-medium text-ink-50">
            {entry.creatorName}
          </p>
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
          {date}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
            entry.who === "brand"
              ? "bg-accent/10 text-accent"
              : "bg-blue-500/10 text-blue-300"
          }`}
        >
          {entry.who === "brand" ? "Brand agreed" : "Creator agreed"}
        </span>
        <span className="inline-flex items-center rounded-full border border-ink-700 bg-ink-850 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-200">
          {entry.format === "long" ? "Long" : "Short"}
        </span>
      </div>
      {mode === "idle" ? (
        <button
          type="button"
          onClick={() => setMode("confirming")}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-4 font-sans text-[13px] font-medium text-ink-300 transition-all hover:border-red-500/40 hover:text-red-300"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
          Cancel agreement
        </button>
      ) : (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await onCancel(entry);
              } finally {
                setSubmitting(false);
                setMode("idle");
              }
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-red-500/90 px-4 font-sans text-[13px] font-medium text-ink-50 transition-all hover:bg-red-500 disabled:opacity-60"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            {submitting ? "Canceling\u2026" : "Confirm cancel"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => setMode("idle")}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 px-3 font-sans text-[13px] font-medium text-ink-300 transition-all hover:border-ink-600 hover:text-ink-50 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            Back
          </button>
        </div>
      )}
    </div>
  );
}
