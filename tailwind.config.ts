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
    },
  },
  plugins: [],
};
export default config;
