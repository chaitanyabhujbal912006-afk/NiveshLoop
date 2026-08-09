"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp } from "./Stamp";
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

  return (
    <div className="min-h-screen bg-paper">
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <div className="border-b border-rule/25 sticky top-0 z-20 bg-paper/95 backdrop-blur-[2px]">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 h-12 flex items-center justify-between">
          <Link
            href="/lessons"
            className="font-mono text-xs text-muted hover:text-ink transition-colors uppercase tracking-widest"
          >
            ← Lessons
          </Link>
          <span className="font-mono text-xs tabular-nums text-muted">
            Lesson {lesson.orderIndex} of {totalLessons}
          </span>
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
        <article className={isLocked ? "opacity-40 pointer-events-none select-none" : ""}>
          {/* Meta header */}
          <div className="mb-8 pb-4 border-b border-rule/20">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
              Lesson {lesson.orderIndex}
              {lesson.unlocksAction && (
                <> · Unlocks: {unlocksDisplayName[lesson.unlocksAction] ?? lesson.unlocksAction.replace(/_/g, " ")}</>
              )}
            </p>
          </div>

          <div className="prose-like">
            {renderMarkdown(lesson.bodyMd)}
          </div>
        </article>

        {/* ── Completion block ────────────────────────────────────────── */}
        {!isLocked && (
          <div className="mt-12 border-t border-rule/25 pt-8">
            <AnimatePresence mode="wait">
              {justCompleted ? (
                <motion.div
                  key="just-done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Stamp press moment */}
                  <div className="flex items-center gap-5">
                    <Stamp label={lesson.title} earned size="lg" animateOnMount />
                    <div>
                      <p className="font-display text-2xl font-semibold text-ink mb-0.5">
                        Lesson complete.
                      </p>
                      <p className="font-mono text-xs text-muted uppercase tracking-widest">
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
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="bg-stamp text-paper px-8 py-3.5 font-body font-semibold text-base hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {completing ? "Recording…" : "Mark as complete →"}
                    </button>
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest self-center">
                      {lesson.unlocksAction
                        ? `Completes to unlock: ${unlocksDisplayName[lesson.unlocksAction] ?? lesson.unlocksAction}`
                        : "No unlock — sets up a later lesson"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Prev/next navigation */}
        {!isLocked && (
          <div className="mt-8 pt-6 border-t border-rule/20 flex justify-between gap-4">
            {prev ? (
              <Link
                href={`/lessons/${prev.slug}`}
                className="font-mono text-xs text-muted hover:text-ink transition-colors"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && !justCompleted && (
              <Link
                href={`/lessons/${next.slug}`}
                className="font-mono text-xs text-muted hover:text-ink transition-colors"
              >
                {next.title} →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
