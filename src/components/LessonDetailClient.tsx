"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Stamp } from "./Stamp";
import { PriceChart } from "./PriceChart";
import type { Lesson } from "@/types";

interface Props {
  lesson: Lesson;
  isCompleted: boolean;
  isLocked: boolean;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  totalLessons: number;
}

/**
 * Client component for the lesson detail page.
 * Handles the "Mark as complete" button, calls the API, and shows
 * the stamp animation + unlock announcement inline.
 *
 * The router.refresh() after completion causes the server to re-fetch
 * completedSlugs — so the dashboard/TradeTicket pick up the new unlock
 * automatically on next visit, no manual flag-flipping.
 */
export function LessonDetailClient({
  lesson,
  isCompleted: initialCompleted,
  isLocked,
  prev,
  next,
  totalLessons,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [unlockedAction, setUnlockedAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrolled = Math.max(0, windowH - top);
      setReadProgress(Math.min(1, scrolled / height));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleComplete() {
    if (completed || completing) return;
    setCompleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to complete lesson");

      setCompleted(true);
      setJustCompleted(true);
      setUnlockedAction(json.completedLesson?.unlocksAction ?? null);

      // Invalidate the server cache so dashboard picks up the new slug
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCompleting(false);
    }
  }

  // Render markdown-ish: headings, bold, italic, paragraphs, code, horizontal rules
  // Simple render without adding a markdown dependency
  function renderMarkdown(md: string) {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={key++} className="font-display text-3xl font-semibold text-ink mb-4 mt-8 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={key++} className="font-display text-xl font-semibold text-ink mb-3 mt-8">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={key++} className="font-display text-lg font-semibold text-ink mb-2 mt-6">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("---")) {
        elements.push(<hr key={key++} className="border-rule/20 my-8" />);
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote
            key={key++}
            className="border-l-2 border-stamp/60 pl-4 my-4 text-sm font-body text-ink/70 italic"
          >
            {line.slice(2)}
          </blockquote>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={key++} className="font-body text-base text-ink/80 ml-4 mb-1 list-disc">
            {inlineRender(line.slice(2))}
          </li>
        );
      } else if (line.match(/^- \[[ x]\]/)) {
        const checked = line.includes("[x]");
        elements.push(
          <li key={key++} className="font-body text-base text-ink/70 ml-4 mb-1 flex items-start gap-2 list-none">
            <span className={`mt-1 h-3.5 w-3.5 border rounded-sm shrink-0 ${checked ? "bg-gain border-gain" : "border-rule/40"}`} />
            {inlineRender(line.replace(/^- \[[ x]\] /, ""))}
          </li>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={key++} className="h-3" />);
      } else {
        elements.push(
          <p key={key++} className="font-body text-base text-ink/85 leading-relaxed mb-0">
            {inlineRender(line)}
          </p>
        );
      }
    }

    return elements;
  }

  function inlineRender(text: string): React.ReactNode {
    // Handle **bold**, *italic*, `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="font-mono text-sm bg-rule/10 px-1 py-0.5 rounded-sm text-ink">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  const unlocksDisplayName: Record<string, string> = {
    first_trade: "Trading ticket",
    limit_order_option: "Limit orders",
    concentration_nudge: "Concentration warning",
    stop_loss_nudge: "Stop-loss field on buy orders",
    chart_view: "Candlestick charts",
    index_fund_tagging: "Index funds in search",
    insights_panel: "Behavioral insights panel",
    cooldown_nudge: "Cooldown pause on sell",
    news_tab: "Financial news tab",
    fee_simulation: "Brokerage fee simulation",
    holding_period_stamp: "Holding-period stamps",
    watchlist: "Watchlist feature",
    insights_panel_v2: "Upgraded insights panel",
  };

  const LESSON_ICONS: Record<number, string> = {
    1: "📈", 2: "🏦", 3: "📋", 4: "⚡", 5: "🛡️",
    6: "🕯️", 7: "🧮", 8: "🧠", 9: "🌐", 10: "📰",
    11: "💼", 12: "⏳", 13: "👁️", 14: "🔮", 15: "🏆",
  };
  const icon = LESSON_ICONS[lesson.orderIndex] ?? "📚";

  return (
    <div className="min-h-screen bg-parchment-base grid-bg bg-grid-pattern relative overflow-x-hidden">
      {/* Background watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 z-0 text-watermark font-display pointer-events-none select-none">
        ज्ञान
      </div>

      {/* ── Reading progress bar ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-rule/10">
        <motion.div
          className="h-full bg-stamp"
          style={{ width: `${readProgress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <div className="relative bg-ink overflow-hidden">
        {/* Ledger lines */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(transparent,transparent 47px,rgba(92,122,99,0.06) 47px,rgba(92,122,99,0.06) 48px)" }}
        />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(92,122,99,1) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-stamp/80" />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-8">
          {/* Nav */}
          <div className="h-12 flex items-center justify-between">
            <Link href="/lessons"
              className="font-mono text-xs text-paper/40 hover:text-paper/70 transition-colors uppercase tracking-widest"
            >
              ← Lessons
            </Link>
            <span className="font-mono text-xs tabular-nums text-paper/30">
              {lesson.orderIndex} / {totalLessons}
            </span>
          </div>

          {/* Hero content */}
          <div className="py-8 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 mb-4"
            >
              <span className="text-3xl" aria-hidden>{icon}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-paper/35">
                Lesson {String(lesson.orderIndex).padStart(2, "0")}
                {lesson.unlocksAction && (
                  <> · Unlocks {unlocksDisplayName[lesson.unlocksAction] ?? lesson.unlocksAction.replace(/_/g, " ")}</>
                )}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="font-display text-3xl sm:text-4xl font-semibold text-paper leading-[1.05] mb-4"
            >
              {lesson.title}
            </motion.h1>

            {/* Lesson meta pills */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="font-mono text-[9px] uppercase tracking-widest text-paper/30 border border-paper/15 px-2 py-1">~4 min read</span>
              {completed && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-gain/80 border border-gain/25 px-2 py-1">
                  ✓ Completed
                </span>
              )}
              {!completed && !isLocked && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-stamp/70 border border-stamp/25 px-2 py-1">
                  Available
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Lesson body ───────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
        {/* Locked state */}
        {isLocked && (
          <div className="border border-rule/30 p-6 mb-8 text-center">
            <p className="font-display text-lg text-ink mb-1">Lesson locked</p>
            <p className="font-body text-sm text-muted mb-4">
              Complete the previous lesson to access this one.
            </p>
            <Link
              href="/lessons"
              className="font-mono text-xs text-stamp border border-stamp/30 px-4 py-2 hover:bg-stamp hover:text-paper transition-colors"
            >
              ← Back to lessons
            </Link>
          </div>
        )}

        {/* Lesson content */}
        <motion.article
          ref={articleRef}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={[
            "relative",
            isLocked ? "opacity-30 pointer-events-none select-none" : "",
          ].join(" ")}
        >
          {/* Passbook left rule */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rule/20 -ml-6 hidden sm:block" aria-hidden />

          <div className="prose-like pl-0">
            {renderMarkdown(lesson.bodyMd)}

            {lesson.slug === "reading-a-candlestick" && (
              <div className="mt-8 border border-rule/30 rounded-sm p-4 bg-rule/[0.02]">
                <p className="font-display text-sm font-semibold text-ink mb-2">
                  Interactive Practice: Reading Candlesticks
                </p>
                <PriceChart symbol="RELIANCE.NS" currentPrice={2950} isCandlestickUnlocked={true} />
              </div>
            )}
          </div>
        </motion.article>

        {/* ── Completion block ──────────────────────────────────────── */}
        {!isLocked && (
          <div className="mt-12">
            {/* Thick divider */}
            <div className="border-t-2 border-rule/25 mb-8" />

            <AnimatePresence mode="wait">
              {justCompleted ? (
                <motion.div
                  key="just-done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* STAMP — full dramatic moment */}
                  <div className="bg-ink border border-rule/20 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0"
                      style={{ backgroundImage: "repeating-linear-gradient(transparent,transparent 47px,rgba(92,122,99,0.06) 47px,rgba(92,122,99,0.06) 48px)" }}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stamp" />
                    <div className="relative">
                      <div className="flex justify-center mb-4">
                        <Stamp label={lesson.title} earned size="lg" animateOnMount />
                      </div>
                      <p className="font-display text-2xl font-semibold text-paper mb-1">Lesson complete.</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-paper/40">
                        Stamped in your passbook
                      </p>
                    </div>
                  </div>

                  {/* Unlock announcement */}
                  {unlockedAction && unlocksDisplayName[unlockedAction] && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="border-l-2 border-gain pl-4 py-2"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-gain mb-0.5">
                        Unlocked
                      </p>
                      <p className="font-display text-lg font-semibold text-ink">
                        {unlocksDisplayName[unlockedAction]}
                      </p>
                      <p className="font-body text-sm text-ink/60 mt-0.5">
                        Go to your trade form to see the difference.
                      </p>
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {next && (
                      <Link
                        href={`/lessons/${next.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-stamp text-paper py-3 font-body font-medium text-sm hover:opacity-90 transition-opacity"
                      >
                        Next: {next.title} →
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className="flex-1 flex items-center justify-center gap-2 border border-rule/35 text-ink py-3 font-body text-sm hover:border-rule/60 transition-colors"
                    >
                      ← Back to dashboard
                    </Link>
                  </div>
                </motion.div>
              ) : completed ? (
                <motion.div
                  key="already-done"
                  className="flex items-center gap-4"
                >
                  <Stamp label={lesson.title} earned />
                  <div>
                    <p className="font-mono text-xs text-gain uppercase tracking-widest mb-0.5">Already completed</p>
                    {next && (
                      <Link
                        href={`/lessons/${next.slug}`}
                        className="font-display text-base font-semibold text-stamp hover:opacity-70 transition-opacity"
                      >
                        Next: {next.title} →
                      </Link>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="complete-btn">
                  {error && (
                    <p className="font-mono text-xs text-loss border-l-2 border-loss pl-3 mb-4">
                      {error}
                    </p>
                  )}
                  {/* CTA block */}
                  <div className="bg-rule/[0.04] border border-rule/25 p-6">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
                      Ready to continue?
                    </p>
                    <p className="font-display text-lg font-semibold text-ink mb-4">
                      {lesson.unlocksAction
                        ? `Mark as done to unlock: ${unlocksDisplayName[lesson.unlocksAction] ?? lesson.unlocksAction}`
                        : "Mark as done to progress"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="inline-flex items-center gap-3 bg-stamp text-paper px-8 py-4 font-body font-semibold text-base hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                      >
                        {completing ? (
                          <span className="live-pulse">Recording…</span>
                        ) : (
                          <>Mark as complete →</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Prev/next navigation */}
        {!isLocked && (
          <div className="mt-10 grid grid-cols-2 gap-3">
            {prev ? (
              <Link
                href={`/lessons/${prev.slug}`}
                className="border border-rule/25 bg-paper p-4 hover:border-rule/50 transition-colors group"
              >
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">← Previous</p>
                <p className="font-display text-sm font-semibold text-ink group-hover:text-stamp transition-colors truncate">{prev.title}</p>
              </Link>
            ) : <div />}
            {next && !justCompleted ? (
              <Link
                href={`/lessons/${next.slug}`}
                className="border border-rule/25 bg-paper p-4 hover:border-rule/50 transition-colors group text-right"
              >
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Next →</p>
                <p className="font-display text-sm font-semibold text-ink group-hover:text-stamp transition-colors truncate">{next.title}</p>
              </Link>
            ) : <div />}
          </div>
        )}
      </main>
    </div>
  );
}
