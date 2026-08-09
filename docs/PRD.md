# PRD — NiveshLoop

**One-liner:** A free, ad-free platform where beginners learn Indian stock-market investing by immediately practicing what they just read — no separate "lessons app" and "trading simulator," one connected loop, with virtual money only.

Working name: **NiveshLoop** ("nivesh" = investment; the loop is learn → act → reflect). Rename freely — the docs use this name as a placeholder.

---

## 1. Problem

Existing tools cover pieces of this, not the whole thing:

- **Education** (e.g. Zerodha Varsity) is excellent but static — reading, not doing.
- **Paper trading apps** (Moneybhai, TradingView, Stoxra, Neostox) simulate trades well but treat education as a bolted-on blog, not something tied to the action you're about to take.
- **Safety tools** (SEBI's Spot-a-Scam, SEBI Check) are real and useful but live on a separate government site — nobody opens them in the moment a WhatsApp "guaranteed returns" tip arrives.
- Most simulators exist as **lead-gen for a broker** — free now, upsell later.

Beginners don't fail because content doesn't exist. They fail because nothing connects "I just learned this" to "here's what I'd actually do" to "here's the mistake I keep making."

## 2. Target user

A first-time investor in India — likely a student or early-career professional — who has never placed a real trade, is curious but nervous about losing money, and is currently learning (if at all) from scattered YouTube videos and static articles.

## 3. Goals (v1)

1. A user can complete a short lesson and immediately perform the related action in a simulated portfolio.
2. A user can see a running virtual portfolio (cash + holdings) using real (delayed) NSE/BSE prices.
3. After a handful of trades, the user gets a plain-language reflection on patterns in their own behavior (panic-selling, no stop-loss, chasing spikes).
4. Everything is free, with no upsell path baked into the product.

## 4. Non-goals (v1)

- No real money, real brokerage integration, or real order placement — simulation only.
- No true real-time data (delayed data is fine and should be labeled as such).
- No mobile app — responsive web only.
- No scam/tip checker, gamification, leaderboards, or vernacular language support yet — these are v2 (see `PHASES.md`).
- No personalized financial advice of any kind. The product teaches concepts and reflects behavior; it never tells a user what to buy.

## 5. Core user journey (the loop)

1. Sign up → given ₹1,00,000 virtual cash.
2. Lesson unlocks an action (e.g., "What is a stock?" → "Buy 1 share of a company you recognize").
3. User performs the action in the simulated portfolio; the UI shows the immediate effect (cash reduced, holding appears).
4. Later lessons reference the user's own live positions as examples (e.g., "your TCS position is down 2% today — here's why that's normal").
5. Certain lessons attach *nudges* to the trade form itself going forward (e.g., once the stop-loss lesson is done, every future buy order prompts for one).
6. After N trades, an insights panel shows 2-4 plain-language behavioral observations generated from the user's own transaction history.

## 6. Feature scope — v1 (MVP)

- Auth (email/password via Supabase Auth)
- Virtual portfolio: cash balance, holdings, buy/sell against delayed prices
- ~12-15 lessons covering: what a stock is, how prices move, order types, diversification, stop-losses, common beginner mistakes, reading a candlestick, index funds vs. stock-picking
- Lesson → action unlock system
- Transaction history
- Rule-based behavioral insights (no ML needed for v1 — see `ARCHITECTURE.md`)
- Clear, persistent UI labeling: "Simulated portfolio. Prices delayed ~15 min. Not real money. Not investment advice."

## 7. Feature scope — later (v2+)

See `PHASES.md` Phase 5. Briefly: scam/tip red-flag checker (built on SEBI's public red-flag criteria), gamification tied to *habits* not returns, regional-language lesson tracks, community leaderboards.

## 8. Success metrics (for a student project, keep these honest)

- Does a first-time user complete the first 3 lessons without getting confused about what's "real" vs. simulated? (Test this with 5-10 real beginners, not just yourself.)
- Does the insights panel say something the user recognizes as true about their own behavior? (Qualitative — ask them.)
- Does the app run entirely on free tiers at your expected usage (a few dozen concurrent users)?

## 9. Constraints

- Zero budget: every service used must have a free tier sufficient for a portfolio-scale project.
- No licensed real-time exchange data — delayed data from a free source only (see `ARCHITECTURE.md`).
- Must carry a visible educational-simulation disclaimer on every screen that shows a "portfolio" or "price," to stay unambiguously outside investment-advice territory.

## 10. Open questions to resolve before Phase 2

- Exact lesson content and ordering (write this out fully before building the unlock logic — see `PHASES.md` Phase 1 deliverables).
- Final product name/branding.
