"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLiveMarketData } from "@/hooks/useLiveMarketData";
import { MarketDepthWidget } from "./MarketDepthWidget";
import { PriceChart } from "./PriceChart";
import { TradeTicket } from "./TradeTicket";
import { SymbolSearch } from "./SymbolSearch";
import type { PriceQuote, TradeSide } from "@/types";

interface RealtimeTradingTerminalProps {
  initialQuote?: PriceQuote | null;
  completedLessonSlugs: string[];
  onSubmitTrade: (payload: { symbol: string; side: TradeSide; qty: number; stopLoss: number | null }) => Promise<void>;
  tradeLoading?: boolean;
}

const POPULAR_WATCHLIST = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2967.40, change: "+0.8%" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", price: 3845.20, change: "+1.2%" },
  { symbol: "INFY.NS", name: "Infosys Ltd", price: 1542.75, change: "-0.4%" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", price: 1673.60, change: "+0.5%" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors Ltd", price: 984.50, change: "+2.1%" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd", price: 1154.20, change: "+0.9%" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd", price: 1210.50, change: "+1.4%" },
  { symbol: "ITC.NS", name: "ITC Ltd", price: 435.80, change: "-0.1%" },
];

export function RealtimeTradingTerminal({
  initialQuote,
  completedLessonSlugs,
  onSubmitTrade,
  tradeLoading = false,
}: RealtimeTradingTerminalProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialQuote?.symbol || "RELIANCE.NS");
  const [tradeSide, setTradeSide] = useState<TradeSide>("buy");
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1H" | "1D">("5m");
  const [showIndicators, setShowIndicators] = useState(true);

  const { indices, currentQuote, bids, asks, lastTickDirection } = useLiveMarketData(
    selectedSymbol,
    initialQuote?.price || 2967.40
  );

  return (
    <div className="w-full border-2 border-ink bg-paper deep-shadow relative z-10 overflow-hidden font-body">
      {/* ── TOP INDICES TICKER HEADER BAR ── */}
      <div className="bg-ink text-paper font-mono text-xs py-2 px-4 flex items-center justify-between border-b-2 border-ink overflow-x-auto shadow-sm">
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-paper/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gain" />
            </span>
            LIVE TICKER FEED
          </div>
          {indices.map((m) => (
            <div key={m.name} className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-paper/50 font-bold">{m.name}</span>
              <span className="tabular-nums text-paper/90 font-medium">{m.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              <span className={`tabular-nums font-bold ${m.up ? "text-gain" : "text-loss"}`}>
                {m.up ? "▲ +" : "▼ "}{m.change.toFixed(2)} ({m.changePercent > 0 ? "+" : ""}{m.changePercent}%)
              </span>
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3 font-mono text-[10px] uppercase text-paper/50">
          <span className="bg-gain/20 text-gain border border-gain/30 px-2 py-0.5 font-bold">NSE / BSE CONNECTED</span>
        </div>
      </div>

      {/* ── TRADING TERMINAL TOP CONTROLS BAR ── */}
      <div className="border-b-2 border-ink bg-ink/5 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Symbol & Live Price Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xl font-extrabold text-ink">{currentQuote.symbol}</span>
            <span className="font-mono text-[9px] uppercase bg-ink text-paper px-2 py-0.5 font-bold">NSE</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-2xl font-bold transition-colors duration-300 tabular-nums ${
              lastTickDirection === "up" ? "text-gain" : lastTickDirection === "down" ? "text-loss" : "text-ink"
            }`}>
              ₹{currentQuote.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`font-mono text-xs font-bold tabular-nums ${(currentQuote.change ?? 0) >= 0 ? "text-gain" : "text-loss"}`}>
              {(currentQuote.change ?? 0) >= 0 ? "+" : ""}{(currentQuote.change ?? 0).toFixed(2)} ({(currentQuote.changePercent ?? 0) >= 0 ? "+" : ""}{(currentQuote.changePercent ?? 0).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Timeframe & Indicators Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-ink/30 bg-paper p-0.5">
            {(["1m", "5m", "15m", "1H", "1D"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 font-mono text-[10px] font-bold uppercase transition-all ${
                  timeframe === tf ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowIndicators((prev) => !prev)}
            className={`font-mono text-[10px] font-bold uppercase px-3 py-1.5 border transition-all ${
              showIndicators ? "bg-stamp text-paper border-stamp" : "bg-paper text-ink border-ink/30"
            }`}
          >
            {showIndicators ? "✓ Indicators ON" : "+ Indicators"}
          </button>
        </div>
      </div>

      {/* ── MAIN TERMINAL GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0">
        {/* Left: Chart & Watchlist Panel */}
        <div className="p-4 border-r-0 lg:border-r-2 border-ink space-y-4">
          {/* Symbol Quick Search Input */}
          <div className="mb-2">
            <SymbolSearch
              onSelectQuote={(q) => {
                setSelectedSymbol(q.symbol);
              }}
            />
          </div>

          {/* Interactive Trading Chart */}
          <PriceChart
            symbol={currentQuote.symbol}
            currentPrice={currentQuote.price}
            isCandlestickUnlocked={true}
          />

          {/* Watchlist Quick Access Drawer */}
          <div className="border-2 border-ink bg-paper p-3 deep-shadow">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-ink/20">
              <span className="font-mono text-xs font-bold uppercase text-ink">NIFTY 50 Watchlist</span>
              <span className="font-mono text-[9px] text-muted uppercase">Realtime Quotes</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POPULAR_WATCHLIST.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => setSelectedSymbol(item.symbol)}
                  className={`p-2 border text-left transition-all hover:-translate-y-0.5 ${
                    selectedSymbol === item.symbol
                      ? "border-stamp bg-stamp/5 font-bold"
                      : "border-ink/20 bg-paper hover:border-ink"
                  }`}
                >
                  <p className="font-mono text-[10px] font-bold text-ink truncate">{item.symbol.replace(".NS", "")}</p>
                  <div className="flex justify-between items-baseline mt-0.5 font-mono text-[10px]">
                    <span className="text-ink/80">₹{item.price.toFixed(0)}</span>
                    <span className={item.change.startsWith("+") ? "text-gain font-semibold" : "text-loss font-semibold"}>
                      {item.change}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Order Book & Trade Execution Ticket */}
        <div className="p-4 space-y-4 bg-ink/[0.02]">
          {/* Side Switcher (Buy / Sell) */}
          <div className="flex gap-2">
            {(["buy", "sell"] as TradeSide[]).map((side) => (
              <button
                key={side}
                onClick={() => setTradeSide(side)}
                className={`flex-1 py-2.5 font-mono text-xs font-bold uppercase border-2 transition-all shadow-xs ${
                  tradeSide === side
                    ? side === "buy"
                      ? "bg-gain text-paper border-gain"
                      : "bg-loss text-paper border-loss"
                    : "bg-paper text-muted border-ink/30 hover:text-ink"
                }`}
              >
                {side === "buy" ? "Buy Order (LONG)" : "Sell Order (SHORT)"}
              </button>
            ))}
          </div>

          {/* Trade Execution Ticket */}
          <TradeTicket
            symbol={currentQuote.symbol}
            price={currentQuote.price}
            side={tradeSide}
            completedLessonSlugs={completedLessonSlugs}
            dayHigh={currentQuote.dayHigh}
            dayLow={currentQuote.dayLow}
            volume={currentQuote.volume}
            fiftyTwoWeekHigh={currentQuote.fiftyTwoWeekHigh}
            fiftyTwoWeekLow={currentQuote.fiftyTwoWeekLow}
            onSubmit={(payload) =>
              onSubmitTrade({
                symbol: currentQuote.symbol,
                side: tradeSide,
                qty: payload.qty,
                stopLoss: payload.stopLoss,
              })
            }
          />

          {/* Real-time Market Depth L2 Widget */}
          <MarketDepthWidget
            symbol={currentQuote.symbol}
            currentPrice={currentQuote.price}
            bids={bids}
            asks={asks}
          />
        </div>
      </div>
    </div>
  );
}
