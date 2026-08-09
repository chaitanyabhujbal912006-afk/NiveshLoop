"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";
import { SymbolSearch } from "./SymbolSearch";
import { TradeTicket } from "./TradeTicket";
import { TransactionHistory } from "./TransactionHistory";
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

export function DashboardView({
  userEmail,
  initialCash,
  initialHoldings,
  initialTransactions,
  completedLessonSlugs,
}: DashboardViewProps) {
  const router = useRouter();
  const [selectedQuote, setSelectedQuote] = useState<PriceQuote | null>(null);
  const [tradeSide, setTradeSide] = useState<TradeSide>("buy");
  const [tradeStatus, setTradeStatus] = useState<{ success?: boolean; message?: string } | null>(null);
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
        message: `Successfully ${tradeSide === "buy" ? "bought" : "sold"} ${payload.qty} shares of ${selectedQuote.symbol} @ ₹${json.executedPrice.toFixed(2)}`,
      });

      router.refresh();
    } catch (err) {
      setTradeStatus({
        success: false,
        message: err instanceof Error ? err.message : "Trade execution failed",
      });
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* User Header */}
      <div className="flex flex-wrap justify-between items-center pb-6 border-b border-rule/30 mb-8 gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Passbook Account</p>
          <p className="font-display text-lg text-ink font-medium">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="font-mono text-xs text-muted hover:text-stamp border border-rule/30 px-3 py-1.5 rounded-sm transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Portfolio Passbook Ledger Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="border border-rule/30 rounded-sm p-6 bg-paper">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-1">
            Available Cash Balance
          </p>
          <p className="font-mono tabular-nums text-3xl font-semibold text-ink">
            ₹{initialCash.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="font-body text-xs text-muted mt-2">Simulated funds for paper trading</p>
        </div>

        <div className="border border-rule/30 rounded-sm p-6 bg-paper">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-1">
            Total Portfolio Value
          </p>
          <p className="font-mono tabular-nums text-3xl font-semibold text-ink">
            ₹{totalPortfolioValuation.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="font-body text-xs text-muted mt-2">
            Cash (₹{initialCash.toLocaleString("en-IN")}) + Holdings (₹{totalHoldingsValue.toLocaleString("en-IN")})
          </p>
        </div>
      </div>

      {/* Holdings Passbook Table */}
      <section className="mb-10">
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-display text-xl font-semibold text-ink">Current Holdings</h2>
          <span className="font-mono text-xs text-muted">{activeHoldings.length} positions</span>
        </div>

        {activeHoldings.length === 0 ? (
          <div className="border border-dashed border-rule/30 rounded-sm p-8 text-center bg-paper">
            <p className="font-body text-sm text-ink/80 mb-2">No stock positions held yet.</p>
            <p className="font-body text-xs text-muted">
              Use the Stock Lookup tool below to search symbols and place your first order.
            </p>
          </div>
        ) : (
          <div className="border border-rule/30 rounded-sm overflow-hidden bg-paper">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rule/30 text-xs font-mono uppercase text-muted bg-rule/5">
                    <th className="py-3 px-4">Symbol</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Avg Price</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-right">Current Value</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule/15 font-mono tabular-nums text-sm text-ink">
                  {activeHoldings.map((h) => {
                    const price = h.current_price ?? Number(h.avg_price);
                    const val = Number(h.qty) * price;
                    const pnl = (price - Number(h.avg_price)) * Number(h.qty);

                    return (
                      <tr key={h.id} className="hover:bg-rule/5 transition-colors">
                        <td className="py-3.5 px-4 font-semibold">{h.symbol}</td>
                        <td className="py-3.5 px-4 text-right">{h.qty}</td>
                        <td className="py-3.5 px-4 text-right">
                          ₹{Number(h.avg_price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          ₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium">
                          ₹{val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className={`block text-xs ${pnl >= 0 ? "text-gain" : "text-loss"}`}>
                            {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedQuote({
                                symbol: h.symbol,
                                price,
                                fetchedAt: new Date().toISOString(),
                              });
                              setTradeSide("sell");
                            }}
                            className="text-xs font-body font-medium text-stamp border border-stamp/30 px-2.5 py-1 rounded-sm hover:bg-stamp hover:text-paper transition-colors"
                          >
                            Sell
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Trading Ticket & Lookup Section */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SymbolSearch
            onSelectQuote={(quote) => {
              setSelectedQuote(quote);
              setTradeSide("buy");
              setTradeStatus(null);
            }}
          />
        </div>

        <div>
          {selectedQuote ? (
            <div>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setTradeSide("buy")}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
                    tradeSide === "buy"
                      ? "bg-stamp text-paper border-stamp"
                      : "bg-paper text-ink border-rule/30"
                  }`}
                >
                  Buy Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTradeSide("sell")}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
                    tradeSide === "sell"
                      ? "bg-stamp text-paper border-stamp"
                      : "bg-paper text-ink border-rule/30"
                  }`}
                >
                  Sell Mode
                </button>
              </div>

              {tradeStatus && (
                <div
                  className={`p-3 rounded-sm text-xs font-body mb-3 border ${
                    tradeStatus.success
                      ? "bg-gain/10 border-gain/30 text-gain"
                      : "bg-loss/10 border-loss/30 text-loss"
                  }`}
                >
                  {tradeStatus.message}
                </div>
              )}

              <TradeTicket
                symbol={selectedQuote.symbol}
                price={selectedQuote.price}
                side={tradeSide}
                completedLessonSlugs={completedLessonSlugs}
                onSubmit={handleTradeSubmit}
              />
            </div>
          ) : (
            <div className="border border-dashed border-rule/30 rounded-sm p-8 text-center bg-paper h-full flex flex-col justify-center items-center">
              <p className="font-display text-base text-ink mb-1">Trade Ticket Ready</p>
              <p className="font-body text-xs text-muted max-w-xs">
                Select a stock from the lookup panel to load its real-time delayed quote into the trade form.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Transaction History Section */}
      <section className="mb-12">
        <h2 className="font-display text-xl font-semibold text-ink mb-3">
          Passbook Activity Ledger
        </h2>
        <TransactionHistory transactions={initialTransactions} />
      </section>

      {/* Disclaimers */}
      <footer className="pt-6 border-t border-rule/25 text-center text-xs text-muted space-y-1 font-body">
        <p>Simulated portfolio. Prices are delayed ~15 minutes and sourced for educational use.</p>
        <p>Not real money. Not financial advice. NiveshLoop simulation environment.</p>
      </footer>
    </main>
  );
}
