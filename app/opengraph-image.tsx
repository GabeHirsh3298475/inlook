import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,144,255,0.22), rgba(10,10,11,1) 60%), #0a0a0b",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          color: "#f5f5f5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="7" fill="#0a0a0b" />
            <circle
              cx="16"
              cy="16"
              r="11"
              stroke="#4A90FF"
              strokeWidth="1.8"
              opacity="0.45"
              fill="none"
            />
            <path
              d="M9.5 16.5l4 4 9-9"
              stroke="#4A90FF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              fontSize: 48,
              fontStyle: "italic",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#f5f5f5" }}>Inlook</span>
            <span style={{ color: "#d4ff3a", fontWeight: 800 }}>Beta</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.05,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              maxWidth: 980,
              display: "flex",
            }}
          >
            Connect your brand with creators
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.35,
              color: "#b8b8bd",
              maxWidth: 1020,
              display: "flex",
            }}
          >
            Creator marketplace with verified engagement data, clear pricing, and niche-specific matching.
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 22,
              color: "#8a8a90",
              display: "flex",
            }}
          >
            inlookdeals.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
