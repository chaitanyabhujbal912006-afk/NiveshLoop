"use client";

import type { MarketDepthEntry } from "@/hooks/useLiveMarketData";

interface MarketDepthWidgetProps {
  symbol: string;
  currentPrice: number;
  bids: MarketDepthEntry[];
  asks: MarketDepthEntry[];
}

export function MarketDepthWidget({ symbol, currentPrice, bids, asks }: MarketDepthWidgetProps) {
  const totalBidQty = bids.reduce((acc, b) => acc + b.qty, 0);
  const totalAskQty = asks.reduce((acc, a) => acc + a.qty, 0);
  const totalQty = totalBidQty + totalAskQty || 1;
  const bidPct = Math.round((totalBidQty / totalQty) * 100);
  const askPct = 100 - bidPct;

  const maxQty = Math.max(...bids.map((b) => b.qty), ...asks.map((a) => a.qty), 1);

  return (
    <div className="border-2 border-ink bg-paper p-4 deep-shadow font-mono text-xs">
      <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink uppercase tracking-wider">{symbol} Market Depth</span>
          <span className="text-[9px] bg-gain/10 text-gain border border-gain/30 px-1.5 py-0.5 font-bold uppercase tracking-widest animate-pulse">
            LIVE L2
          </span>
        </div>
        <span className="text-[10px] text-muted">5 Bids / 5 Asks</span>
      </div>

      {/* Bid vs Ask Ratio Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-bold mb-1">
          <span className="text-gain">BUY {bidPct}% ({totalBidQty.toLocaleString("en-IN")} Qty)</span>
          <span className="text-loss">SELL {askPct}% ({totalAskQty.toLocaleString("en-IN")} Qty)</span>
        </div>
        <div className="h-2 w-full bg-loss/20 rounded-full overflow-hidden flex">
          <div className="h-full bg-gain transition-all duration-500" style={{ width: `${bidPct}%` }} />
          <div className="h-full bg-loss transition-all duration-500" style={{ width: `${askPct}%` }} />
        </div>
      </div>

      {/* Depth Table */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bids Column */}
        <div>
          <div className="grid grid-cols-3 text-[9px] text-muted uppercase font-bold border-b border-ink/20 pb-1 mb-1 text-right">
            <span className="text-left">Orders</span>
            <span>Qty</span>
            <span className="text-gain">Bid ₹</span>
          </div>
          {bids.map((b, idx) => (
            <div key={idx} className="relative grid grid-cols-3 text-[10px] py-1 border-b border-ink/10 text-right overflow-hidden">
              <div
                className="absolute inset-y-0 right-0 bg-gain/10 pointer-events-none transition-all duration-300"
                style={{ width: `${(b.qty / maxQty) * 100}%` }}
              />
              <span className="text-left text-muted relative z-10">{b.orders}</span>
              <span className="font-semibold text-ink relative z-10">{b.qty.toLocaleString("en-IN")}</span>
              <span className="font-bold text-gain relative z-10">₹{b.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-[10px] font-bold text-gain mt-2 pt-1 border-t border-ink">
            <span>Total Buy</span>
            <span>{totalBidQty.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Asks Column */}
        <div>
          <div className="grid grid-cols-3 text-[9px] text-muted uppercase font-bold border-b border-ink/20 pb-1 mb-1 text-right">
            <span className="text-loss text-left">Ask ₹</span>
            <span>Qty</span>
            <span>Orders</span>
          </div>
          {asks.map((a, idx) => (
            <div key={idx} className="relative grid grid-cols-3 text-[10px] py-1 border-b border-ink/10 text-right overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-loss/10 pointer-events-none transition-all duration-300"
                style={{ width: `${(a.qty / maxQty) * 100}%` }}
              />
              <span className="font-bold text-loss text-left relative z-10">₹{a.price.toFixed(2)}</span>
              <span className="font-semibold text-ink relative z-10">{a.qty.toLocaleString("en-IN")}</span>
              <span className="text-muted relative z-10">{a.orders}</span>
            </div>
          ))}
          <div className="flex justify-between text-[10px] font-bold text-loss mt-2 pt-1 border-t border-ink">
            <span>Total Sell</span>
            <span>{totalAskQty.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
