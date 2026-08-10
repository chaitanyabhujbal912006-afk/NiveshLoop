"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase-client";
import { SymbolSearch } from "./SymbolSearch";
import { TradeTicket } from "./TradeTicket";
import { TransactionHistory } from "./TransactionHistory";
import { InkNumber } from "./InkNumber";
import { Stamp } from "./Stamp";
import { PriceChart } from "./PriceChart";
import { AllocationBar } from "./AllocationBar";
import { PortfolioGauge } from "./PortfolioGauge";
import { Sparkline } from "./Sparkline";
import { hasUnlocked } from "@/lib/unlocks";
import type { PriceQuote, TradeSide } from "@/types";
import type { InsightResult, BadgeResult } from "@/lib/insights";

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

  // Unlocks
  const canTrade = hasUnlocked(completedLessonSlugs, "first_trade");
  const hasInsightsUnlocked = hasUnlocked(completedLessonSlugs, "insights_panel");
  const isCandlestickUnlocked = hasUnlocked(completedLessonSlugs, "chart_view");

  const [tradeLoading, setTradeLoading] = useState(false);
  const [insightsData, setInsightsData] = useState<{
    insights: InsightResult[];
    badges: BadgeResult[];
    transactionCount: number;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (activeTab === "insights" && hasInsightsUnlocked && !insightsData && !loadingInsights) {
      setLoadingInsights(true);
      fetch("/api/insights")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setInsightsData(data);
        })
        .catch(() => {})
        .finally(() => setLoadingInsights(false));
    }
  }, [activeTab, hasInsightsUnlocked, insightsData, loadingInsights]);

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
    { id: "insights", label: hasInsightsUnlocked ? "Insights" : "Insights 🔒", locked: !hasInsightsUnlocked },
  ];

  return (
    <div className="min-h-screen">
      {/* ── PASSBOOK HEADER ─────────────────────────────────────────────── */}
      <div className="border-b border-rule/25 bg-paper relative overflow-hidden">
        {/* Dotgrid passbook texture */}
        <div className="absolute inset-0 dotgrid-bg opacity-40 pointer-events-none" aria-hidden />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-8">
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

          {/* ── Portfolio overview: gauge + stats side by side ── */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 mb-5 items-center">
            {/* Gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex justify-center md:justify-start"
            >
              <PortfolioGauge portfolioValue={totalPortfolioValuation} />
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-px border border-rule/25 rounded-sm overflow-hidden">
              {[
                {
                  label: "Cash balance",
                  node: <InkNumber value={initialCash} className="text-2xl font-semibold text-ink" />,
                  extra: null,
                },
                {
                  label: "Portfolio value",
                  node: <InkNumber value={totalPortfolioValuation} className="text-2xl font-semibold text-ink" />,
                  extra: null,
                },
                {
                  label: "Total P&L",
                  node: (
                    <InkNumber
                      value={pnl}
                      className={`text-2xl font-semibold ${pnl >= 0 ? "text-gain" : "text-loss"}`}
                    />
                  ),
                  extra: pnl !== 0 ? (
                    <span className={`font-mono text-[10px] tabular-nums mt-0.5 ${
                      pnl >= 0 ? "text-gain/80" : "text-loss/80"
                    }`}>
                      {pnl >= 0 ? "+" : ""}{((pnl / 100000) * 100).toFixed(2)}%
                    </span>
                  ) : null,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`bg-paper px-4 py-3 transition-all duration-300 ${
                    item.label === "Total P&L" && pnl !== 0
                      ? pnl >= 0 ? "gain-glow" : "loss-glow"
                      : ""
                  }`}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">{item.label}</p>
                  {item.node}
                  {item.extra}
                </div>
              ))}
            </div>
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
              {/* Allocation bar visual */}
              <div className="mb-6">
                <AllocationBar cash={initialCash} holdings={initialHoldings} />
              </div>

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
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 text-[10px] font-mono uppercase tracking-widest text-muted bg-rule/[0.04] border-b border-rule/20 px-5 py-2.5">
                      <span>Symbol</span>
                      <span className="text-right px-4">Chart</span>
                      <span className="text-right px-4">Qty</span>
                      <span className="text-right px-4">Avg</span>
                      <span className="text-right px-4">Current</span>
                      <span className="text-right pl-4">P&L</span>
                    </div>

                    {activeHoldings.map((h, idx) => {
                      const price = h.current_price ?? Number(h.avg_price);
                      const pnl = (price - Number(h.avg_price)) * Number(h.qty);

                      return (
                        <motion.div
                          key={h.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 px-5 py-3.5 border-b border-rule/15 last:border-b-0 hover:bg-rule/[0.03] transition-colors group"
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
                          {/* Mini sparkline */}
                          <div className="flex items-center px-4">
                            <Sparkline
                              basePrice={Number(h.avg_price)}
                              currentPrice={price}
                              width={64}
                              height={22}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-sm text-ink text-right px-4">{h.qty}</span>
                          <span className="font-mono tabular-nums text-sm text-muted text-right px-4">
                            ₹{Number(h.avg_price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="font-mono tabular-nums text-sm text-ink text-right px-4">
                            ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className={`font-mono tabular-nums text-sm text-right pl-4 font-medium ${
                            pnl >= 0 ? "text-gain" : "text-loss"
                          }`}>
                            {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </motion.div>
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

                        <div className="mb-4">
                          <PriceChart
                            symbol={selectedQuote.symbol}
                            currentPrice={selectedQuote.price}
                            isCandlestickUnlocked={isCandlestickUnlocked}
                          />
                        </div>

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
              )}
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
              {!hasInsightsUnlocked ? (
                <div className="border border-dashed border-rule/35 p-10 text-center max-w-md mx-auto mt-4">
                  <p className="font-display text-2xl font-semibold text-ink mb-2">
                    Behavioral Insights Locked
                  </p>
                  <p className="font-body text-sm text-ink/70 mb-6 leading-relaxed">
                    Complete <strong>Lesson 8 — Common Beginner Mistakes</strong> to unlock your personal pattern reflection ledger.
                  </p>
                  <Link
                    href="/lessons/common-beginner-mistakes"
                    className="inline-flex items-center gap-2 bg-stamp text-paper px-6 py-3 font-body font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    Go to Lesson 8 →
                  </Link>
                  <p className="mt-4 font-mono text-[10px] text-muted uppercase tracking-widest">
                    Reflects patterns without personal financial advice
                  </p>
                </div>
              ) : (
                <div className="max-w-3xl space-y-10">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted mb-1">
                      Passbook Annotation · Page {initialTransactions.length + 1}
                    </p>
                    <h2 className="font-display text-3xl font-semibold text-ink mb-2">Your patterns so far</h2>
                    <p className="font-body text-sm text-muted">
                      Insights reflect patterns in your past trading behavior. They describe what happened — they never tell you what to buy or sell.
                    </p>
                  </div>

                  {/* Habit Badges Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold text-ink">Habit Badges</h3>
                      <span className="font-mono text-xs text-muted">Earned for discipline, not returns</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(insightsData?.badges || [
                        { id: "steady_hand", label: "Steady Hand", description: "Held through market dip", earned: false },
                        { id: "diversified", label: "Diversified", description: "Positions across 3+ stocks", earned: false },
                        { id: "patient_holder", label: "Patient Holder", description: "Long-term position holding", earned: false },
                        { id: "did_the_homework", label: "Did the Homework", description: "Completed lessons before trading", earned: false },
                        { id: "cooled_off", label: "Cooled Off", description: "Used reflective cooldown pause", earned: false },
                      ]).map((badge) => (
                        <div
                          key={badge.id}
                          className={[
                            "p-4 border rounded-sm flex items-start gap-3 transition-colors",
                            badge.earned
                              ? "bg-paper border-rule/40 shadow-xs"
                              : "bg-rule/[0.03] border-rule/15 text-muted",
                          ].join(" ")}
                        >
                          <div className="pt-0.5">
                            <Stamp label={badge.label} earned={badge.earned} size="sm" animateOnMount={badge.earned} />
                          </div>
                          <div>
                            <p className={`font-display text-sm font-semibold ${badge.earned ? "text-ink" : "text-muted"}`}>
                              {badge.label}
                            </p>
                            <p className="font-body text-xs text-muted leading-relaxed mt-0.5">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold text-ink">Behavioral Observations</h3>
                      <span className="font-mono text-xs text-muted">Updated on request</span>
                    </div>

                    {loadingInsights ? (
                      <div className="border border-rule/20 p-8 text-center rounded-sm">
                        <p className="font-mono text-xs text-muted animate-pulse">Analyzing transaction ledger...</p>
                      </div>
                    ) : insightsData?.insights && insightsData.insights.length > 0 ? (
                      <div className="space-y-4">
                        {insightsData.insights.map((insight) => (
                          <div
                            key={insight.kind}
                            className="border-l-2 border-stamp bg-paper border border-rule/25 rounded-r-sm p-5 shadow-xs"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-stamp font-semibold">
                                Observation
                              </span>
                              <span className="text-muted text-xs">•</span>
                              <span className="font-display text-sm font-semibold text-ink">
                                {insight.title}
                              </span>
                            </div>
                            <p className="font-body text-sm text-ink/85 leading-relaxed">
                              {insight.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-rule/30 rounded-sm p-8 text-center">
                        <p className="font-display text-sm text-ink font-medium mb-1">
                          No negative trading habits detected!
                        </p>
                        <p className="font-body text-xs text-muted">
                          You are trading with clear intent. Continue executing simulated orders and reviewing lessons to unlock further reflections.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

