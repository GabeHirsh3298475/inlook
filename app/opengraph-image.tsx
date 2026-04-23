import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Inlook - Creator marketplace with verified engagement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logoSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 28 28' fill='none'><circle cx='14' cy='14' r='12.5' stroke='#4A90FF' stroke-width='1.2' opacity='0.35'/><path d='M8 13.5l4 4 8-8' stroke='#4A90FF' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>`
    );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0a0b",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,144,255,0.22), rgba(10,10,11,1) 60%)",
          color: "#f5f5f5",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img width={96} height={96} src={logoSvg} />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              fontSize: 76,
              fontStyle: "italic",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              fontFamily: "serif",
            }}
          >
            <span style={{ color: "#f5f5f5" }}>Inlook</span>
            <span style={{ color: "#d4ff3a", fontWeight: 700 }}>Beta</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              maxWidth: 1000,
              fontFamily: "serif",
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
              fontFamily: "sans-serif",
            }}
          >
            Creator marketplace with verified engagement data, clear pricing,
            and niche-specific matching.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#8a8a90",
              fontFamily: "sans-serif",
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
