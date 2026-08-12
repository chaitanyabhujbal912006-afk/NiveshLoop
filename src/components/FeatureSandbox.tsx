"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp } from "./Stamp";

export function FeatureSandbox() {
  const [activeDemo, setActiveDemo] = useState<"cooldown" | "unlock" | "stamp">("cooldown");

  // Cooldown Demo State
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);
  const [cooldownTriggered, setCooldownTriggered] = useState(false);

  useEffect(() => {
    if (cooldownTime === null) return;
    if (cooldownTime <= 0) {
      setCooldownTime(null);
      return;
    }
    const timer = setInterval(() => setCooldownTime((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [cooldownTime]);

  function triggerCooldown() {
    setCooldownTriggered(true);
    setCooldownTime(10);
  }

  // Unlock Demo State
  const [unlocked, setUnlocked] = useState(false);

  // Stamp Demo State
  const [stampEarned, setStampEarned] = useState(true);
  const [stampKey, setStampKey] = useState(0);

  function triggerStamp() {
    setStampEarned(false);
    setTimeout(() => {
      setStampKey((k) => k + 1);
      setStampEarned(true);
    }, 50);
  }

  return (
    <div className="border border-rule/40 bg-paper/95 backdrop-blur-md rounded-sm overflow-hidden shadow-2xl my-12 passbook-card">
      {/* Sandbox Header */}
      <div className="bg-ink text-paper p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rule/20 relative">
        <div className="absolute inset-0 dotgrid-bg opacity-20 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stamp" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stamp bg-stamp/20 border border-stamp/30 px-2 py-0.5 rounded-xs font-bold">
              Live Simulator
            </span>
            <span className="font-mono text-[9px] text-paper/50 uppercase tracking-widest">
              Try NiveshLoop Mechanics
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold text-paper">
            Interactive Behavioral Sandbox
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="relative flex items-center gap-1 bg-white/10 p-1.5 rounded-sm border border-white/15 self-stretch sm:self-auto backdrop-blur-sm">
          {[
            { id: "cooldown", label: "10s Cooldown Pause" },
            { id: "unlock", label: "Dynamic Form Unlock" },
            { id: "stamp", label: "Genuine Stamp Press" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDemo(tab.id as any)}
              className={[
                "flex-1 sm:flex-none font-mono text-xs px-3.5 py-1.5 rounded-xs transition-all duration-200 select-none",
                activeDemo === tab.id
                  ? "bg-stamp text-paper shadow-md font-bold glow-border-stamp"
                  : "text-paper/60 hover:text-paper hover:bg-white/10",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sandbox Workspace Body */}
      <div className="p-6 sm:p-10 ledger-bg relative min-h-[340px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* DEMO 1: COOLDOWN NUDGE */}
          {activeDemo === "cooldown" && (
            <motion.div
              key="cooldown-demo"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-paper border border-rule/35 p-6 shadow-xl relative passbook-card"
            >
              <div className="flex justify-between items-center mb-4 border-b border-rule/15 pb-3">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-loss font-bold px-2 py-0.5 bg-loss/10 rounded-xs border border-loss/20">
                    Market Drop Alert (-4.2%)
                  </span>
                  <p className="font-display text-base font-semibold text-ink mt-1">
                    Selling 10 × TCS.NS
                  </p>
                </div>
                <span className="font-mono text-xs tabular-nums text-ink font-semibold">₹38,452.00</span>
              </div>

              {cooldownTime !== null ? (
                <div className="border border-stamp/40 bg-stamp/10 p-5 text-center rounded-xs backdrop-blur-xs glow-border-stamp">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stamp opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-stamp" />
                    </span>
                    <span className="font-mono text-xs font-bold text-stamp uppercase tracking-widest">
                      Behavioral Cooldown Active
                    </span>
                  </div>
                  <p className="font-body text-xs text-ink/80 mb-4 max-w-xs mx-auto leading-relaxed">
                    Selling during a drop often locks in temporary panic. Take 10 seconds to pause and confirm this fits your long-term plan.
                  </p>
                  <div className="font-mono text-4xl font-extrabold text-stamp tabular-nums mb-4 drop-shadow-xs">
                    00:0{cooldownTime}
                  </div>
                  <button
                    disabled={cooldownTime > 0}
                    onClick={() => {
                      setCooldownTime(null);
                      setCooldownTriggered(false);
                    }}
                    className="w-full font-mono text-xs font-bold uppercase tracking-widest bg-stamp text-paper py-3 rounded-xs disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99] transition-all shadow-md"
                  >
                    {cooldownTime > 0 ? `Confirm Sell (${cooldownTime}s remaining)` : "Confirm Panic Sell →"}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-body text-xs text-ink/75 mb-5 leading-relaxed">
                    In real investing, panic-selling during dips is the #1 beginner mistake. Click below to experience how NiveshLoop introduces a 10s breathing pause before confirmation.
                  </p>
                  <button
                    onClick={triggerCooldown}
                    className="w-full font-body text-sm font-semibold bg-loss text-paper py-3.5 rounded-xs hover:opacity-95 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Simulate Panic Sell</span>
                    <span className="font-mono text-xs opacity-80">(-4.2% market dip)</span>
                  </button>
                  {cooldownTriggered && (
                    <p className="font-mono text-[10px] text-gain font-semibold text-center mt-3 flex items-center justify-center gap-1">
                      <span>✓</span> Cooldown completed. Trade executed with intent, not impulse.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* DEMO 2: DYNAMIC UNLOCK */}
          {activeDemo === "unlock" && (
            <motion.div
              key="unlock-demo"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md bg-paper border border-rule/35 p-6 shadow-xl passbook-card"
            >
              <div className="flex justify-between items-center mb-5 border-b border-rule/15 pb-3">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted block mb-0.5">Order Ticket UI</span>
                  <span className="font-display text-sm font-semibold text-ink">Dynamic Order Form</span>
                </div>
                <button
                  onClick={() => setUnlocked(!unlocked)}
                  className="font-mono text-[10px] font-bold uppercase tracking-widest bg-stamp text-paper px-3 py-1.5 rounded-xs hover:opacity-90 active:scale-[0.98] transition-all shadow-xs"
                >
                  {unlocked ? "🔒 Relock Form" : "🎓 Complete Lesson 5 →"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-widest text-muted block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    readOnly
                    value="5"
                    className="w-full font-mono text-xs border border-rule/25 px-3 py-2 bg-paper rounded-xs font-semibold text-ink"
                  />
                </div>

                {/* Dynamic Stop Loss Field */}
                <AnimatePresence>
                  {unlocked ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 border-t border-stamp/30 mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-mono text-[9px] uppercase tracking-widest text-stamp font-semibold flex items-center gap-1">
                            <span>🛡️ Stop-loss trigger</span>
                            <span className="bg-stamp/15 text-stamp px-1 rounded text-[7px] font-bold">
                              Unlocked!
                            </span>
                          </label>
                          <span className="font-mono text-[8px] text-muted">Lesson 5 Unlocked</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            readOnly
                            value="1480.00"
                            className="w-full font-mono text-xs border-2 border-stamp/40 px-3 py-2 bg-stamp/5 text-ink font-semibold rounded-xs"
                          />
                          <span className="absolute right-3 top-2.5 font-mono text-[9px] text-loss font-bold">
                            -4.0% Protection
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="border border-dashed border-rule/30 p-3 text-center bg-rule/[0.02] rounded-xs">
                      <p className="font-mono text-[9px] text-muted uppercase tracking-widest font-semibold">
                        🔒 Stop-loss field locked
                      </p>
                      <p className="font-body text-[11px] text-ink/60 mt-0.5">
                        Complete Lesson 5 (&quot;Stop-losses&quot;) to unlock automatic downside protection.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* DEMO 3: STAMP PRESS */}
          {activeDemo === "stamp" && (
            <motion.div
              key="stamp-demo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-md text-center bg-paper border border-rule/30 p-8 shadow-md"
            >
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-4">
                Genuine Achievement Stamp
              </p>

              <div className="h-32 flex items-center justify-center mb-4">
                {stampEarned && (
                  <Stamp
                    key={stampKey}
                    label="Stop-losses"
                    earned={true}
                    size="lg"
                    animateOnMount={true}
                  />
                )}
              </div>

              <p className="font-display text-base font-semibold text-ink mb-1">
                Lesson 5 Stamped
              </p>
              <p className="font-body text-xs text-ink/60 mb-6 max-w-xs mx-auto">
                Stamps celebrate genuine study & patience — never profits or gambling frequency.
              </p>

              <button
                onClick={triggerStamp}
                className="font-mono text-xs uppercase tracking-widest bg-stamp text-paper px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <span>Press Stamp Again</span>
                <span aria-hidden>↺</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
