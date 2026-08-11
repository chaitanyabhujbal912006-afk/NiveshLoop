# NiveshLoop (निवेशलूप)

> A free, ad-free platform where beginners learn Indian stock-market investing by practicing immediately in a virtual portfolio — connecting reading directly to doing, with zero real money risk.

![NiveshLoop Passbook Architecture](https://img.shields.io/badge/Stack-Next.js%2014%20|%20TypeScript%20|%20TailwindCSS%20|%20Supabase-1E2A44?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-8C2F39?style=flat-square)
![Build Status](https://img.shields.io/badge/Build-Passing-2F6B4F?style=flat-square)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-2F6B4F?style=flat-square)

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
- **Interactive Visual Elements**: Hyperrealistic 3D tilt passbook, 60fps price-chart canvas engine, live stock tickers, 3D money vault notes, and interactive feature sandboxes.

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
3. **Habit Badges System**:
   - Awards non-decaying habit stamps (`Steady Hand`, `Diversified`, `Patient Holder`, `Did the Homework`, `Cooled Off`, `Diamond Hands`, `Patience Master`, `Disciplined Investor`).
4. **SEBI Scam & Tip Checker (`/scam-checker`)**:
   - Scans WhatsApp forwards and Telegram stock tips against SEBI fraud advisories (guaranteed returns, unregistered channels, urgency pressure, pump-and-dump signals).
5. **Regional Language Support (`EN` | `HI - हिंदी`)**:
   - Full English and Hindi translation toggle for UI labels, passbook headings, and disclaimers.

---

## 🌐 1-Click Vercel & Supabase Deployment Guide

### Prerequisites

- Free [Supabase Account](https://supabase.com)
- Free [Vercel Account](https://vercel.com)

### 1. Database Setup (Supabase)

1. Create a new Supabase project named `niveshloop`.
2. Open **SQL Editor** in Supabase dashboard.
3. Run `supabase/schema.sql` to create tables and RLS security policies.
4. Run `supabase/seed-lessons.sql` to populate curriculum lessons.

### 2. Deployment on Vercel

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Configure Environment Variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`
4. Click **Deploy**. Vercel will automatically build using `vercel.json` settings.

---

## 💻 Local Development Setup

```bash
# Clone repository
git clone https://github.com/chaitanyabhujbal912006-afk/NiveshLoop.git
cd NiveshLoop

# Install dependencies
npm install

# Configure environment variables (.env.local)
cp .env.example .env.local

# Run development server
npm run dev

# Run unit test suite
npx vitest run
```

---

## 📄 Safety Disclaimer

NiveshLoop is an **educational simulation platform**.
- Portfolio balances and stock trades are **100% simulated**.
- Prices are delayed ~15 minutes and sourced for educational demonstration.
- Nothing on NiveshLoop constitutes real financial or investment advice.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
