import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          950: "#0a0a0b",
          900: "#0f0f11",
          850: "#141418",
          800: "#1a1a1f",
          700: "#24242a",
          600: "#2e2e35",
          500: "#45454d",
          400: "#6b6b74",
          300: "#9b9ba3",
          200: "#c9c9ce",
          100: "#e8e6e0",
          50: "#f6f4ef",
        },
        accent: {
          DEFAULT: "#4A90FF",
          dim: "#3A7DE6",
          deep: "#1C4B8C",
          glow: "rgba(74, 144, 255, 0.18)",
        },
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        tight: "-0.02em",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px -24px rgba(0,0,0,0.6)",
        "card-hover":
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(74,144,255,0.2), 0 28px 60px -28px rgba(74,144,255,0.12)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(10,10,11,0) 0%, rgba(10,10,11,0.9) 85%), radial-gradient(circle at 50% 0%, rgba(74,144,255,0.08), transparent 40%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
