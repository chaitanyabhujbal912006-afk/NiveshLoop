"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlyingMoneyParticle {
  id: number;
  symbol: string;
  x: number;
  rotation: number;
  speed: number;
  size: number;
}

export function MoneyVaultWidget() {
  const [particles, setParticles] = useState<FlyingMoneyParticle[]>([]);
  const [cashVal, setCashVal] = useState(100000);
  const [pulse, setPulse] = useState(false);

  // Periodic pulse effect on cash value
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() > 0.4 ? 1 : -1) * Math.floor(Math.random() * 850 + 150);
      setCashVal((prev) => Math.max(80000, prev + delta));
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  function makeItRain() {
    const newParticles: FlyingMoneyParticle[] = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      symbol: ["₹500", "₹2000", "$100", "₹100", "💸", "🪙", "₹"][Math.floor(Math.random() * 7)],
      x: Math.random() * 260 - 20,
      rotation: Math.random() * 360,
      speed: 2 + Math.random() * 2.5,
      size: 12 + Math.floor(Math.random() * 12),
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  }

  // Clean up particles after animation
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) => prev.slice(7));
    }, 2500);
    return () => clearTimeout(timer);
  }, [particles]);

  return (
    <div className="relative w-full max-w-[260px] border border-rule/35 bg-paper p-5 shadow-lg overflow-hidden group">
      {/* Background dotgrid */}
      <div className="absolute inset-0 dotgrid-bg opacity-30 pointer-events-none" />

      {/* Red passbook spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-stamp" />

      {/* Raining Money Particle Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -30, x: p.x, opacity: 1, rotate: p.rotation }}
              animate={{ y: 320, rotate: p.rotation + 180, opacity: 0 }}
              transition={{ duration: p.speed, ease: "easeIn" }}
              className="absolute font-mono font-bold text-stamp select-none"
              style={{ fontSize: p.size }}
            >
              {p.symbol}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 border-b border-rule/20 pb-3">
        <div>
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted block mb-0.5">
            § 02 — Virtual Money Vault
          </span>
          <span className="font-display text-xs font-semibold text-ink">
            ₹1,00,000 Capital
          </span>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gain opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gain"></span>
        </span>
      </div>

      {/* 3D Floating Money Bills Visual Stack */}
      <div className="relative h-28 my-3 flex items-center justify-center">
        {/* Floating background ₹2000 bill */}
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [-6, -4, -6] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute w-40 h-20 bg-gradient-to-br from-stamp/20 via-stamp/10 to-paper border border-stamp/40 rounded-sm p-2 shadow-md flex flex-col justify-between"
          style={{ transform: "rotate(-6deg) translate(-10px, -5px)" }}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] font-bold text-stamp">₹2000</span>
            <span className="font-mono text-[7px] text-stamp/60 uppercase">RESERVE BANK OF SIMULATION</span>
          </div>
          <div className="text-right">
            <span className="font-display text-xs font-bold text-stamp/80">₹2,000</span>
          </div>
        </motion.div>

        {/* Floating foreground ₹500 bill */}
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [5, 7, 5] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          className="absolute w-40 h-20 bg-gradient-to-br from-gain/20 via-gain/10 to-paper border border-gain/40 rounded-sm p-2 shadow-lg flex flex-col justify-between z-10"
          style={{ transform: "rotate(5deg) translate(10px, 8px)" }}
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] font-bold text-gain">₹500</span>
            <span className="font-mono text-[7px] text-gain/60 uppercase">SIMULATED CURRENCY</span>
          </div>
          <div className="text-right">
            <span className="font-display text-xs font-bold text-gain/90">₹500.00</span>
          </div>
        </motion.div>

        {/* 3D Gold Coin with metallic shine */}
        <motion.div
          animate={{ rotateY: [0, 360] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="absolute h-10 w-10 rounded-full border-2 border-yellow-600 bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-200 shadow-md flex items-center justify-center z-20"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="font-mono font-bold text-yellow-950 text-sm">₹</span>
        </motion.div>
      </div>

      {/* Live Value Display */}
      <div className="bg-ink text-paper p-3 rounded-sm text-center mb-3">
        <span className="font-mono text-[8px] uppercase tracking-widest text-paper/40 block mb-0.5">
          Simulated Cash Balance
        </span>
        <div
          className={`font-mono text-lg font-bold tabular-nums transition-colors ${
            pulse ? "text-gain" : "text-paper"
          }`}
        >
          ₹{cashVal.toLocaleString("en-IN")}.00
        </div>
      </div>

      {/* Interactive Button */}
      <button
        onClick={makeItRain}
        className="w-full font-mono text-[10px] uppercase tracking-widest bg-stamp/15 text-stamp border border-stamp/30 py-2 hover:bg-stamp hover:text-paper active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
      >
        <span>💸 Make It Rain</span>
        <span className="font-sans text-xs">✨</span>
      </button>
    </div>
  );
}
