"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Stamp } from "@/components/Stamp";

/* ─── Live ticker data ───────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "LESSON COMPLETED", "TCS.NS BOUGHT", "STOP-LOSS LEARNED", "INFY.NS SOLD",
  "DIVERSIFICATION UNLOCKED", "HDFC.NS BOUGHT", "REFLECTION DUE",
  "WIPRO.NS HELD", "LESSON COMPLETED", "RELIANCE.NS BOUGHT",
  "PORTFOLIO REVIEWED", "COOLDOWN RESPECTED",
];

/* ─── Demo passbook rows ─────────────────────────────────────────────────── */
const DEMO_ROWS = [
  { date: "01 Aug", code: "L-01", text: "Lesson — What is a stock?",            amount: null,        sign: null,  type: "lesson"  },
  { date: "01 Aug", code: "T-01", text: "Bought 5 × TCS.NS",                   amount: "₹19,275",   sign: "−",   type: "trade"   },
  { date: "08 Aug", code: "L-05", text: "Lesson — Stop-losses",                 amount: null,        sign: null,  type: "lesson"  },
  { date: "09 Aug", code: "T-04", text: "Bought 3 × INFY.NS · stop-loss set",  amount: "₹42,660",   sign: "−",   type: "trade"   },
  { date: "14 Aug", code: "T-07", text: "Sold 2 × TCS.NS · cooled down",       amount: "₹8,364",    sign: "+",   type: "trade"   },
  { date: "15 Aug", code: "R-02", text: "Reflection — 3 panic exits found",    amount: null,        sign: null,  type: "insight" },
  { date: "20 Aug", code: "L-09", text: "Lesson — Diversification",             amount: null,        sign: null,  type: "lesson"  },
  { date: "21 Aug", code: "T-11", text: "Bought HDFC.NS + WIPRO.NS",           amount: "₹31,900",   sign: "−",   type: "trade"   },
];

