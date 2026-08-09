"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Stamp } from "@/components/Stamp";

// ─── Static passbook entries to animate in ───────────────────────────────────
const PASSBOOK_ENTRIES = [
  { date: "Day 1",  type: "lesson",  text: "Lesson — What is a stock?",          stamped: true,  amount: null,       negative: false },
  { date: "Day 1",  type: "trade",   text: "Bought 5 × TCS.NS",                  stamped: false, amount: "−₹19,275", negative: true  },
  { date: "Day 6",  type: "lesson",  text: "Lesson — Stop-losses",                stamped: true,  amount: null,       negative: false },
  { date: "Day 7",  type: "trade",   text: "Bought 2 × INFY.NS  · stop-loss set", stamped: false, amount: "−₹28,440", negative: true  },
  { date: "Day 14", type: "trade",   text: "Sold 3 × TCS.NS",                    stamped: false, amount: "+₹11,730", negative: false },
  { date: "Day 14", type: "insight", text: "Reflection — 3 fast exits noticed",  stamped: false, amount: null,       negative: false, muted: true },
  { date: "Day 20", type: "lesson",  text: "Lesson — Diversification",            stamped: true,  amount: null,       negative: false },
];

function PassbookRow({
  date, type, text, stamped, amount, negative, muted = false, delay = 0,
}: {
  date: string; type: string; text: string; stamped: boolean;
  amount: string | null; negative: boolean; muted?: boolean; delay?: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b border-rule/15 last:border-b-0"
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0, 0.2, 1] }}
    >
      {type === "lesson" ? (
        <Stamp label={text} earned={stamped} size="sm" animateOnMount />
      ) : (
        <span className="w-9 h-9 shrink-0 flex items-center justify-center">
          <span className={`h-2 w-2 rounded-full ${type === "trade" ? "bg-rule/50" : "bg-muted/30"}`} />
        </span>
      )}

      <span className="font-mono text-xs text-muted w-12 sm:w-14 shrink-0">{date}</span>

      <span className={`font-body text-sm flex-1 min-w-0 truncate ${muted ? "text-muted" : "text-ink"}`}>
        {text}
      </span>

      {amount && (
        <span className={`font-mono tabular-nums text-sm shrink-0 ${negative ? "text-loss" : "text-gain"}`}>
          {amount}
        </span>
      )}
    </motion.div>
  );
}

// ─── Animated stats ticker ───────────────────────────────────────────────────
const STATS = [
  { label: "Starting cash", value: "₹1,00,000" },
  { label: "Lessons", value: "15" },
  { label: "Real money", value: "₹0" },
  { label: "Your pace", value: "∞" },
];

// ─── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "📖",
    title: "Lesson, then action",
    body: "Every lesson ends with a real trade in your simulated portfolio — not a quiz, a trade. The doing is the learning.",
  },
  {
    icon: "🔐",
    title: "Unlocks that mean something",
    body: "Completing the stop-loss lesson actually adds a stop-loss field to your trade form. The UI changes as you learn.",
  },
  {
    icon: "🪞",
    title: "Your behavior, reflected back",
    body: "After a few trades, we show you the patterns in how you're actually investing — panic exits, concentration, chasing spikes.",
  },
  {
    icon: "⚖️",
    title: "Friction as respect",
    body: "If you try to sell during a sharp drop, a 10-second pause screen appears — not a block, just a held breath. Your choice, always.",
  },
];

