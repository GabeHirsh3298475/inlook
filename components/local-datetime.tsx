"use client";

import { useEffect, useState } from "react";

function parseIsoAsUtc(input: string): Date {
  const normalized = input.replace(" ", "T");
  const hasTz = /(Z|[+-]\d{2}:?\d{2})$/.test(normalized);
  return new Date(hasTz ? normalized : normalized + "Z");
}

export function LocalDateTime({ iso }: { iso: string }) {
  const [text, setText] = useState<string>("");
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      hourCycle: "h23",
    });
    setText(`${formatter.format(parseIsoAsUtc(iso))} UTC`);
  }, [iso]);
  return <span suppressHydrationWarning>{text || "—"}</span>;
}
