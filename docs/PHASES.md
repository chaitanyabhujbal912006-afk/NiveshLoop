# Build Phases — NiveshLoop

Work through these in order. Don't start a phase until the previous one's "Definition of done" is actually true — the whole point of this plan is avoiding a half-finished loop feature sitting on top of a half-finished portfolio feature.

## Phase 0 — Setup (½ day)

- [ ] Create GitHub repo, push this scaffold
- [ ] Create Supabase project, run `supabase/schema.sql`
- [ ] Deploy the empty scaffold to Vercel so the pipeline works before any real feature exists
- [ ] Confirm the price API wrapper returns data for a few known symbols (RELIANCE.NS, TCS.NS)

**Definition of done:** empty app is live on a Vercel URL, connected to Supabase.

## Phase 1 — Core simulation loop, no lessons yet (1-2 weeks)

Build and prove the simulator works in isolation before wiring lessons into it.

- [ ] Auth (sign up / log in) via Supabase
- [ ] On signup, create a `portfolios` row with ₹1,00,000 cash
- [ ] Portfolio dashboard: cash balance, holdings table, current value using cached prices
- [ ] Buy/sell flow: search a symbol, see its delayed price, place a simulated order, see the portfolio update
- [ ] Transaction history list

**Definition of done:** you can create an account, buy 2-3 stocks, sell one, and see correct cash/holdings math with real (delayed) prices — with zero lesson content involved.

## Phase 2 — Lessons + the unlock loop (1-2 weeks)

This is the actual differentiator — don't rush it.

- [ ] Write out all ~12-15 lesson texts *before* writing unlock code (content-first, so the engineering has something real to hook into)
- [ ] `lessons` + `lesson_progress` tables populated and rendered as a simple sequential list
- [ ] Wire `unlocks_action` so completing specific lessons changes behavior elsewhere in the app (e.g., stop-loss lesson → future buy forms show the nudge)
- [ ] Lessons that reference the user's own holdings dynamically (pull their actual positions into the lesson content where relevant)

**Definition of done:** a brand-new user can go lesson 1 → first simulated trade → later lesson → a visibly different trade form, without you manually flipping anything.

## Phase 3 — Behavioral insights (3-5 days)

- [ ] Write insight rules as plain functions over `transactions` (start with 4-5: sold within 24h of buying, no stop-loss set, bought right after a big single-day spike, portfolio concentrated in one stock/sector, held through a drawdown without selling)
- [ ] Insights panel on the dashboard, computed on page load or via a simple button ("refresh my insights") — no need for a cron job at this scale
- [ ] Insight copy must be plain-language and non-judgmental — describe the pattern, don't diagnose the person

**Definition of done:** after doing ~10 trades yourself, at least 2 of the generated insights are things you'd actually agree are true about how you traded.

## Phase 4 — Polish + deploy for real (3-5 days)

- [ ] Responsive pass (mobile especially — most first-time users will be on phones)
- [ ] Every screen showing a price or portfolio value carries the delayed-data / simulation disclaimer
- [ ] Empty states written properly (new user with no trades yet, no lessons done yet)
- [ ] README written as a real project README, not a class-assignment writeup — this is a portfolio piece
- [ ] Get 5-10 real beginners (friends, classmates) to actually use it and watch where they get confused

**Definition of done:** a stranger can use it without you explaining anything out loud.

## Phase 5 — Stretch goals (post-MVP, pick based on what excites you)

Not required for v1. Consider these once Phase 4 is genuinely done:

- **Scam/tip checker** — paste a tip or WhatsApp forward, get a red-flag score built on SEBI's published scam patterns (guaranteed returns, unregistered entities, urgency/secrecy pressure)
- **Gamification tied to habits** — badges for behaviors like "held through volatility" rather than only returns
- **Regional language lesson tracks**
- **Community layer** — leaderboards or shared insights, carefully scoped so it doesn't turn into a returns-flexing contest, which would undermine the whole "learn good habits" premise
