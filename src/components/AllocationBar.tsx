"use client";

import { InkNumber } from "./InkNumber";

interface HoldingItem {
  id: string;
  symbol: string;
  qty: number;
  avg_price: number;
  current_price?: number;
}

interface AllocationBarProps {
  cash: number;
  holdings: HoldingItem[];
}

const PALETTE = [
  "#2F6B4F", // gain green
  "#1E2A44", // indigo ink
  "#8C2F39", // stamp oxblood
  "#5C7A63", // rule green
  "#6B7568", // muted grey
];

export function AllocationBar({ cash, holdings }: AllocationBarProps) {
  const activeHoldings = holdings.filter((h) => Number(h.qty) > 0);
  const holdingsValue = activeHoldings.reduce((sum, h) => {
    const price = h.current_price ?? Number(h.avg_price);
    return sum + Number(h.qty) * price;
  }, 0);

  const totalPortfolio = cash + holdingsValue;
  if (totalPortfolio <= 0) return null;

  const cashPct = Math.round((cash / totalPortfolio) * 100);

  const segments = [
    { label: "Cash Balance", value: cash, pct: cashPct, color: "#5C7A63" },
    ...activeHoldings.map((h, i) => {
      const price = h.current_price ?? Number(h.avg_price);
      const val = Number(h.qty) * price;
      const pct = Math.round((val / totalPortfolio) * 100);
      return {
        label: h.symbol,
        value: val,
        pct,
        color: PALETTE[(i + 1) % PALETTE.length],
      };
    }),
  ];

  return (
    <div className="border border-rule/25 bg-paper rounded-sm p-4 text-ink font-body">
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="font-display text-sm font-semibold text-ink">Asset Allocation Ledger</h3>
        <span className="font-mono text-xs text-muted">Total: <InkNumber value={totalPortfolio} className="font-semibold text-ink" /></span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3.5 w-full flex rounded-xs overflow-hidden border border-rule/20 bg-rule/10">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            style={{ width: `${Math.max(1, seg.pct)}%`, backgroundColor: seg.color }}
            className="h-full transition-all duration-300 relative group cursor-pointer border-r border-paper/20 last:border-r-0"
            title={`${seg.label}: ₹${seg.value.toLocaleString("en-IN")} (${seg.pct}%)`}
          />
        ))}
      </div>

      {/* Segment Legend Chips */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs font-mono">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: seg.color }} />
            <span className="text-muted">{seg.label}:</span>
            <span className="font-semibold text-ink">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
