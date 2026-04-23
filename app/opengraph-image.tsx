import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Inlook - Creator marketplace with verified engagement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,144,255,0.22), rgba(10,10,11,1) 60%)",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            width={64}
            height={64}
            src={
              "data:image/svg+xml;utf8," +
              encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='64' height='64' rx='14' fill='#4A90FF'/><path d='M18 33 l10 10 l18 -22' fill='none' stroke='#0a0a0b' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/></svg>`
              )
            }
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#f5f5f5" }}>Inlook</span>
            <span
              style={{
                color: "#0a0a0b",
                backgroundColor: "#d4ff3a",
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 28,
              }}
            >
              Beta
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              maxWidth: 1000,
            }}
          >
            Connect your brand with creators
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.35,
              color: "#b8b8bd",
              maxWidth: 1020,
            }}
          >
            Creator marketplace with verified engagement data, clear pricing,
            and niche-specific matching.
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#8a8a90" }}>
            inlookdeals.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
