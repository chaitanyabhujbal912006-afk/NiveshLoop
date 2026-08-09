import type { Config } from "tailwindcss";

// Design system: see docs/DESIGN_SYSTEM.md. Grounded in the Indian bank
// passbook — not generic "clean fintech minimalism." Every color here has a
// stated reason in that doc; don't add new ones without updating it.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#E9EFE7",
        ink: "#1E2A44",
        rule: "#5C7A63",
        stamp: "#8C2F39",
        gain: "#2F6B4F",
        loss: "#A6493F",
        muted: "#6B7568",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        "stamp-press": {
          "0%":   { transform: "scale(1.4)", opacity: "0" },
          "60%":  { transform: "scale(0.97)", opacity: "1" },
          "80%":  { transform: "scale(1.01)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "ink-pulse-gain": {
          "0%":   { backgroundColor: "transparent" },
          "20%":  { backgroundColor: "rgba(47,107,79,0.12)" },
          "100%": { backgroundColor: "transparent" },
        },
        "ink-pulse-loss": {
          "0%":   { backgroundColor: "transparent" },
          "20%":  { backgroundColor: "rgba(166,73,63,0.12)" },
          "100%": { backgroundColor: "transparent" },
        },
        "page-enter": {
          "0%":   { transform: "perspective(1200px) rotateY(20deg) skewY(2deg)", opacity: "0" },
          "100%": { transform: "perspective(1200px) rotateY(0deg) skewY(0deg)", opacity: "1" },
        },
        "page-leave": {
          "0%":   { transform: "perspective(1200px) rotateY(0deg) skewY(0deg)", opacity: "1" },
          "100%": { transform: "perspective(1200px) rotateY(-20deg) skewY(-2deg)", opacity: "0" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "stamp-press": "stamp-press 180ms cubic-bezier(0.25,0,0,1) forwards",
        "ink-pulse-gain": "ink-pulse-gain 400ms ease-out forwards",
        "ink-pulse-loss": "ink-pulse-loss 400ms ease-out forwards",
        "page-enter": "page-enter 260ms cubic-bezier(0.4,0,0.2,1) forwards",
        "page-leave": "page-leave 260ms cubic-bezier(0.4,0,0.2,1) forwards",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