export default function HomePage() {
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 60]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-[92vh] flex flex-col justify-center px-6 sm:px-10 max-w-6xl mx-auto pt-20 pb-16"
      >
        {/* Nav */}
        <div className="absolute top-0 inset-x-0 px-6 sm:px-10 pt-6 flex justify-between items-center">
          <span className="font-display text-ink font-semibold text-lg tracking-tight">
            Nivesh<span className="text-stamp">Loop</span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-body text-sm text-muted hover:text-ink transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="font-body text-sm font-medium bg-stamp text-paper px-4 py-2 rounded-sm hover:opacity-90 transition-opacity"
            >
              Open passbook
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-start">
          {/* Left: headline */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-mono text-xs uppercase tracking-[0.25em] text-muted mb-8"
            >
              Free · No ads · Simulated money only
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display font-semibold text-[2.6rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.08] text-ink mb-8"
            >
              The only investing
              <br />
              app that{" "}
              <em className="not-italic relative inline-block">
                <span className="relative z-10 text-stamp">makes you trade</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M0,4 Q50,0 100,4 Q150,8 200,2"
                    fill="none"
                    stroke="#8C2F39"
                    strokeWidth="2.5"
                    opacity="0.6"
                    strokeLinecap="round"
                  />
                </svg>
              </em>
              <br />
              to teach you.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="font-body text-lg text-ink/70 leading-relaxed mb-10 max-w-lg"
            >
              Every lesson ends with a real simulated trade. Every few trades,
              we hand the passbook back and show you the pattern in how
              you&rsquo;re actually investing — not just your returns.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-stamp text-paper px-8 py-3.5 rounded-sm font-body font-medium hover:opacity-90 active:scale-[0.99] transition-all duration-100 text-base"
              >
                Open your passbook
                <span className="font-mono text-sm opacity-75">₹1,00,000 free</span>
              </Link>

              <Link
                href="#how"
                className="inline-flex items-center justify-center gap-2 border border-rule/40 text-ink px-6 py-3.5 rounded-sm font-body font-medium hover:border-rule/70 transition-colors text-sm"
              >
                See how it works
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={visible ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-6 mt-10 pt-6 border-t border-rule/20"
            >
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-mono text-xs text-muted uppercase tracking-widest mb-0.5">{s.label}</span>
                  <span className="font-mono tabular-nums text-xl font-medium text-ink">{s.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: live passbook demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={visible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:sticky lg:top-24"
          >
            <div className="border border-rule/35 rounded-sm overflow-hidden bg-paper shadow-[0_4px_32px_rgba(30,42,68,0.06)]">
              {/* Passbook header */}
              <div className="px-5 py-3.5 border-b border-rule/30 flex justify-between items-center bg-rule/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-rule/50" />
                  <span className="font-display text-sm text-ink font-medium">Your passbook</span>
                </div>
                <span className="font-mono text-xs text-muted">Page 1 / ∞</span>
              </div>

              {/* Column headers */}
              <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2 border-b border-rule/20 bg-rule/[0.02]">
                <span className="w-9 shrink-0" />
                <span className="font-mono text-[10px] text-muted w-12 sm:w-14 shrink-0 uppercase tracking-widest">Date</span>
                <span className="font-mono text-[10px] text-muted flex-1 uppercase tracking-widest">Entry</span>
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">Amount</span>
              </div>

              {/* Entries */}
              {PASSBOOK_ENTRIES.map((entry, i) => (
                <PassbookRow key={i} {...entry} delay={i * 0.08} />
              ))}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-rule/20 flex justify-between items-center bg-rule/[0.02]">
                <span className="font-mono text-xs text-muted">Simulated portfolio · prices delayed ~15 min</span>
                <span className="font-mono tabular-nums text-xs text-ink">
                  ₹52,015 <span className="text-muted">remaining</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── DIVIDER ───────────────────────────────────────────────────────── */}
      <div className="relative h-px mx-6 sm:mx-10 max-w-6xl mx-auto">
        <div className="absolute inset-0 bg-rule/20" />
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-rule/40 to-transparent"
          aria-hidden
        />
      </div>

      {/* ── THE PROBLEM ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-6"
        >
          The problem
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-10 items-start">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-[1.1]"
          >
            Reading about investing doesn&rsquo;t teach you to invest.
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                tag: "Articles & videos",
                text: "Excellent for theory. They explain concepts clearly. But once you close the tab, you have no idea what you&rsquo;d actually do with real money.",
              },
              {
                tag: "Paper-trading apps",
                text: "Trade simulation without context. You can buy and sell, but nothing explains why — and nothing connects the trade back to the lesson you just finished.",
              },
              {
                tag: "Nothing",
                text: "Most people never start. The gap between learning and doing is too wide.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border-l-2 border-rule/30 pl-4"
              >
                <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">{item.tag}</p>
                <p className="font-body text-base text-ink/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.text }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="bg-ink text-paper py-24 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40 mb-6"
          >
            How it works
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-semibold text-paper leading-[1.1] mb-16"
          >
            One continuous loop.
          </motion.h2>

          {/* Loop steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            {[
              {
                step: "01",
                title: "Learn",
                body: "A short, focused lesson. Not a video. Not an article. A screen you can read in 4 minutes.",
                accent: "rule",
              },
              {
                step: "02",
                title: "Simulate",
                body: "Immediately do what the lesson described — buy or sell in a ₹1,00,000 fake-money portfolio, against real delayed prices.",
                accent: "stamp",
              },
              {
                step: "03",
                title: "Reflect",
                body: "After a handful of trades, we hand the passbook back. Plain-language patterns. Never advice — just your own behavior described back to you.",
                accent: "gain",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={[
                  "py-10 px-8 border-rule/20",
                  i < 2 ? "sm:border-r" : "",
                ].join(" ")}
              >
                <p className="font-mono text-4xl font-medium text-paper/10 mb-6 tabular-nums">{s.step}</p>
                <p
                  className={`font-display text-2xl font-semibold mb-3 ${
                    s.accent === "stamp" ? "text-stamp" : s.accent === "gain" ? "text-gain" : "text-rule"
                  }`}
                >
                  {s.title}
                </p>
                <p className="font-body text-sm text-paper/65 leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Arrow indicating loop */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <span className="font-mono text-xs text-paper/30 tracking-widest">↺ then back to Learn</span>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-6"
        >
          What makes it different
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px border border-rule/25 rounded-sm overflow-hidden bg-rule/10">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-paper p-8"
            >
              <span className="text-2xl mb-4 block" aria-hidden>{f.icon}</span>
              <p className="font-display text-xl font-semibold text-ink mb-3">{f.title}</p>
              <p className="font-body text-sm text-ink/70 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── THE STAMP MOMENT ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <div className="border border-rule/30 rounded-sm p-8 sm:p-12 bg-paper/60 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-center">
          <motion.div
            initial={{ scale: 1.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, ease: [0.25, 0, 0, 1] }}
          >
            <Stamp label="Lesson completed" earned size="lg" animateOnMount />
          </motion.div>

          <div>
            <p className="font-display text-3xl font-semibold text-ink mb-3">
              Completion means something.
            </p>
            <p className="font-body text-base text-ink/70 leading-relaxed max-w-lg">
              When you finish a lesson, a stamp presses onto your passbook — slightly tilted,
              slightly imperfect, the way a real stamp always lands. It appears once, on the
              moment you earn it. It never decorates anything; it never marks a profitable trade.
              It marks that you did the reading.
            </p>
          </div>
        </div>
      </section>

      {/* ── SAFETY / WHAT THIS ISN'T ─────────────────────────────────────── */}
      <section className="border-t border-rule/20 py-20 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted mb-6">
              What this isn&rsquo;t
            </p>
            <div className="space-y-4 mb-12">
              {[
                "Not real money. Not a brokerage account.",
                "Not investment advice. Insights describe your own past behavior only.",
                "Not real-time prices. Delayed data, clearly labeled.",
                "Not free because there's an upsell. Just free.",
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="font-mono text-rule/50 mt-0.5 shrink-0">—</span>
                  <p className="font-body text-base text-ink/80">{line}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 sm:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="font-display text-5xl sm:text-6xl font-semibold text-ink leading-[1.05] mb-6">
            Open your<br />
            <span className="text-stamp">passbook.</span>
          </h2>
          <p className="font-body text-lg text-ink/65 mb-10">
            ₹1,00,000 in virtual cash. No credit card. No real money at risk. Ever.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 bg-stamp text-paper px-10 py-4 rounded-sm font-body font-medium text-lg hover:opacity-90 active:scale-[0.99] transition-all duration-100"
          >
            Start for free
          </Link>
          <p className="mt-8 font-body text-xs text-muted">
            Simulated portfolio only. Prices delayed ~15 minutes. Not investment advice.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
