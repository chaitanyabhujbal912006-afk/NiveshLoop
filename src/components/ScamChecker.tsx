"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScamAnalysisResult } from "@/lib/scam-checker";

const PRESET_TIPS = [
  {
    label: "🚨 Telegram Jackpot Scam",
    text: "JOIN OUR VIP TELEGRAM CHANNEL FOR GUARANTEED 100% PROFIT DAILY CALLS! SURE SHOT JACKPOT STOCK BUY TODAY BEFORE 9:15 AM!",
  },
  {
    label: "⚠️ Fake SEBI Registration Trap",
    text: "100% SEBI approved tips! Join WhatsApp group for risk free daily profit. Penny stock rocket target 1000% multibagger alert!",
  },
  {
    label: "✅ Factual Earnings Report",
    text: "TCS reported Q3 FY26 net profit of Rs 11,050 crore, up 5.2% YoY. Management maintained IT spending guidance for the upcoming quarter.",
  },
];

export function ScamChecker() {
  const [tipText, setTipText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

  async function handleAnalyze(textToUse?: string) {
    const text = textToUse ?? tipText;
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/check-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data: ScamAnalysisResult = await res.json();
      setResult(data);
    } catch {
      // Non-fatal
    } finally {
      setLoading(false);
    }
  }

  function handlePresetClick(presetText: string) {
    setTipText(presetText);
    handleAnalyze(presetText);
  }

  return (
    <div className="w-full max-w-3xl mx-auto border border-rule/40 bg-paper/95 backdrop-blur-md overflow-hidden shadow-2xl rounded-sm passbook-card">
      {/* Header */}
      <div className="bg-ink text-paper p-6 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 dotgrid-bg opacity-25 pointer-events-none" />
        <div className="absolute inset-0 mesh-dark opacity-70 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-stamp via-stamp/80 to-stamp" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-stamp bg-stamp/20 border border-stamp/30 px-2.5 py-0.5 rounded-xs">
              SEBI Advisory Guard
            </span>
            <span className="font-mono text-[9px] text-paper/50 uppercase tracking-widest font-semibold">
              Educational Fraud Protection
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-paper mb-2">
            SEBI Stock Tip & Scam Checker
          </h2>
          <p className="font-body text-xs text-paper/70 leading-relaxed max-w-xl">
            Paste any WhatsApp forward, Telegram tip, or SMS recommendation to scan against SEBI&apos;s published fraud patterns and red flags.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 ledger-bg">
        {/* Preset Chips */}
        <div className="mb-6">
          <span className="font-mono text-[9.5px] uppercase font-bold tracking-widest text-muted block mb-2.5">
            Test a Sample Message:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_TIPS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.text)}
                className="font-mono text-xs font-semibold border border-rule/30 bg-paper px-3.5 py-2 rounded-xs hover:border-stamp hover:text-stamp transition-all shadow-xs active:scale-[0.98]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="mb-6">
          <label className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block mb-2">
            Paste message / forward text below:
          </label>
          <textarea
            rows={4}
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="e.g. BUY RELIANCE TODAY! GUARANTEED 20% TARGET IN 2 DAYS! JOIN TELEGRAM VIP..."
            className="w-full font-mono text-xs border border-rule/35 p-3.5 bg-paper rounded-xs focus:border-stamp focus:ring-1 focus:ring-stamp outline-none resize-none leading-relaxed shadow-inner"
          />
          <div className="flex justify-between items-center mt-2.5">
            <span className="font-mono text-[9px] text-muted/70 font-medium">
              {tipText.length} characters
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !tipText.trim()}
              className="bg-stamp text-paper font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 shadow-md glow-border-stamp flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Scanning SEBI Rules...</span>
                </>
              ) : (
                <>
                  <span>Scan For Red Flags</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="border-t border-rule/25 pt-6 mt-6 space-y-6"
            >
              {/* Risk Banner */}
              <div
                className={[
                  "p-5 rounded-xs border flex items-center justify-between shadow-md",
                  result.riskLevel === "Critical" || result.riskLevel === "High"
                    ? "bg-loss/10 border-loss/40 glow-border-stamp"
                    : result.riskLevel === "Moderate"
                    ? "bg-yellow-500/10 border-yellow-600/40"
                    : "bg-gain/10 border-gain/40 glow-border-gain",
                ].join(" ")}
              >
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest font-bold opacity-80 block mb-1">
                    SEBI Risk Score Analysis
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold uppercase">
                      {result.riskLevel === "Critical" || result.riskLevel === "High"
                        ? `🚨 ${result.riskLevel} Fraud Risk`
                        : result.riskLevel === "Moderate"
                        ? "⚠️ Moderate Risk"
                        : "✅ Low Risk / Info"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-3xl font-extrabold tabular-nums">
                    {result.riskScore}/100
                  </span>
                  <span className="font-mono text-[8px] uppercase tracking-widest block opacity-70">
                    Risk Score
                  </span>
                </div>
              </div>

              {/* Matched Red Flags */}
              {result.flags.length > 0 && (
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-muted block mb-2">
                    Detected Red Flags ({result.flags.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="bg-paper border border-rule/25 p-3 rounded-xs flex items-start gap-2 shadow-xs"
                      >
                        <span className="text-stamp font-bold text-sm">🚩</span>
                        <div>
                          <p className="font-mono text-xs font-bold text-ink">{flag.category}</p>
                          <p className="font-body text-[11px] text-ink/70 mt-0.5 leading-snug">{flag.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEBI Advice */}
              <div className="bg-ink text-paper p-5 rounded-xs border border-rule/30 relative">
                <span className="font-mono text-[9px] uppercase tracking-widest text-stamp font-bold block mb-1">
                  SEBI Advisory Protection Recommendation
                </span>
                <p className="font-body text-xs text-paper/80 leading-relaxed">
                  {result.recommendation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
