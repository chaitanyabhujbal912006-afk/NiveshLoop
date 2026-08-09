import type { Config } from "tailwindcss";

// Design direction (see docs/ARCHITECTURE.md §9): calm, trustworthy, not hype-y.
// Deep teal/forest as primary, warm off-white background — deliberately avoiding
// the generic "AI app" cream+terracotta or near-black+neon defaults.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#F7F5EF",
        foreground: "#1A2E2B",
        primary: {
          DEFAULT: "#1F4E42",
          light: "#2E6B58",
          dark: "#123028",
        },
        accent: "#C77B4B",
        muted: "#8B9490",
        danger: "#9C3B3B",
        success: "#3B7A57",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
