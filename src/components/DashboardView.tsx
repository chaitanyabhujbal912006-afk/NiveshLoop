"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-client";
import { SymbolSearch } from "./SymbolSearch";
import { TradeTicket } from "./TradeTicket";
import { TransactionHistory } from "./TransactionHistory";
import { InkNumber } from "./InkNumber";
import { Stamp } from "./Stamp";
import { hasUnlocked } from "@/lib/unlocks";
import type { PriceQuote, TradeSide } from "@/types";

interface HoldingItem {
  id: string;
  symbol: string;
  qty: number;
  avg_price: number;
  current_price?: number;
  fetched_at?: string;
}

interface TransactionItem {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  had_stop_loss: boolean;
  created_at: string;
}

interface DashboardViewProps {
  userEmail: string;
  initialCash: number;
  initialHoldings: HoldingItem[];
  initialTransactions: TransactionItem[];
  completedLessonSlugs: string[];
}

type Tab = "ledger" | "trade" | "insights";

export function DashboardView({
  userEmail,
  initialCash,
  initialHoldings,
  initialTransactions,
  completedLessonSlugs,
}: DashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("ledger");
  const [selectedQuote, setSelectedQuote] = useState<PriceQuote | null>(null);
  const [tradeSide, setTradeSide] = useState<TradeSide>("buy");
  const [tradeStatus, setTradeStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // first_trade gate — trading is locked until 'what-is-a-stock' is complete
  const canTrade = hasUnlocked(completedLessonSlugs, "first_trade");
  const [tradeLoading, setTradeLoading] = useState(false);

  async function handleSignOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleTradeSubmit(payload: { qty: number; stopLoss: number | null }) {
    if (!selectedQuote) return;
    setTradeLoading(true);
    setTradeStatus(null);

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedQuote.symbol,
          side: tradeSide,
          qty: payload.qty,
          stopLoss: payload.stopLoss,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Trade failed");

      setTradeStatus({
        success: true,
        message: `${tradeSide === "buy" ? "Bought" : "Sold"} ${payload.qty} shares of ${selectedQuote.symbol} @ ₹${Number(json.executedPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      });

      router.refresh();
      setTimeout(() => setActiveTab("ledger"), 1200);
    } catch (err) {
      setTradeStatus({ success: false, message: err instanceof Error ? err.message : "Trade failed" });
    } finally {
      setTradeLoading(false);
    }
  }

  const activeHoldings = initialHoldings.filter((h) => Number(h.qty) > 0);
  const totalHoldingsValue = activeHoldings.reduce((sum, h) => {
    const price = h.current_price ?? Number(h.avg_price);
    return sum + Number(h.qty) * price;
  }, 0);
  const totalPortfolioValuation = initialCash + totalHoldingsValue;
  const startingCash = 100000;
  const pnl = totalPortfolioValuation - startingCash;

  const TABS: { id: Tab; label: string; locked?: boolean }[] = [
    { id: "ledger", label: "Ledger" },
    { id: "trade", label: canTrade ? "Trade" : "Trade 🔒", locked: !canTrade },
    { id: "insights", label: "Insights" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── PASSBOOK HEADER ─────────────────────────────────────────────── */}
      <div className="border-b border-rule/25 bg-paper">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center pt-6 pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">
                Nivesh<span className="text-stamp">Loop</span> · Passbook
              </p>
              <p className="font-display text-sm text-ink font-medium">{userEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/lessons"
                className="font-mono text-xs text-muted hover:text-ink border border-rule/25 px-3 py-1.5 rounded-sm transition-colors"
              >
                Lessons {!canTrade && "🔒"}
              </Link>
              <button
                onClick={handleSignOut}
                className="font-mono text-xs text-muted hover:text-stamp border border-rule/25 px-3 py-1.5 rounded-sm transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Balance row */}
          <div className="grid grid-cols-3 gap-px border border-rule/25 rounded-sm overflow-hidden mb-5">
            {[
              {
                label: "Cash balance",
                node: <InkNumber value={initialCash} className="text-2xl font-semibold text-ink" />,
              },
              {
                label: "Portfolio value",
                node: <InkNumber value={totalPortfolioValuation} className="text-2xl font-semibold text-ink" />,
              },
              {
                label: "Total P&L",
                node: (
                  <InkNumber
                    value={pnl}
                    className={`text-2xl font-semibold ${pnl >= 0 ? "text-gain" : "text-loss"}`}
                  />
                ),
              },
            ].map((item) => (
              <div key={item.label} className="bg-paper px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">{item.label}</p>
                {item.node}
              </div>
            ))}
          </div>

          {/* Passbook page tabs */}
          <div className="flex items-end gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "relative px-6 py-2.5 font-display text-sm font-medium border border-b-0 rounded-t-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-paper border-rule/30 text-ink z-10"
                    : "bg-rule/[0.04] border-transparent text-muted hover:text-ink",
                ].join(" ")}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-px bg-paper"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "ledger" && (
            <motion.div
              key="ledger"
              initial={{ rotateY: 15, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -15, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              {/* Holdings ledger */}
              <div className="mb-8">
                <div className="flex justify-between items-baseline mb-3">
                  <h2 className="font-display text-xl font-semibold text-ink">Holdings</h2>
                  <span className="font-mono text-xs text-muted">{activeHoldings.length} positions</span>
                </div>

                {activeHoldings.length === 0 ? (
                  <div className="border border-dashed border-rule/30 rounded-sm p-10 text-center">
                    <p className="font-body text-sm text-ink/70 mb-2">No positions yet.</p>
                    <p className="font-body text-xs text-muted">
                      Switch to the Trade tab to look up a stock and place your first order.
                    </p>
                    <button
                      onClick={() => setActiveTab("trade")}
                      className="mt-4 font-body text-sm text-stamp border border-stamp/30 px-4 py-2 rounded-sm hover:bg-stamp hover:text-paper transition-colors"
                    >
                      Go to Trade →
                    </button>
                  </div>
                ) : (
                  <div className="border border-rule/30 rounded-sm overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 text-[10px] font-mono uppercase tracking-widest text-muted bg-rule/[0.04] border-b border-rule/20 px-5 py-2.5">
                      <span>Symbol</span>
                      <span className="text-right px-4">Qty</span>
                      <span className="text-right px-4">Avg</span>
                      <span className="text-right px-4">Current</span>
                      <span className="text-right pl-4">P&L</span>
                    </div>

                    {activeHoldings.map((h) => {
                      const price = h.current_price ?? Number(h.avg_price);
                      const pnl = (price - Number(h.avg_price)) * Number(h.qty);

                      return (
                        <div
                          key={h.id}
                          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-5 py-3.5 border-b border-rule/15 last:border-b-0 hover:bg-rule/[0.03] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-ink">{h.symbol}</span>
                            <button
                              onClick={() => {
                                setSelectedQuote({ symbol: h.symbol, price, fetchedAt: new Date().toISOString() });
                                setTradeSide("sell");
                                setActiveTab("trade");
                              }}
                              className="text-[10px] font-mono text-stamp border border-stamp/25 px-1.5 py-0.5 rounded-sm hover:bg-stamp hover:text-paper transition-colors"
                            >
                              Sell
                            </button>
                          </div>
                          <span className="font-mono tabular-nums text-sm text-ink text-right px-4">{h.qty}</span>
                          <span className="font-mono tabular-nums text-sm text-muted text-right px-4">
                            ₹{Number(h.avg_price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="font-mono tabular-nums text-sm text-ink text-right px-4">
                            ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className={`font-mono tabular-nums text-sm text-right pl-4 ${pnl >= 0 ? "text-gain" : "text-loss"}`}>
                            {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Transaction history */}
              <div>
                <h2 className="font-display text-xl font-semibold text-ink mb-3">Activity</h2>
                <TransactionHistory transactions={initialTransactions} />
              </div>
            </motion.div>
          )}

          {activeTab === "trade" && (
            <motion.div
              key="trade"
              initial={{ rotateY: 15, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -15, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              {/* ── FIRST_TRADE GATE ─────────────────────────────────── */}
              {!canTrade ? (
                <div className="border border-dashed border-rule/35 p-10 text-center max-w-sm mx-auto mt-4">
                  <p className="font-display text-xl font-semibold text-ink mb-2">
                    Trading is locked
                  </p>
                  <p className="font-body text-sm text-ink/70 mb-6 leading-relaxed">
                    Complete <strong>Lesson 1 — What is a stock?</strong> to unlock
                    your trade ticket. The lesson takes about 4 minutes.
                  </p>
                  <Link
                    href="/lessons/what-is-a-stock"
                    className="inline-flex items-center gap-2 bg-stamp text-paper px-6 py-3 font-body font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Go to Lesson 1 →
                  </Link>
                  <p className="mt-4 font-mono text-[10px] text-muted uppercase tracking-widest">
                    Unlocks automatically on completion
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                <SymbolSearch
                  onSelectQuote={(quote) => {
                    setSelectedQuote(quote);
                    setTradeSide("buy");
                    setTradeStatus(null);
                  }}
                />

                <div>
                  {selectedQuote ? (
                    <>
                      <div className="flex gap-2 mb-4">
                        {(["buy", "sell"] as TradeSide[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setTradeSide(s)}
                            className={[
                              "flex-1 py-2 text-xs font-mono rounded-sm border capitalize transition-colors",
                              tradeSide === s
                                ? "bg-stamp text-paper border-stamp"
                                : "bg-paper text-muted border-rule/30 hover:text-ink",
                            ].join(" ")}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {tradeStatus && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={[
                              "p-3 rounded-sm text-xs font-body mb-4 border",
                              tradeStatus.success
                                ? "bg-gain/10 border-gain/30 text-gain"
                                : "bg-loss/10 border-loss/30 text-loss",
                            ].join(" ")}
                          >
                            {tradeStatus.success && <Stamp label="trade-success" earned size="sm" animateOnMount />}
                            {" "}{tradeStatus.message}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <TradeTicket
                        symbol={selectedQuote.symbol}
                        price={selectedQuote.price}
                        side={tradeSide}
                        completedLessonSlugs={completedLessonSlugs}
                        onSubmit={handleTradeSubmit}
                      />
                    </>
                  ) : (
                    <div className="border border-dashed border-rule/30 rounded-sm p-10 text-center h-full flex flex-col justify-center items-center">
                      <p className="font-display text-base text-ink mb-2">Trade Ticket</p>
                      <p className="font-body text-xs text-muted max-w-xs">
                        Search a stock on the left to load its delayed quote.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              )} {/* end canTrade ternary */}
            </motion.div>
          )}


          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ rotateY: 15, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -15, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
            >
              <div className="max-w-xl">
                <p className="font-mono text-xs uppercase tracking-widest text-muted mb-6">
                  Passbook handed back — page {initialTransactions.length + 1}
                </p>
                <h2 className="font-display text-3xl font-semibold text-ink mb-2">Your patterns so far</h2>
                <p className="font-body text-sm text-muted mb-10">
                  Insights appear after ~10 trades. These describe your own behavior — they never tell you what to do.
                </p>

                {initialTransactions.length < 5 ? (
                  <div className="border border-dashed border-rule/30 rounded-sm p-10 text-center">
                    <p className="font-body text-sm text-ink/70 mb-1">
                      {initialTransactions.length === 0
                        ? "No trades yet."
                        : `${initialTransactions.length} trade${initialTransactions.length === 1 ? "" : "s"} recorded.`}
                    </p>
                    <p className="font-body text-xs text-muted">
                      Keep trading — insights unlock after a handful of trades.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-l-2 border-rule/40 pl-5 py-1">
                      <p className="font-body text-sm text-muted uppercase tracking-widest text-xs mb-2 font-mono">Annotation</p>
                      <p className="font-body text-base text-ink leading-relaxed">
                        You&rsquo;ve made {initialTransactions.length} trades so far. Full behavioral insights are computed in Phase 3 — come back then.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Disclaimers */}
      <footer className="border-t border-rule/20 py-6 px-4 sm:px-8 text-center text-xs text-muted font-body max-w-5xl mx-auto mt-8">
        Simulated portfolio. Prices delayed ~15 minutes and sourced for educational use.
        Not real money. Not investment advice. NiveshLoop simulation environment.
      </footer>
    </div>
  );
}
