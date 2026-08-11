<div align="center">

# 📖 NiveshLoop (निवेशलूप)

### *Learn. Trade. Reflect.*

**A free, ad-free platform where beginners learn Indian stock-market investing by practicing immediately in a simulated portfolio — connecting reading directly to doing, with zero real money risk.**

[![Next.js 14](https://img.shields.io/badge/Framework-Next.js%2014-1E2A44?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest%2016%2F16%20Passed-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-8C2F39?style=for-the-badge)](LICENSE)

[Live Demo](https://niveshloop.vercel.app) · [Scam Checker](https://niveshloop.vercel.app/scam-checker) · [Report Bug](https://github.com/chaitanyabhujbal912006-afk/NiveshLoop/issues)

</div>

---

> [!IMPORTANT]
> **SIMULATION DISCLAIMER**: NiveshLoop is a 100% simulated educational app. Cash balances (₹1,00,000) and stock trades are virtual. Prices are delayed ~15 minutes. Nothing on NiveshLoop constitutes real brokerage orders or financial advice.

---

## 📌 Problem & Product Philosophy

Beginners in India don't fail to learn stock market investing due to a lack of content — platforms like Zerodha Varsity and YouTube tutorials explain concepts well. They fail because:

1. **Education is detached from action**: Reading an article is completely separate from opening a demat account and placing a order.
2. **Paper trading apps push brokerage gambling**: Traditional paper trading apps incentivize high-frequency trading, return flexing, and FOMO.
3. **No behavioral feedback**: Nobody reflects back *why* a beginner panic-sells after a 4% dip or buys right after an 8% single-day spike.

**NiveshLoop** closes the loop with a three-step cycle: **Learn → Act → Reflect**.

```
                ┌────────────────────────┐
                │   1. Read the Lesson   │
                └───────────┬────────────┘
                            │
                            ▼
                ┌────────────────────────┐
                │   2. Execute Trade     │
                └───────────┬────────────┘
                            │
                            ▼
                ┌────────────────────────┐
                │ 3. Reflect on Pattern  │
                └────────────────────────┘
```

---

## 🎨 Passbook Design System

NiveshLoop rejects generic dark-mode fintech tropes (neon greens, flashing numbers, stress timers) in favor of a physical **Indian Bank Passbook / Ledger aesthetic**:

> [!NOTE]
> - **Paper Texture (`#E9EFE7`)**: Soft sage ledger paper background.
> - **Fountain Pen Ink (`#1E2A44`)**: High-contrast indigo body typography using *Fraunces* display font & *Inter*.
> - **Oxblood Stamp (`#8C2F39`)**: Physical validation mark awarded *only* for genuine lesson completion & habit milestones (never for trade profits).
> - **Tabular Monospaced Numbers**: Every currency figure (`₹`) strictly uses monospaced tabular numerals (`font-mono tabular-nums`).
> - **Rich Visual FX**: 3D interactive tilt passbook, 60fps price-chart canvas engine, live tickers, 3D money vault notes, and interactive feature sandboxes.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER (Next.js 14)                      │
│                                                                             │
│  [/] Homepage         [/lessons] Curriculum     [/dashboard] Passbook Ledger │
│  Canvas Chart Engine   Sequential Unlocks        Holdings & Portfolio Gauge │
│  3D Passbook Widget    Reading Progress Bar      Habit Badges & Insights    │
│  Live Stock Ticker     Interactive Lesson Cards  SEBI Scam Checker (/scam)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND API LAYER                               │
│                                                                             │
│  /api/trade           /api/insights           /api/check-tip                │
│  Server-side Math      Behavioral Detectors    SEBI Red-Flag Rule Engine     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER (Supabase Postgres)                      │
│                                                                             │
│  portfolios (₹1L virtual cash)   holdings (qty, avg_price)                  │
│  transactions (buy/sell history) lesson_progress (timestamps)               │
│  price_cache (delayed NSE quotes) RLS Policies (User Row Isolation)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Curriculum & Progressive Unlock Matrix

| Lesson Code | Lesson Title | Concept Covered | Unlocked Application Feature |
| :--- | :--- | :--- | :--- |
| **L-01** | What is a stock? | Equity ownership basics | `first_trade` (Unlocks Trade Ticket) |
| **L-02** | How prices move | Supply, demand & bids | Practice order execution |
| **L-03** | Order types: market vs limit | Slippage & price limits | `limit_order_option` (Unlocks Limit Orders) |
| **L-04** | Diversification | Sector & single-stock risk | `concentration_nudge` (>40% allocation alert) |
| **L-05** | Stop-losses | Downside capital protection | `stop_loss_nudge` (Unlocks Stop-Loss trigger input) |
| **L-06** | Reading a candlestick chart | OHLC candles & trends | `chart_view` (Unlocks Candlestick chart) |
| **L-07** | Index funds vs stock picking | Active vs passive strategy | `index_fund_tagging` |
| **L-08** | Common beginner mistakes | FOMO & panic selling | `insights_panel` (Unlocks Behavioral Reflection) |
| **L-09** | Emotional investing | Cooldown & market volatility | `cooldown_nudge` (10s reflective pause screen) |
| **L-10** | Reading financial news | Filtering noise from facts | `news_tab` |
| **L-11** | Taxes & brokerage basics | STCG, LTCG & STT simulation | `fee_simulation` |
| **L-12** | Long-term vs short-term | Compounding horizon | `holding_period_stamp` |
| **L-13** | Building a watchlist | Tracking company signals | `watchlist` |
| **L-14** | Your investing personality | Risk profile evaluation | `insights_panel_v2` |
| **L-15** | What next? | Moving safely to real markets | Graduation stamp |

---

## 🎖️ Behavioral Insights & Habit Badges

Unlike trading apps that reward returns or trading frequency, NiveshLoop badges celebrate **discipline, patience, and risk management**:

| Badge Name | Icon | Earning Criteria | Underlying Habit |
| :--- | :---: | :--- | :--- |
| **Steady Hand** | ✋ | Held positions through a sharp drop without panic selling | Emotional composure |
| **Diversified** | 🌐 | Maintained active positions across 3+ distinct symbols/sectors | Risk distribution |
| **Patient Holder** | ⏳ | Held an active position for an extended holding period | Long-term orientation |
| **Did the Homework** | 📚 | Completed 5+ lessons before/alongside placing trades | Education-first action |
| **Cooled Off** | 🧊 | Respected a 10s cooldown pause prompt without panic selling | Impulse control |
| **Diamond Hands** | 💎 | Maintained positions during simulated market drawdowns | Conviction |
| **Patience Master** | 🧘 | Avoided overtrading & kept disciplined cash reserves | Cash management |
| **Disciplined Investor** | 🛡️ | Attached stop-loss protection to 3+ consecutive buy orders | Risk hedging |

---

## 🛡️ SEBI Scam & Tip Checker (`/scam-checker`)

Users can paste any WhatsApp forward, Telegram tip, or SMS recommendation to scan against SEBI's published fraud advisories:

| Flag Category | Sample Trigger Phrasing | SEBI Regulatory Reference |
| :--- | :--- | :--- |
| **Guaranteed Returns** | *"100% guaranteed profit"*, *"risk free"* | SEBI PFUTP Fraudulent Practices Regulations |
| **Unregistered Channel** | *"VIP Telegram channel"*, *"WhatsApp tip group"* | SEBI (Research Analysts) Regulations, 2014 |
| **Urgency & FOMO** | *"Buy before 9:15 AM"*, *"upper circuit tomorrow"* | SEBI Cautionary Notice on Market Manipulation |
| **Pump & Dump** | *"Penny stock rocket 1000%"*, *"operator stock"* | SEBI Bulk SMS Stock Manipulation Orders |
| **Fake SEBI Claim** | *"100% SEBI approved tip"* | SEBI Advisory on Misuse of Registration Numbers |

---

## 🌐 Regional Language Support (`EN` \| `HI - हिंदी`)

NiveshLoop includes native English and Hindi internationalization:
- **Language Switcher**: Toggle `EN` | `HI (हिंदी)` pill in the top navigation bar.
- **Localized UI**: UI labels, passbook headings, trade action prompts, and disclaimers render in clean Devanagari Hindi typography.

---

## 🚀 1-Click Deployment Guide (Vercel & Supabase)

### Prerequisites

- Free [Supabase Account](https://supabase.com)
- Free [Vercel Account](https://vercel.com)

### 1. Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Paste and run [`supabase/schema.sql`](file:///c:/projects/Niveshloop/supabase/schema.sql) to set up tables and RLS security.
4. Paste and run [`supabase/seed-lessons.sql`](file:///c:/projects/Niveshloop/supabase/seed-lessons.sql) to populate curriculum lessons.

### 2. Deploy to Vercel

1. Push your repository to GitHub.
2. Click **New Project** in Vercel and select your repository.
3. Add the following Environment Variables in Vercel:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
4. Click **Deploy**. Vercel will automatically build and serve production static/dynamic assets according to [`vercel.json`](file:///c:/projects/Niveshloop/vercel.json).

---

## 💻 Local Development & Testing

> [!TIP]
> Run the local development server and test suite locally:

```bash
# 1. Clone repository
git clone https://github.com/chaitanyabhujbal912006-afk/NiveshLoop.git
cd NiveshLoop

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env.local

# 4. Start development server
npm run dev

# 5. Run Vitest unit tests (16/16 tests)
npx vitest run

# 6. Run TypeScript type check
npx tsc --noEmit
```

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <b>Built for Indian Stock Market Beginners · Free & Ad-Free Forever</b>
</div>
