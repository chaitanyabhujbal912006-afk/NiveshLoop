"use client";

import { useState } from "react";
import { activeUnlocks, shouldShowCooldown } from "@/lib/unlocks";
import type { TradeSide } from "@/types";

interface TradeTicketProps {
  symbol: string;
  price: number;
  side: TradeSide;
  completedLessonSlugs: string[];
  /** For the cooldown nudge — see docs/LOGIC.md §2. Omit for a buy. */
  sessionChangePercent?: number;
  msSinceDrop?: number;
  onSubmit: (payload: { qty: number; stopLoss: number | null }) => void;
}

/**
 * The one form every lesson eventually points at. Its behavior changes over
 * time as the user completes lessons (docs/LOGIC.md §1) — this component is
 * the concrete implementation of that idea, not just the docs describing it.
 */
export function TradeTicket({
  symbol,
  price,
  side,
  completedLessonSlugs,
  sessionChangePercent = 0,
  msSinceDrop = Infinity,
  onSubmit,
}: TradeTicketProps) {
  const unlocks = activeUnlocks(completedLessonSlugs);
  const [qty, setQty] = useState(1);
  const [stopLoss, setStopLoss] = useState<string>("");
  const [showCooldown, setShowCooldown] = useState(false);

  const showStopLossNudge = unlocks.has("stop_loss_nudge") && side === "buy";
  const showConcentrationNudge = unlocks.has("concentration_nudge");
  const showLimitOption = unlocks.has("limit_order_option");

  const cost = qty * price;

  function handleSubmit() {
    if (
      side === "sell" &&
      unlocks.has("cooldown_nudge") &&
      shouldShowCooldown({ sessionChangePercent, msSinceDrop }) &&
      !showCooldown
    ) {
      setShowCooldown(true);
      return; // wait for the user to come back and confirm
    }
    onSubmit({ qty, stopLoss: stopLoss ? Number(stopLoss) : null });
  }

  if (showCooldown) {
    return (
      <div className="border border-stamp/40 bg-stamp/5 rounded-sm p-6 max-w-sm">
        <p className="font-display text-lg text-ink mb-2">Take a moment</p>
        <p className="font-body text-sm text-ink/80 mb-6">
          {symbol} dropped sharply today. Selling now locks in the loss — you can
          still sell right after this. No rush either way.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCooldown(false)}
            className="font-body text-sm font-medium text-rule hover:underline"
          >
            I&apos;ll wait
          </button>
          <button
            onClick={() => onSubmit({ qty, stopLoss: null })}
            className="font-body text-sm font-medium text-stamp hover:underline"
          >
            Sell anyway →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-rule/25 rounded-sm p-6 max-w-sm">
      <div className="flex justify-between items-baseline mb-1">
        <p className="font-display text-lg text-ink">
          {side === "buy" ? "Buy" : "Sell"} {symbol}
        </p>
        <p className="font-mono tabular-nums text-ink">₹{price.toFixed(2)}</p>
      </div>
      <p className="font-body text-xs text-muted mb-5">Delayed price · simulated only</p>

      <label className="block font-body text-sm text-ink mb-1">Quantity</label>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
        className="w-full border border-rule/40 rounded-sm px-3 py-2 font-mono tabular-nums mb-4 bg-transparent"
      />

      {showLimitOption && (
        <p className="font-body text-xs text-muted mb-4">
          Market order · limit orders available (Lesson 3 unlocked this — wire up the toggle here)
        </p>
      )}

      {showStopLossNudge && (
        <div className="mb-4">
          <label className="block font-body text-sm text-ink mb-1">
            Stop-loss <span className="text-muted">(optional, but recommended)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 5% below entry"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full border border-rule/40 rounded-sm px-3 py-2 font-mono tabular-nums bg-transparent"
          />
        </div>
      )}

      {showConcentrationNudge && (
        <p className="font-body text-xs text-loss mb-4">
          Heads up — check this doesn&apos;t push one holding above ~40% of your
          portfolio. (Wire real portfolio % check into this condition.)
        </p>
      )}

      <div className="flex justify-between items-baseline mb-5 pt-3 border-t border-rule/25">
        <p className="font-body text-sm text-muted">Total</p>
        <p className="font-mono tabular-nums text-ink">₹{cost.toFixed(2)}</p>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-stamp text-paper py-2.5 rounded-sm font-body font-medium hover:opacity-90 transition-opacity"
      >
        {side === "buy" ? "Buy" : "Sell"} (simulated)
      </button>
    </div>
  );
}
