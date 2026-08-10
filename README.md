# NiveshLoop (निवेशलूप)

> A free, ad-free platform where beginners learn Indian stock-market investing by practicing immediately in a virtual portfolio — connecting reading directly to doing, with zero real money risk.

![NiveshLoop Passbook Architecture](https://img.shields.io/badge/Stack-Next.js%2014%20|%20TypeScript%20|%20TailwindCSS%20|%20Supabase-1E2A44?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-8C2F39?style=flat-square)
![Build Status](https://img.shields.io/badge/Build-Passing-2F6B4F?style=flat-square)

---

## 📌 Problem & Vision

Beginners in India don't fail to learn stock market investing because content is missing — Zerodha Varsity and YouTube tutorials cover concepts well. They fail because:
1. **Education is detached from action**: Reading a lesson is separate from opening a demat account and trading.
2. **Simulators act as lead-gen for brokers**: Paper trading apps push urgency, streak mechanics, and return flexing.
3. **No behavioral feedback**: Nobody reflects back *why* a beginner panic-sells after a 5% drop or buys right after an 8% single-day spike.

**NiveshLoop** closes the loop: **Learn → Act → Reflect**.

---

## 🎨 Passbook Design System

Unlike generic dark-mode fintech UIs with neon accents, NiveshLoop's visual identity is built on an authentic **Indian Bank Passbook / Ledger aesthetic**:

- **Paper Background (`#E9EFE7`)**: Soft sage passbook ledger paper texture.
- **Fountain Pen Ink (`#1E2A44`)**: High-contrast indigo body text.
- **Oxblood Stamp Mark (`#8C2F39`)**: Physical validation mark awarded exclusively for Genuine Lesson & Habit Milestone completions (never for trade returns).
- **Tabular Monospaced Numbers**: Every currency figure (`₹`) uses monospaced tabular numerals (`font-mono tabular-nums`).
- **Interactive Visual Charts**: SVG-based sparklines, line graphs, asset allocation bars, and candlestick charts (unlocked dynamically via Lesson 6).

---

## 🏗️ Architecture & Data Model

NiveshLoop runs on a zero-cost infrastructure stack targeting Vercel & Supabase free tiers:

```
┌─────────────────┐       ┌─────────────────────────┐       ┌──────────────────────┐
│  Next.js 14 App │ ───>  │     Supabase Postgres   │ ───>  │  Delayed Price API   │
│ (Vercel Deploy) │       │ (RLS Protected Tables)  │       │ (NSE/BSE ~15m delay) │
└─────────────────┘       └─────────────────────────┘       └──────────────────────┘
```

### Database Schema (Supabase Postgres)

- `portfolios`: Stores cash balance (initialized at ₹1,00,000 virtual money on signup).
- `holdings`: Tracks symbol, quantity, and average buy price.
- `transactions`: Log of all buy/sell orders, execution prices, and stop-loss attachments.
- `lessons` & `lesson_progress`: Sequential lesson tracks and user completion timestamps.
- `insights`: Precomputed behavioral observations (`quick_sell`, `no_stop_loss`, `concentration`, `chased_spike`).
- `price_cache`: Caches delayed stock quotes to minimize external requests.

---

## 🚀 Key Features

1. **Sequential Unlock Loop**:
   - `Lesson 1 (What is a Stock)` unlocks `first_trade` (Trade ticket).
   - `Lesson 3 (Order Types)` unlocks Market vs Limit order toggles.
   - `Lesson 4 (Diversification)` unlocks portfolio concentration checks (>40%).
   - `Lesson 5 (Stop Losses)` unlocks downside protection prompts.
   - `Lesson 6 (Candlesticks)` unlocks interactive Candlestick chart views.
   - `Lesson 8 (Beginner Mistakes)` unlocks the Behavioral Insights panel.
2. **Behavioral Reflection Engine**:
   - Detects panic selling within 24 hours of buying.
   - Identifies unhedged buys (missing stop-loss).
   - Flags single-stock concentration risk (>70% portfolio allocation).
3. **Habit Badges**:
   - Awards non-decaying habit stamps (`Steady Hand`, `Diversified`, `Patient Holder`, `Did the Homework`, `Cooled Off`).
4. **Interactive Visual Charts**:
   - Passbook-styled SVG line charts, candlestick charts with hover crosshairs, and asset allocation breakdown bars.

---

## 💻 Local Development Setup

### Prerequisites

- Node.js 18+
- Free [Supabase](https://supabase.com) account

### Setup Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/chaitanyabhujbal912006-afk/NiveshLoop.git
   cd NiveshLoop
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local` based on `.env.example`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PRICE_API_BASE_URL=https://query1.finance.yahoo.com/v8/finance/chart
   ```

4. **Initialize Database Schema**:
   Run `supabase/schema.sql` and `supabase/seed-lessons.sql` in your Supabase SQL Editor.

5. **Run Development Server & Tests**:
   ```bash
   npm run test
   npm run dev
   ```

---

## 🛡️ Safety & Gamification Guardrails

- **Zero Real Money / Real Brokerage Integration**: Simulation environment only.
- **Educational Disclaimers**: Every screen displaying stock prices carries a visible disclaimer: *"Simulated portfolio. Prices delayed ~15 minutes. Not real money. Not investment advice."*
- **No Advice Copy**: Insight messages describe historical patterns in the user's own past trades — they never recommend future actions.
- **No Activity/Streak Mechanics**: Badges celebrate discipline and reflection, never trade frequency or returns.

---

## 📜 License

MIT License. Educational simulation product built for first-time investors.
