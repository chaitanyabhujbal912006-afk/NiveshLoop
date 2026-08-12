"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MarketStat {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

const MARKET_STATS: MarketStat[] = [
  { label: "NIFTY 50",   value: "22,147.90",  change: "+0.6%",  up: true  },
  { label: "SENSEX",     value: "73,212.40",  change: "+0.7%",  up: true  },
  { label: "NSE A/D",   value: "1,241",      change: "↑ 963",  up: true  },
];

export function MoneyVaultWidget() {
  const [cashVal, setCashVal] = useState(100000);
  const [pulse, setPulse] = useState(false);
  const [alloc] = useState([
    { label: "Large Cap", pct: 52, color: "#2F6B4F" },
    { label: "Mid Cap",   pct: 28, color: "#8C2F39" },
    { label: "Cash",      pct: 20, color: "#5C7A63" },
  ]);

  // Periodic small cash fluctuation to demonstrate live state
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() > 0.4 ? 1 : -1) * Math.floor(Math.random() * 850 + 150);
      setCashVal((prev) => Math.max(80000, prev + delta));
      setPulse(true);
      setTimeout(() => setPulse(false), 450);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[270px] border border-rule/40 bg-paper/95 backdrop-blur-md shadow-xl rounded-sm overflow-hidden passbook-card">
      {/* Background dot matrix */}
      <div className="absolute inset-0 dotgrid-bg opacity-40 pointer-events-none" />

      {/* Red passbook binding spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-stamp via-stamp/90 to-stamp" />

      {/* Header */}
      <div className="ml-1 flex items-center justify-between px-5 pt-5 pb-3 border-b border-rule/20 bg-rule/[0.03]">
        <div>
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted block mb-0.5">
            § 02 — Virtual Money Vault
          </span>
          <span className="font-display text-xs font-semibold text-ink flex items-center gap-1.5">
            ₹1,00,000 Capital
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-gain/10 border border-gain/30 px-2 py-0.5 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gain" />
          </span>
          <span className="font-mono text-[7px] uppercase font-bold tracking-wider text-gain">Live</span>
        </div>
      </div>

      {/* Floating 3D Currency Notes Stack */}
      <div className="ml-1 relative h-32 my-1 flex items-center justify-center px-4 overflow-hidden">
        {/* ₹2000 Note */}
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-6, -4, -6] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          className="absolute w-44 h-22 bg-gradient-to-br from-stamp/25 via-stamp/15 to-paper border border-stamp/40 rounded-xs p-2.5 shadow-md flex flex-col justify-between"
          style={{ transform: "rotate(-6deg) translate(-10px, -4px)" }}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] font-bold text-stamp tracking-wider">₹2000</span>
            <span className="font-mono text-[6px] text-stamp/70 uppercase tracking-widest">Reserve Bank of Simulation</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-mono text-[6.5px] text-stamp/50 uppercase tracking-widest">Educational Note</span>
            <span className="font-display text-xs font-bold text-stamp/90">₹2,000.00</span>
          </div>
        </motion.div>

        {/* ₹500 Note */}
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [5, 7, 5] }}
          transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
          className="absolute w-44 h-22 bg-gradient-to-br from-gain/25 via-gain/15 to-paper border border-gain/40 rounded-xs p-2.5 shadow-lg flex flex-col justify-between z-10"
          style={{ transform: "rotate(5deg) translate(10px, 8px)" }}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] font-bold text-gain tracking-wider">₹500</span>
            <span className="font-mono text-[6px] text-gain/70 uppercase tracking-widest">Simulated Currency</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="font-mono text-[6.5px] text-gain/50 uppercase tracking-widest">Legal Tender: Zero</span>
            <span className="font-display text-xs font-bold text-gain/95">₹500.00</span>
          </div>
        </motion.div>

        {/* Metallic Gold Rupee Coin */}
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="absolute h-11 w-11 rounded-full border-2 border-yellow-600/80 bg-gradient-to-tr from-yellow-700 via-yellow-400 to-yellow-100 shadow-xl flex items-center justify-center z-20"
          style={{ transformStyle: "preserve-3d", boxShadow: "0 4px 14px rgba(212,175,55,0.4)" }}
        >
          <span className="font-mono font-bold text-yellow-950 text-base drop-shadow-xs">₹</span>
        </motion.div>
      </div>

      {/* Cash Balance */}
      <div className="ml-1 bg-ink text-paper px-5 py-3.5 text-center relative">
        <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-paper/45 block mb-1">
          Simulated Cash Balance
        </span>
        <div
          className={`font-mono text-xl font-bold tabular-nums transition-colors duration-300 ${
            pulse ? "text-gain font-extrabold scale-105" : "text-paper"
          }`}
        >
          ₹{cashVal.toLocaleString("en-IN")}.00
        </div>
      </div>

      {/* Allocation breakdown */}
      <div className="ml-1 px-5 py-3.5 border-t border-rule/15 bg-rule/[0.02]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[7.5px] uppercase tracking-widest text-muted">
            Portfolio Allocation
          </span>
          <span className="font-mono text-[7.5px] text-stamp font-semibold uppercase">100% Simulated</span>
        </div>
        <div className="space-y-2">
          {alloc.map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="font-mono text-[8.5px] text-ink/80 w-16 shrink-0 font-medium">{row.label}</span>
              <div className="flex-1 h-2 bg-rule/15 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: row.color, opacity: 0.85 }}
                />
              </div>
              <span className="font-mono text-[8.5px] tabular-nums text-ink font-semibold w-7 text-right">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Indices strip */}
      <div className="ml-1 border-t border-rule/15 px-5 py-3 bg-paper">
        <span className="font-mono text-[7.5px] uppercase tracking-widest text-muted block mb-2">
          Live Market Benchmark
        </span>
        <div className="space-y-1.5">
          {MARKET_STATS.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="font-mono text-[8.5px] text-muted font-medium">{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8.5px] tabular-nums text-ink font-semibold">{s.value}</span>
                <span
                  className={`font-mono text-[8.5px] tabular-nums font-bold px-1.5 py-0.2 rounded-xs ${
                    s.up ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
                  }`}
                >
                  {s.change}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="font-mono text-[7px] text-muted/50 mt-2.5 leading-tight text-center">
          Educational simulation · Delayed prices ~15 min
        </p>
      </div>
    </div>
  );
}

