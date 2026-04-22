"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import {
  NICHES,
  PLATFORMS,
  FOLLOWER_BUCKETS,
  type Platform,
} from "@/lib/creators";
import { cn } from "@/lib/utils";

export type Filters = {
  niches: Set<string>;
  platforms: Set<Platform>;
  followerBucket: string | null;
};

type DropdownId = "niche" | "platform" | "followers";

export function FilterBar({
  filters,
  setFilters,
  resultCount,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  resultCount: number;
}) {
  const [openId, setOpenId] = useState<DropdownId | null>(null);

  const hasFilters =
    filters.niches.size > 0 ||
    filters.platforms.size > 0 ||
    filters.followerBucket !== null;

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  return (
    <section
      aria-label="Filter creators"
      className="relative z-20 rounded-2xl border border-ink-800 bg-ink-900/60 p-4 backdrop-blur-sm sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="eyebrow mr-2">Filters</p>

        <Dropdown
          id="niche"
          openId={openId}
          setOpenId={setOpenId}
          label="Niche"
          summary={summarizeMulti(filters.niches.size)}
          active={filters.niches.size > 0}
        >
          <div className="flex max-w-[280px] flex-wrap gap-2 p-3">
            {NICHES.map((n) => (
              <Chip
                key={n}
                active={filters.niches.has(n)}
                onClick={() =>
                  setFilters({
                    ...filters,
                    niches: toggle(filters.niches, n),
                  })
                }
              >
                {n}
              </Chip>
            ))}
          </div>
        </Dropdown>

        <Dropdown
          id="platform"
          openId={openId}
          setOpenId={setOpenId}
          label="Platform"
          summary={summarizeMulti(filters.platforms.size)}
          active={filters.platforms.size > 0}
        >
          <div className="flex max-w-[260px] flex-wrap gap-2 p-3">
            {PLATFORMS.map((p) => (
              <Chip
                key={p}
                active={filters.platforms.has(p)}
                onClick={() =>
                  setFilters({
                    ...filters,
                    platforms: toggle(filters.platforms, p),
                  })
                }
              >
                {p}
              </Chip>
            ))}
          </div>
        </Dropdown>

        <Dropdown
          id="followers"
          openId={openId}
          setOpenId={setOpenId}
          label="Followers"
          summary={filters.followerBucket}
          active={filters.followerBucket !== null}
        >
          <div className="flex min-w-[200px] flex-col p-2">
            {FOLLOWER_BUCKETS.map((b) => (
              <Option
                key={b.label}
                active={filters.followerBucket === b.label}
                onClick={() =>
                  setFilters({
                    ...filters,
                    followerBucket:
                      filters.followerBucket === b.label ? null : b.label,
                  })
                }
              >
                {b.label}
              </Option>
            ))}
          </div>
        </Dropdown>

        <div className="ml-auto flex items-center gap-4">
          {hasFilters ? (
            <button
              onClick={() =>
                setFilters({
                  niches: new Set(),
                  platforms: new Set(),
                  followerBucket: null,
                })
              }
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-300 transition-colors duration-200 hover:text-accent"
            >
              <X className="h-3 w-3" strokeWidth={1.8} />
              Clear
            </button>
          ) : null}
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
            <span className="font-display text-base font-medium text-ink-50">
              {resultCount}
            </span>{" "}
            creators
          </p>
        </div>
      </div>
    </section>
  );
}

function summarizeMulti(count: number): string | null {
  if (count === 0) return null;
  return count === 1 ? "1 selected" : `${count} selected`;
}

function Dropdown({
  id,
  openId,
  setOpenId,
  label,
  summary,
  active,
  children,
}: {
  id: DropdownId;
  openId: DropdownId | null;
  setOpenId: (id: DropdownId | null) => void;
  label: string;
  summary: string | null;
  active: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const open = openId === id;

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpenId]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 font-sans text-[13px] tracking-tight transition-colors duration-200",
          active
            ? "border-accent/60 bg-accent/10 text-ink-50"
            : "border-ink-700 bg-ink-850 text-ink-200 hover:border-ink-600 hover:text-ink-50"
        )}
      >
        <span>{label}</span>
        {summary ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            {summary}
          </span>
        ) : null}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-ink-400 transition-transform duration-200",
            open && "rotate-180 text-ink-200"
          )}
          strokeWidth={1.8}
        />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-ink-800 bg-ink-900 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.8)]"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function Chip({
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
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3.5 font-sans text-[12px] tracking-tight transition-all duration-200",
        active
          ? "border-accent bg-accent text-ink-950"
          : "border-ink-700 bg-ink-850 text-ink-200 hover:border-ink-600 hover:text-ink-50"
      )}
    >
      {children}
    </button>
  );
}

function Option({
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
      role="option"
      aria-selected={active}
      className={cn(
        "flex h-9 items-center justify-between rounded-lg px-3 font-sans text-[13px] tracking-tight transition-colors duration-150",
        active
          ? "bg-accent/10 text-accent"
          : "text-ink-200 hover:bg-ink-850 hover:text-ink-50"
      )}
    >
      <span>{children}</span>
      {active ? (
        <svg
          viewBox="0 0 12 12"
          className="h-3 w-3"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6l2.5 2.5L9.5 3.5" />
        </svg>
      ) : null}
    </button>
  );
}
