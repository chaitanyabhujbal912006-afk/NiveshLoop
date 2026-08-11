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
    <div className="w-full max-w-3xl mx-auto border border-rule/30 bg-paper overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-ink text-paper p-6 relative overflow-hidden">
        <div className="absolute inset-0 dotgrid-bg opacity-30 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stamp" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stamp bg-stamp/20 px-2 py-0.5 rounded-sm">
              SEBI Advisory Guard
            </span>
            <span className="font-mono text-[9px] text-paper/40 uppercase tracking-widest">
              Educational Protection
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-paper mb-2">
            SEBI Stock Tip & Scam Checker
          </h2>
          <p className="font-body text-xs text-paper/60 leading-relaxed max-w-xl">
            Paste any WhatsApp forward, Telegram tip, or SMS recommendation to scan against SEBI&apos;s published fraud patterns.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 ledger-bg">
        {/* Preset Chips */}
        <div className="mb-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted block mb-2">
            Try a sample tip:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_TIPS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.text)}
                className="font-mono text-xs border border-rule/25 bg-paper px-3 py-1.5 rounded-sm hover:border-stamp hover:text-stamp transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="mb-6">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">
            Paste message / forward text below:
          </label>
          <textarea
            rows={4}
            value={tipText}
            onChange={(e) => setTipText(e.target.value)}
            placeholder="e.g. BUY RELIANCE TODAY! GUARANTEED 20% TARGET IN 2 DAYS! JOIN TELEGRAM VIP..."
            className="w-full font-mono text-xs border border-rule/30 p-3 bg-paper focus:border-stamp outline-none resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="font-mono text-[9px] text-muted">
              {tipText.length} characters
            </span>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !tipText.trim()}
              className="bg-stamp text-paper font-mono text-xs uppercase tracking-widest px-6 py-2.5 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? "Scanning SEBI Rules..." : "Scan For Red Flags →"}
            </button>
          </div>
        </div>

        {/* Results Display */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="border-t-2 border-rule/25 pt-6 mt-6"
            >
              {/* Score Meter & Badge */}
              <div className="border border-rule/30 p-5 bg-paper shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted block mb-0.5">
                      SEBI Red-Flag Risk Score
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-3xl font-bold tabular-nums text-ink">
                        {result.riskScore}
                        <span className="text-sm font-normal text-muted">/100</span>
                      </span>
                      <span
                        className={`font-mono text-xs uppercase font-semibold px-2.5 py-1 rounded-sm border ${
                          result.riskLevel === "Critical"
                            ? "bg-loss/15 text-loss border-loss/40"
                            : result.riskLevel === "High"
                            ? "bg-stamp/15 text-stamp border-stamp/40"
                            : result.riskLevel === "Moderate"
                            ? "bg-amber-500/15 text-amber-700 border-amber-500/40"
                            : "bg-gain/15 text-gain border-gain/40"
                        }`}
                      >
                        {result.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                  <p className="font-body text-xs text-ink/75 max-w-xs sm:text-right">
                    {result.summary}
                  </p>
                </div>

                {/* Score Bar */}
                <div className="h-2 bg-rule/15 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      result.riskScore >= 60
                        ? "bg-loss"
                        : result.riskScore >= 35
                        ? "bg-stamp"
                        : result.riskScore >= 20
                        ? "bg-amber-500"
                        : "bg-gain"
                    }`}
                  />
                </div>
              </div>

              {/* Detected Red Flags */}
              {result.flags.length > 0 ? (
                <div className="space-y-3 mb-6">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted block">
                    Detected SEBI Red Flags ({result.flags.length}):
                  </span>
                  {result.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="border border-rule/25 bg-paper p-4 border-l-4 border-l-loss shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-display text-sm font-semibold text-ink">
                          {flag.title}
                        </p>
                        <span className="font-mono text-[8px] uppercase tracking-widest bg-loss/10 text-loss px-1.5 py-0.5 rounded-sm">
                          {flag.severity}
                        </span>
                      </div>
                      <p className="font-body text-xs text-ink/70 mb-2 leading-relaxed">
                        {flag.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-mono text-muted">
                        <span>SEBI Ref: {flag.sebiReference}</span>
                        {flag.matchedText && (
                          <span className="text-loss">
                            Matched: &quot;{flag.matchedText}&quot;
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-gain/30 bg-gain/5 p-4 rounded-sm mb-6">
                  <p className="font-mono text-xs font-semibold text-gain mb-0.5">
                    ✓ No obvious SEBI red flags detected
                  </p>
                  <p className="font-body text-xs text-ink/70">
                    While no obvious scam patterns were triggered, always verify financial statements on NSE/BSE before trading.
                  </p>
                </div>
              )}

              {/* Recommendation Box */}
              <div className="bg-ink text-paper p-4 rounded-sm">
                <span className="font-mono text-[8px] uppercase tracking-widest text-paper/40 block mb-1">
                  SEBI Advisory Guidance:
                </span>
                <p className="font-body text-xs text-paper/90 font-medium">
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
