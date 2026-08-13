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
import { RealtimeTradingTerminal } from "./RealtimeTradingTerminal";
import { LanguageToggle } from "./LanguageToggle";
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

  async function handleTradeSubmit(payload: {
    symbol: string;
    side: TradeSide;
    qty: number;
    stopLoss: number | null;
  }) {
    setTradeLoading(true);
    setTradeStatus(null);

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: payload.symbol,
          side: payload.side,
          qty: payload.qty,
          stopLoss: payload.stopLoss,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Trade failed");

      setTradeStatus({
        success: true,
        message: `${payload.side === "buy" ? "Bought" : "Sold"} ${payload.qty} shares of ${payload.symbol} @ ₹${Number(json.executedPrice).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      });

      router.refresh();
      setTimeout(() => setActiveTab("ledger"), 1500);
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
    <div className="min-h-screen bg-parchment-base grid-bg bg-grid-pattern relative">
      {/* Background watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 z-0 text-watermark font-display pointer-events-none">
        पासबुक
      </div>

      {/* ── LIVE MARKET INDICES TICKER BAR ── */}
      <div className="w-full bg-ink text-paper font-mono text-xs py-1.5 overflow-hidden relative z-50 border-b-2 border-stamp shadow-sm">
        <div className="flex whitespace-nowrap animate-ticker">
          {[...Array(2)].map((_, repeat) => (
            <div key={repeat} className="flex items-center shrink-0">
              <span className="mx-4 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gain"></span>
                </span>
                <span className="text-paper/40 uppercase tracking-widest text-[9px]">Simulated · Live</span>
              </span>
              {[
                { name: "NIFTY 50", val: "22,147.90", chg: "+0.6%", up: true },
                { name: "SENSEX", val: "73,212.40", chg: "+0.7%", up: true },
                { name: "BANK NIFTY", val: "46,588.20", chg: "+0.4%", up: true },
                { name: "INDIA VIX", val: "13.82", chg: "-2.1%", up: false },
              ].map((m) => (
                <span key={`${repeat}-${m.name}`} className="mx-5 inline-flex items-center gap-1.5">
                  <span className="text-paper/50">{m.name}</span>
                  <span className="tabular-nums text-paper/80">{m.val}</span>
                  <span className={`tabular-nums font-semibold ${m.up ? "text-gain" : "text-loss"}`}>{m.chg}</span>
                </span>
              ))}
              <span className="mx-3 text-paper/15">│</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PASSBOOK HEADER ─────────────────────────────────────────────── */}
      <div className="relative z-10 border-b-2 border-ink shadow-md backdrop-blur-md overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 grid-bg bg-grid-pattern opacity-40 pointer-events-none" aria-hidden />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-stamp via-stamp/80 to-stamp" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-6 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="stamp-border inline-block">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-stamp font-bold bg-stamp/10 px-2.5 py-1">
                    Simulated Account
                  </span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  DEMO-001
                </span>
              </div>
              <p className="font-display text-lg text-ink font-bold flex items-center gap-2">
                <span>{userEmail}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <LanguageToggle />
              <Link
                href="/scam-checker"
                className="font-mono text-xs font-medium text-ink/80 hover:text-stamp border-2 border-ink/20 px-3.5 py-2 hover:bg-ink/5 transition-all flex items-center gap-1.5 deep-shadow hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span>Scam Checker</span>
              </Link>
              <Link
                href="/lessons"
                className="font-mono text-xs font-bold bg-stamp text-paper px-4 py-2 hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[4px_4px_0_rgba(26,26,46,1)] active:shadow-[2px_2px_0_rgba(26,26,46,1)] active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Curriculum</span>
                <span className="font-sans">→</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="font-mono text-xs text-muted hover:text-stamp border-2 border-ink/15 px-3.5 py-2 hover:border-stamp/30 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* ── Portfolio overview: gauge + stats side by side ── */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 mb-6 items-center">
            {/* Gauge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex justify-center md:justify-start"
            >
              <PortfolioGauge portfolioValue={totalPortfolioValuation} />
            </motion.div>

            {/* Stats grid — deep shadow cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Cash balance",
                  node: <InkNumber value={initialCash} className="text-2xl font-bold text-ink" />,
                  extra: null,
                  rotate: "-rotate-1",
                },
                {
                  label: "Portfolio value",
                  node: <InkNumber value={totalPortfolioValuation} className="text-2xl font-bold text-ink" />,
                  extra: null,
                  rotate: "rotate-1",
                },
                {
                  label: "Total P&L",
                  node: (
                    <InkNumber
                      value={pnl}
                      className={`text-2xl font-bold ${pnl >= 0 ? "text-gain" : "text-loss"}`}
                    />
                  ),
                  extra: pnl !== 0 ? (
                    <span className={`font-mono text-[10px] tabular-nums font-semibold mt-0.5 block ${
                      pnl >= 0 ? "text-gain" : "text-loss"
                    }`}>
                      {pnl >= 0 ? "+" : ""}{((pnl / 100000) * 100).toFixed(2)}%
                    </span>
                  ) : null,
                  rotate: "-rotate-1",
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ rotate: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`border-2 border-ink px-5 py-4 deep-shadow ${item.rotate} transition-all cursor-default ${
                    item.label === "Total P&L" && pnl !== 0
                      ? pnl >= 0 ? "border-gain/60 bg-gain/5" : "border-loss/60 bg-loss/5"
                      : "bg-paper"
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted/80 font-medium mb-1.5">{item.label}</p>
                  {item.node}
                  {item.extra}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Passbook page tabs — bold border-ink style */}
          <div className="flex items-end gap-0 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "relative px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest border-2 border-b-0 transition-all duration-200 select-none",
                  activeTab === tab.id
                    ? "bg-paper border-ink text-ink z-10 shadow-md -translate-y-0.5"
                    : "bg-ink/5 border-transparent text-muted hover:text-ink hover:bg-ink/10",
                ].join(" ")}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-1 bg-stamp"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 py-10">
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
                <div className="flex justify-between items-end mb-4 border-b-2 border-ink pb-3">
                  <h2 className="font-display text-2xl font-bold text-ink -rotate-1">Holdings</h2>
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
                  <div className="border-2 border-ink overflow-hidden deep-shadow">
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 text-[10px] font-mono uppercase tracking-widest text-paper bg-ink border-b-2 border-ink px-5 py-3">
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
                          className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 px-5 py-4 border-b border-ink/10 last:border-b-0 hover:bg-ink/[0.03] hover:-translate-y-0.5 transition-all group cursor-default"
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
                <div className="flex items-end mb-4 border-b-2 border-ink pb-3">
                  <h2 className="font-display text-2xl font-bold text-ink -rotate-1">Activity</h2>
                  <span className="font-mono text-xs text-stamp ml-4 mb-0.5 tracking-widest">// TRANSACTION LOG</span>
                </div>
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
                <div className="border-2 border-ink deep-shadow bg-paper p-10 text-center max-w-md mx-auto mt-4">
                  <div className="stamp-border inline-block mb-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-stamp bg-stamp/10 px-3 py-1">
                      Trading Terminal Locked
                    </span>
                  </div>
                  <p className="font-display text-2xl font-bold text-ink mb-2">
                    Complete Lesson 1 to Unlock
                  </p>
                  <p className="font-body text-sm text-ink/75 mb-6 leading-relaxed">
                    Complete <strong>Lesson 1 — What is a stock?</strong> to unlock your real-time share market trading ticket.
                  </p>
                  <Link
                    href="/lessons/what-is-a-stock"
                    className="inline-flex items-center gap-2 bg-stamp text-paper px-6 py-3 font-mono font-bold text-xs hover:opacity-90 transition-opacity shadow-[4px_4px_0_rgba(26,26,46,1)]"
                  >
                    Go to Lesson 1 →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {tradeStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={[
                          "p-4 border-2 font-mono text-xs font-bold deep-shadow",
                          tradeStatus.success
                            ? "bg-gain/10 border-gain text-gain"
                            : "bg-loss/10 border-loss text-loss",
                        ].join(" ")}
                      >
                        {tradeStatus.success && <Stamp label="trade-success" earned size="sm" animateOnMount />}
                        {" "}{tradeStatus.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <RealtimeTradingTerminal
                    initialQuote={selectedQuote}
                    completedLessonSlugs={completedLessonSlugs}
                    onSubmitTrade={handleTradeSubmit}
                    tradeLoading={tradeLoading}
                  />
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
      <footer className="relative z-10 border-t-2 border-ink py-8 px-6 sm:px-10 text-center max-w-6xl mx-auto mt-12">
        <div className="stamp-border inline-block transform -rotate-1 mb-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-stamp bg-stamp/5 px-3 py-1 font-bold">Disclaimer</span>
        </div>
        <p className="font-body text-xs text-muted leading-relaxed max-w-lg mx-auto">
          Simulated portfolio · Prices delayed ~15 minutes · Educational use only · Not real money · Not investment advice · NiveshLoop simulation environment
        </p>
      </footer>
    </div>
  );
}

