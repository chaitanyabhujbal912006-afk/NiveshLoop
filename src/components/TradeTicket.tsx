"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { activeUnlocks, shouldShowCooldown } from "@/lib/unlocks";
import { CooldownRing } from "./CooldownRing";
import type { TradeSide } from "@/types";

interface TradeTicketProps {
  symbol: string;
  price: number;
  side: TradeSide;
  completedLessonSlugs: string[];
  sessionChangePercent?: number;
  msSinceDrop?: number;
  onSubmit: (payload: { qty: number; stopLoss: number | null }) => void;
}

/**
 * The one form every lesson eventually points at.
 * Behaviour changes as the user completes lessons (docs/LOGIC.md §1).
 * Moment #4: the cooldown nudge with a physical ring.
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
  const [stopLoss, setStopLoss] = useState("");
  const [showCooldown, setShowCooldown] = useState(false);
  const [ringComplete, setRingComplete] = useState(false);

  const showStopLossNudge = unlocks.has("stop_loss_nudge") && side === "buy";
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
      return;
    }
    onSubmit({ qty, stopLoss: stopLoss ? Number(stopLoss) : null });
  }

  // ── Cooldown nudge screen ─────────────────────────────────────────────
  if (showCooldown) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="cooldown"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="border border-stamp/30 bg-stamp/[0.04] rounded-sm p-6 max-w-sm"
        >
          <p className="font-display text-xl text-ink mb-1">Take a moment</p>
          <p className="font-mono text-xs text-muted mb-4 tracking-widest uppercase">
            {symbol} · sharp drop today
          </p>
          <p className="font-body text-sm text-ink/80 leading-relaxed mb-8">
            Selling now locks in the loss — you can still sell right after this.
            No urgency either way. This pause is just that: a pause.
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => { setShowCooldown(false); setRingComplete(false); }}
              className="font-body text-sm font-medium text-rule hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50"
            >
              I&apos;ll wait
            </button>

            {/* The ring-wrapped "Sell anyway" button — friction by design */}
            <div className="relative h-11 w-36">
              <CooldownRing duration={11} onComplete={() => setRingComplete(true)} />
              <button
                onClick={() => onSubmit({ qty, stopLoss: null })}
                className={[
                  "absolute inset-0 flex items-center justify-center",
                  "font-body text-sm font-medium transition-colors",
                  ringComplete
                    ? "text-stamp hover:text-stamp/80"
                    : "text-ink/50",
                ].join(" ")}
                aria-label="Sell anyway (you can click at any time)"
              >
                Sell anyway →
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Normal trade ticket ───────────────────────────────────────────────
  return (
    <div className="border border-rule/25 rounded-sm p-6 max-w-sm bg-paper">
      <div className="flex justify-between items-baseline mb-1">
        <p className="font-display text-lg text-ink">
          {side === "buy" ? "Buy" : "Sell"} {symbol}
        </p>
        <p className="font-mono tabular-nums text-ink">₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <p className="font-body text-xs text-muted mb-5 uppercase tracking-widest">
        Delayed price · simulated only
      </p>

      {showLimitOption && (
        <p className="font-body text-xs text-muted mb-4 pb-3 border-b border-rule/20">
          Market order · limit orders available after Lesson 3
        </p>
      )}

      <label className="block font-body text-xs text-ink/70 mb-1.5 uppercase tracking-wider">
        Quantity
      </label>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        className="w-full border border-rule/40 rounded-sm px-3.5 py-2.5 font-mono tabular-nums text-sm mb-4 bg-transparent text-ink focus:outline-none focus:border-stamp transition-colors"
      />

      {showStopLossNudge && (
        <div className="mb-4">
          <label className="block font-body text-xs text-ink/70 mb-1.5 uppercase tracking-wider">
            Stop-loss{" "}
            <span className="normal-case text-muted font-body">(optional — lesson 5 unlocked this)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 2700 (price below which to exit)"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full border border-rule/40 rounded-sm px-3.5 py-2.5 font-mono tabular-nums text-sm bg-transparent text-ink focus:outline-none focus:border-stamp transition-colors"
          />
        </div>
      )}

      <div className="flex justify-between items-baseline mb-5 pt-4 border-t border-rule/25">
        <p className="font-body text-sm text-muted">Total</p>
        <p className="font-mono tabular-nums text-ink font-medium">
          ₹{cost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-stamp text-paper py-3 rounded-sm font-body font-medium hover:opacity-90 active:scale-[0.99] transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp/50 focus-visible:ring-offset-2"
      >
        {side === "buy" ? "Buy" : "Sell"} (simulated)
      </button>
    </div>
  );
}
