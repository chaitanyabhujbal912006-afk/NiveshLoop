# Product Logic — NiveshLoop

This is the exact "what opens when" logic — read this before building any unlock-related UI.

## Design constraint (non-negotiable, see AGENTS.md)

Progression rewards **habits**, never **trading activity**. No mechanic in this app should give a user a reason to trade *more* than they otherwise would. Concretely:
- No streak that breaks from inactivity (only from a demonstrated bad habit, e.g. panic-selling)
- No leaderboard ranked by returns
- No countdown timers, "act now" urgency, or push notifications about price moves
- No confetti or celebratory animation tied to a trade's profitability — the stamp celebrates *lessons and habits*, never "you made money"

## 1. Lesson unlock table

Lessons are mostly sequential (`order_index` in the `lessons` table), but each lesson's real effect is what it unlocks elsewhere in the app — that's the actual product, not the reading itself.

| # | Lesson slug | What it unlocks |
|---|---|---|
| 1 | `what-is-a-stock` | `first_trade` — trade ticket becomes usable for the first time |
| 2 | `how-prices-move` | nothing structural — sets up context for lesson 6 |
| 3 | `order-types` | `limit_order_option` — trade ticket offers market vs. limit |
| 4 | `diversification` | `concentration_nudge` — warns if a buy would push one holding above 40% of portfolio value |
| 5 | `stop-losses` | `stop_loss_nudge` — every buy order form now prompts for an optional stop-loss |
| 6 | `reading-a-candlestick` | `chart_view` — holding detail page shows a candlestick chart instead of a plain line |
| 7 | `index-funds-vs-stock-picking` | index funds/ETFs appear in symbol search, tagged "lower risk" |
| 8 | `common-beginner-mistakes` | `insights_panel` — the behavioral insights panel appears on the dashboard for the first time |
| 9 | `emotional-investing` | `cooldown_nudge` — see §2 below |
| 10 | `reading-financial-news` | a curated, non-personalized headlines tab appears |
| 11 | `taxes-and-brokerage-basics` | trade ticket starts simulating brokerage + STT deduction, for realism |
| 12 | `long-term-vs-short-term` | passbook shows a holding-period stamp (30+ / 180+ days) on positions |
| 13 | `building-a-watchlist` | watchlist feature unlocks |
| 14 | `your-investing-personality` | `insights_panel_v2` — richer pattern detection using full transaction history |
| 15 | `what-next` | capstone — no unlock; explains how this maps to eventually opening a real (external) account, reiterates this app never handles real money |

`unlocks_action` in the `lessons` table stores the string in the right column above (`first_trade`, `limit_order_option`, etc.) — the frontend checks a user's completed lessons against this to decide what UI to show. Keep this as a plain lookup, not a rules engine — see `src/lib/unlocks.ts`.

## 2. The cooldown nudge (the one genuinely novel interaction)

This is the closest thing this product has to a "safety feature" baked into the trading flow itself, not bolted on as a separate scam-checker (that's still v2, see `PHASES.md`).

**Trigger:** user attempts to *sell* a holding that dropped 5%+ in the current session, within 2 hours of that drop.

**Behavior:** don't block the sell. Show a 10-15 second non-skippable-but-not-punitive pause screen: *"This position dropped sharply today. Selling now locks in the loss. Take a moment — you can still sell right after."* Then the sell button becomes available. Log whether they proceeded or backed out (feeds the insights panel later — "you paused on 3 panic-sell moments and backed out of 2").

This is friction for reflection, not a block on agency — the user always retains the choice. Never turn this into a hard block, a fee, or anything punitive; that would cross from "helpful pause" into "manipulative dark pattern," which undermines the whole trust premise of the product.

## 3. Habit badges (the "game," designed correctly)

Award, don't rank. No leaderboard in v1 — these are personal, shown only to the user themselves.

| Badge | Earned by |
|---|---|
| Steady Hand | Went through a 5%+ single-day drop on a holding without selling within 2 hours |
| Diversified | Held positions across 3+ different sectors simultaneously |
| Patient Holder | Held any single position for 90+ days |
| Did the Homework | Completed a lesson *before* the trade it relates to, at least 5 times (vs. trading first and reading later) |
| Cooled Off | Triggered the cooldown nudge and chose not to sell, at least once |

Badges are earned once and kept — no decay, no reset. The point is building a track record of good instincts, not maintaining an anxious streak.

## 4. Insights panel logic (Phase 3)

Computed from `transactions`, shown in plain language, never diagnostic or advice-giving. Rules for v1 (see `PHASES.md` Phase 3):

1. Sold within 24h of buying, 3+ times → "You've sold quickly after buying a few times. That's worth noticing — fast exits are often reactions to price, not to new information."
2. No stop-loss set on last 5 buys → "None of your recent buys had a stop-loss attached. Lesson 5 covers why that matters."
3. Bought within 1 day of a symbol's 8%+ single-day spike, 2+ times → "You've bought right after a couple of big single-day jumps. Chasing a spike is different from believing in a company."
4. 70%+ of portfolio value in one symbol → "Most of your simulated portfolio is in one stock. That's a concentration risk, even in a simulation."

Each insight states the *pattern*, never a directive ("you should"). This keeps the product firmly on the "reflect your own behavior back to you" side of the line, never the "here's what to do" side.
