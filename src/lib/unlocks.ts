/**
 * The unlock system: what a completed lesson enables elsewhere in the app.
 * This is a plain lookup, deliberately not a rules engine — see docs/LOGIC.md §1.
 * If you're tempted to make this more "flexible," read the design constraint
 * in docs/LOGIC.md first: every unlock here is a UI/behavior change, never a
 * change to trading permissions or limits.
 */

export type UnlockedAction =
  | "first_trade"
  | "limit_order_option"
  | "concentration_nudge"
  | "stop_loss_nudge"
  | "chart_view"
  | "index_fund_tagging"
  | "insights_panel"
  | "cooldown_nudge"
  | "news_tab"
  | "fee_simulation"
  | "holding_period_stamp"
  | "watchlist"
  | "insights_panel_v2";

/** slug -> action it unlocks. Keep in sync with docs/LOGIC.md §1 and the `lessons` table. */
export const LESSON_UNLOCKS: Record<string, UnlockedAction | null> = {
  "what-is-a-stock": "first_trade",
  "how-prices-move": null,
  "order-types": "limit_order_option",
  diversification: "concentration_nudge",
  "stop-losses": "stop_loss_nudge",
  "reading-a-candlestick": "chart_view",
  "index-funds-vs-stock-picking": "index_fund_tagging",
  "common-beginner-mistakes": "insights_panel",
  "emotional-investing": "cooldown_nudge",
  "reading-financial-news": "news_tab",
  "taxes-and-brokerage-basics": "fee_simulation",
  "long-term-vs-short-term": "holding_period_stamp",
  "building-a-watchlist": "watchlist",
  "your-investing-personality": "insights_panel_v2",
  "what-next": null,
};

/** Given the slugs of a user's completed lessons, return the set of actions available to them. */
export function activeUnlocks(completedSlugs: string[]): Set<UnlockedAction> {
  const active = new Set<UnlockedAction>();
  for (const slug of completedSlugs) {
    const action = LESSON_UNLOCKS[slug];
    if (action) active.add(action);
  }
  return active;
}

export function hasUnlocked(completedSlugs: string[], action: UnlockedAction): boolean {
  return activeUnlocks(completedSlugs).has(action);
}

// --- Cooldown nudge (docs/LOGIC.md §2) ---------------------------------

export interface CooldownCheckInput {
  /** % change of the symbol in the current session, negative for a drop */
  sessionChangePercent: number;
  /** ms since that drop was first observed for this symbol today */
  msSinceDrop: number;
}

const COOLDOWN_DROP_THRESHOLD = -5; // percent
const COOLDOWN_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

/** Should a sell attempt trigger the reflective pause screen? */
export function shouldShowCooldown({ sessionChangePercent, msSinceDrop }: CooldownCheckInput): boolean {
  return sessionChangePercent <= COOLDOWN_DROP_THRESHOLD && msSinceDrop <= COOLDOWN_WINDOW_MS;
}

// --- Habit badges (docs/LOGIC.md §3) ------------------------------------
// Badge-earning logic runs server-side against `transactions` + `holdings` history.
// This is the shape the API should return — actual detection queries belong in
// an API route (e.g. /api/badges), not here, since they need DB access.

export type BadgeId =
  | "steady_hand"
  | "diversified"
  | "patient_holder"
  | "did_the_homework"
  | "cooled_off";

export const BADGES: Record<BadgeId, { label: string; description: string }> = {
  steady_hand: {
    label: "Steady Hand",
    description: "Held through a sharp single-day drop without selling in a panic.",
  },
  diversified: {
    label: "Diversified",
    description: "Held positions across 3 or more sectors at the same time.",
  },
  patient_holder: {
    label: "Patient Holder",
    description: "Held a single position for 90 days or more.",
  },
  did_the_homework: {
    label: "Did the Homework",
    description: "Completed a lesson before making the related trade, five times over.",
  },
  cooled_off: {
    label: "Cooled Off",
    description: "Paused on a reflective prompt and chose not to sell in the heat of the moment.",
  },
};