/* ─── Stamp row ─────────────────────────────────────────────────────────── */
function DemoRow({ row, i }: { row: typeof DEMO_ROWS[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0, 0.2, 1] }}
      className={[
        "grid items-center border-b border-rule/12 last:border-0",
        "grid-cols-[3rem_3.5rem_1fr_auto]",
        "py-3 px-0",
        row.type === "insight" ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-center h-8 w-8">
        {row.type === "lesson" ? (
          <Stamp label={row.text} earned size="sm" animateOnMount />
        ) : row.type === "insight" ? (
          <span className="font-mono text-[9px] text-muted border border-rule/40 px-1 py-0.5 rounded-sm">insight</span>
        ) : (
          <span className={`h-2 w-2 rounded-full ${row.sign === "+" ? "bg-gain" : "bg-loss"} opacity-70`} />
        )}
      </div>
      <span className="font-mono text-[10px] text-muted tabular-nums">{row.code}</span>
      <span className="font-body text-sm text-ink truncate">{row.text}</span>
      {row.amount ? (
        <span className={`font-mono tabular-nums text-sm font-medium ${row.sign === "+" ? "text-gain" : "text-loss"}`}>
          {row.sign}{row.amount}
        </span>
      ) : <span />}
    </motion.div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-paper overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════════════
          NAV — hair-thin, purely functional
          ════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-rule/20 bg-paper/90 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex justify-between items-center h-12">
          <span className="font-display text-ink font-semibold text-base tracking-tight">
            Nivesh<span className="text-stamp">Loop</span>
          </span>
          <div className="flex items-center gap-5">
            <Link href="/login" className="font-mono text-xs text-muted hover:text-ink transition-colors uppercase tracking-widest">
              Sign in
            </Link>
            <Link href="/signup" className="font-mono text-xs font-medium bg-stamp text-paper px-4 py-2 hover:opacity-90 transition-opacity uppercase tracking-widest">
              Open passbook →
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — THE SMASH HERO
          Full-bleed, ledger-lined BG, enormous type, passbook floated right
          ════════════════════════════════════════════════════════════════ */}
      <motion.section
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative min-h-screen ledger-bg flex flex-col justify-center pt-12"
      >
        {/* Rotated sidebar label */}
        <div className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 h-screen items-center justify-center pl-3">
          <span className="label-rotated font-mono text-[10px] uppercase tracking-[0.3em] text-muted/50">
            Simulated · Educational · Free
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 items-center w-full">

          {/* Left: knockout headline */}
          <div className="pt-12 pb-8">
            {/* Overline eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="h-px w-12 bg-rule/50" />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                For beginners · Indian markets
              </span>
            </motion.div>

            {/* GIANT headline — Fraunces italic for drama */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-display display-giant text-ink mb-6 selection:bg-stamp/20"
            >
              Learn.<br />
              <span className="italic">Trade.</span><br />
              <span className="text-stamp ink-underline">Reflect.</span>
            </motion.h1>

            {/* Sub-copy — ledger annotation style */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pl-1 border-l-2 border-rule/40 ml-1 mb-10"
            >
              <p className="font-body text-lg text-ink/75 leading-relaxed pl-4 max-w-md">
                The only investing app that connects every lesson directly to a{" "}
                <em className="not-italic font-semibold text-ink">simulated trade</em> —
                then hands the passbook back and shows you the pattern in how
                you're <em className="not-italic font-semibold text-ink">actually</em> investing.
              </p>
            </motion.div>

            {/* CTA + micro-stats */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.55 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 bg-stamp text-paper font-body font-semibold text-base px-8 py-4 hover:opacity-90 active:scale-[0.99] transition-all duration-100"
              >
                Open your passbook
                <span className="font-mono text-sm opacity-75">₹1,00,000 free</span>
              </Link>

              {/* Stats row */}
              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  { v: "₹0",      l: "real money required" },
                  { v: "15",      l: "lessons" },
                  { v: "Free",    l: "forever, no ads" },
                  { v: "Yours",   l: "pace, your choice" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p className="font-mono tabular-nums text-2xl font-semibold text-ink">{v}</p>
                    <p className="font-body text-xs text-muted mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: floating passbook */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 1.5 }}
            animate={mounted ? { opacity: 1, y: 0, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0, 0.2, 1] }}
            className="lg:self-center"
          >
            {/* Passbook book spine + page effect */}
            <div
              className="relative"
              style={{
                filter: "drop-shadow(0 24px 64px rgba(30,42,68,0.14)) drop-shadow(0 4px 16px rgba(30,42,68,0.08))",
              }}
            >
              {/* Stacked pages behind */}
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 border border-rule/20 bg-rule/[0.06] rounded-none" />
              <div className="absolute inset-0 translate-x-3 translate-y-3 border border-rule/10 bg-rule/[0.03] rounded-none" />

              {/* Main passbook */}
              <div className="relative border border-rule/35 bg-paper">
                {/* Book spine color bar */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-stamp/90" />

                {/* Header */}
                <div className="ml-3 px-4 pt-4 pb-3 border-b border-rule/25 flex justify-between items-center">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-0.5">NiveshLoop</p>
                    <p className="font-display text-sm font-semibold text-ink">Savings Passbook</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] text-muted">Page 01</p>
                    <p className="font-mono text-[9px] text-muted">A/C: SIMULATED</p>
                  </div>
                </div>

                {/* Column headers */}
                <div className="ml-3 grid grid-cols-[3rem_3.5rem_1fr_auto] px-4 py-2 border-b border-rule/20 bg-rule/[0.03]">
                  {["", "REF", "PARTICULARS", "AMOUNT"].map((h) => (
                    <span key={h} className="font-mono text-[8px] uppercase tracking-widest text-muted/70">{h}</span>
                  ))}
                </div>

                {/* Rows */}
                <div className="ml-3 px-4 pb-4">
                  {DEMO_ROWS.map((row, i) => (
                    <DemoRow key={i} row={row} i={i} />
                  ))}
                </div>

                {/* Balance footer */}
                <div className="ml-3 border-t-2 border-rule/30 px-4 py-3 flex justify-between items-center bg-rule/[0.03]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Closing balance</span>
                  <span className="font-mono tabular-nums text-base font-semibold text-ink">₹52,015.00</span>
                </div>

                {/* Watermark stamp */}
                <div className="absolute bottom-8 right-4 opacity-[0.07]">
                  <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#8C2F39" strokeWidth="6" />
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Fraunces" fontSize="11" fill="#8C2F39" letterSpacing="3">
                      SIMULATED
                    </text>
                    <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Fraunces" fontSize="11" fill="#8C2F39" letterSpacing="3">
                      PORTFOLIO
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={mounted ? { opacity: 1 } : {}}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-1"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted/50">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-rule/30 to-transparent"
          />
        </motion.div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════
          TICKER TAPE — scrolling ledger entries
          ════════════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden border-y border-rule/25 bg-ink py-3.5">
        <div className="ticker-track" aria-hidden>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">{item}</span>
              <span className="h-1 w-1 rounded-full bg-stamp" />
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — THE PROBLEM (oversized editorial)
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-20">
          {/* Rotated column label */}
          <div className="hidden lg:flex items-start pt-2">
            <span className="label-rotated font-mono text-[10px] uppercase tracking-[0.3em] text-muted/50">
              § 2 — The problem
            </span>
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display display-xl text-ink mb-12"
            >
              Every other app teaches<br />
              <span className="italic text-muted">without making you do.</span>
            </motion.h2>

            <div className="space-y-0">
              {[
                { n: "01", title: "Articles & videos",    body: "Perfect theory. But when you close the tab — nothing changes. You still don't know what you'd do with ₹50,000 on a volatile Monday." },
                { n: "02", title: "Paper-trading apps",   body: "Let you trade without context. No lesson connected to the order form. You can buy HDFC without knowing what HDFC is." },
                { n: "03", title: "Real money, too fast", body: "Most beginners who open a Zerodha account lose money in the first month. The gap between reading and doing is real and it's expensive." },
              ].map((item, i) => (
                <motion.div
                  key={item.n}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="grid grid-cols-[3rem_1fr] gap-6 py-8 border-b border-rule/20 last:border-0 group"
                >
                  <span className="font-mono text-5xl font-semibold text-rule/20 tabular-nums leading-none mt-1">
                    {item.n}
                  </span>
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink mb-2">{item.title}</p>
                    <p className="font-body text-base text-ink/65 leading-relaxed max-w-xl">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — INK BLOCK "How it works"
          High contrast ink-on-paper reversal
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-ink overflow-hidden">
        {/* Torn top edge */}
        <div className="torn-top h-6 bg-paper absolute top-0 inset-x-0 z-10" />
        <div className="torn-bottom h-6 bg-paper absolute bottom-0 inset-x-0 z-10" />

        {/* Faint ledger lines on dark bg */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 47px, rgba(92,122,99,0.06) 47px, rgba(92,122,99,0.06) 48px)",
          }}
        />

        <div className="relative z-0 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-32">
          <div className="flex flex-col items-start">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper/30 mb-4"
            >
              § 3 — One loop, always
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-display display-xl text-paper mb-16"
            >
              The loop that<br />
              <span className="text-stamp">closes the gap.</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-rule/30" aria-hidden />

            {[
              {
                n:    "1",
                icon: "📖",
                head: "Read the lesson",
                body: "4 minutes. No video, no quiz. One focused concept explained plainly.",
                accent: "text-rule",
              },
              {
                n:    "2",
                icon: "↗",
                head: "Execute a trade",
                body: "The lesson ends with a direct trade in your ₹1,00,000 simulated portfolio. Real delayed prices. No real money.",
                accent: "text-stamp",
              },
              {
                n:    "3",
                icon: "🪞",
                head: "See your pattern",
                body: "After 8–10 trades, we hand the passbook back: plain language, your own behavior described, never a recommendation.",
                accent: "text-gain",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.18 }}
                className="relative px-8 py-10 flex flex-col"
              >
                {/* Step number circle */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-8 w-8 rounded-full border border-rule/30 flex items-center justify-center shrink-0">
                    <span className="font-mono text-xs text-paper/60">{step.n}</span>
                  </div>
                  <div className="h-px flex-1 bg-rule/20 md:hidden" />
                </div>

                <span className="text-3xl mb-4" aria-hidden>{step.icon}</span>
                <p className={`font-display text-2xl font-semibold mb-3 ${step.accent}`}>{step.head}</p>
                <p className="font-body text-sm text-paper/55 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Loop arrow */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-4"
          >
            <div className="h-px w-24 bg-rule/20" />
            <span className="font-mono text-xs text-paper/25 uppercase tracking-widest">↺ then back to 1</span>
            <div className="h-px w-24 bg-rule/20" />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — THE FEATURES (full-width ledger table)
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-28">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display display-lg text-ink mb-2"
        >
          What makes it different
        </motion.h2>
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-14">
          § 4 — Product design choices
        </p>

        {/* Feature ledger table */}
        <div className="border border-rule/30 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_1fr] border-b-2 border-rule/30 bg-rule/[0.04] px-6 py-3 gap-6">
            <span />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Feature</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Why it matters</span>
          </div>

          {[
            {
              icon: "🔗",
              feat: "Lesson → Trade, directly",
              why: "The form changes when you learn. Complete stop-loss lesson? Stop-loss field appears. The UI proves you learned.",
            },
            {
              icon: "⏸",
              feat: "10-second cooldown nudge",
              why: "Try to sell during a sharp drop and a pause screen appears. Not a block — a breath. The button still works.",
            },
            {
              icon: "🪞",
              feat: "Behavioral reflection",
              why: "After 8–10 trades: 'You exited 3 positions within 2 days of buying.' No advice, just your own pattern held up.",
            },
            {
              icon: "🔒",
              feat: "Progressive unlocks",
              why: "Market orders only at first. Limit orders, stop-losses, sectoral analysis unlock as you genuinely complete lessons.",
            },
            {
              icon: "📭",
              feat: "Zero real money. Ever.",
              why: "No brokerage link, no UPI, no 'upgrade to trade real'. The fake money is the point — skin in the game without risk.",
            },
            {
              icon: "🚫",
              feat: "No streak mechanics",
              why: "No 'come back tomorrow or lose your streak.' No returns leaderboard. Habits are rewarded, not daily engagement.",
            },
          ].map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="grid grid-cols-[2rem_1fr_1fr] px-6 py-5 border-b border-rule/15 last:border-0 gap-6 hover:bg-rule/[0.03] transition-colors group"
            >
              <span className="text-lg mt-0.5" aria-hidden>{row.icon}</span>
              <p className="font-display text-lg font-semibold text-ink">{row.feat}</p>
              <p className="font-body text-sm text-ink/65 leading-relaxed">{row.why}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 — THE STAMP MOMENT (full-bleed drama)
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative border-y border-rule/25 overflow-hidden">
        <div className="absolute inset-0 ledger-bg opacity-60" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-center">
            {/* Giant stamp */}
            <motion.div
              initial={{ scale: 2, opacity: 0, rotate: -12 }}
              whileInView={{ scale: 1, opacity: 1, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
              className="flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-64 sm:w-64" aria-label="Lesson completed stamp">
                {/* Ink bleed SVG filter */}
                <defs>
                  <filter id="ink-hero">
                    <feMorphology in="SourceAlpha" operator="dilate" radius="0.8" result="dilated" />
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
                    <feDisplacementMap in="dilated" in2="noise" scale="2" result="displaced" />
                    <feComposite in="SourceGraphic" in2="displaced" operator="over" />
                  </filter>
                </defs>
                <g filter="url(#ink-hero)">
                  {/* Outer double ring */}
                  <circle cx="100" cy="100" r="88" fill="none" stroke="#8C2F39" strokeWidth="5" />
                  <circle cx="100" cy="100" r="82" fill="none" stroke="#8C2F39" strokeWidth="1.5" />
                  {/* Tick */}
                  <path d="M65 100 L88 124 L136 72" fill="none" stroke="#8C2F39" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Text arc — top */}
                  <path id="topArc" d="M30,100 A70,70 0 0,1 170,100" fill="none" />
                  <text fontFamily="'Fraunces', serif" fontSize="12" fill="#8C2F39" letterSpacing="4">
                    <textPath href="#topArc" startOffset="15%">LESSON COMPLETED</textPath>
                  </text>
                  {/* Text arc — bottom */}
                  <path id="botArc" d="M170,100 A70,70 0 0,1 30,100" fill="none" />
                  <text fontFamily="'IBM Plex Mono', monospace" fontSize="9" fill="#8C2F39" letterSpacing="3">
                    <textPath href="#botArc" startOffset="18%">NIVESHLOOP · SIMULATED</textPath>
                  </text>
                </g>
              </svg>
            </motion.div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">§ 5 — The stamp</p>
              <motion.h2
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="font-display display-lg text-ink mb-5"
              >
                Completion means<br />something here.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="font-body text-base text-ink/70 leading-relaxed max-w-lg"
              >
                When you finish a lesson, a stamp presses onto your passbook —
                slightly tilted, slightly imperfect, the way a real stamp always
                lands. It appears once. It marks the moment you did the reading.
                It never marks a profitable trade.
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 6 — WHAT THIS ISN'T (safety block)
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-24">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-16 items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-4">§ 6 — Honesty</p>
            <h2 className="font-display display-lg text-ink mb-6">
              This is a<br /><span className="text-muted italic">simulator.</span>
            </h2>
            <div className="space-y-4">
              {[
                "Simulated portfolio. Not a brokerage account.",
                "Prices are delayed ~15 minutes. Not real-time.",
                "Nothing here is personalized financial advice.",
                "Insights describe your own past behavior only.",
                "Free, no ads, no upsell. Just free.",
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 py-2 border-b border-rule/15"
                >
                  <span className="font-mono text-stamp/60 mt-0.5 shrink-0 text-lg">—</span>
                  <p className="font-body text-base text-ink/80">{line}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Big CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border border-rule/35 bg-paper p-10 relative overflow-hidden"
            style={{ boxShadow: "8px 8px 0 rgba(92,122,99,0.12)" }}
          >
            {/* Faint passbook lines */}
            <div className="absolute inset-0 ledger-bg opacity-40" />

            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-6">Ready?</p>
              <h3 className="font-display text-5xl font-semibold text-ink leading-[1] mb-6">
                Open your<br />
                <span className="text-stamp">passbook.</span>
              </h3>
              <p className="font-body text-sm text-ink/60 mb-8 max-w-xs">
                ₹1,00,000 in virtual cash. No credit card. No real money, ever.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 bg-stamp text-paper font-body font-semibold text-base px-8 py-4 hover:opacity-90 transition-opacity"
              >
                Start for free →
              </Link>
              <p className="mt-4 font-mono text-[10px] text-muted">
                Simulated · Delayed prices · Not investment advice
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-rule/25 py-10 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <span className="font-display text-ink font-semibold text-base tracking-tight">
            Nivesh<span className="text-stamp">Loop</span>
          </span>
          <p className="font-mono text-[10px] text-muted uppercase tracking-widest max-w-md text-right">
            Simulated portfolio · Prices delayed ~15 min · Educational use only ·
            Not investment advice · Not a brokerage
          </p>
        </div>
      </footer>
    </div>
  );
}
