"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp } from "./Stamp";
import type { Lesson } from "@/types";

const LESSON_ICONS: Record<number, string> = {
  1: "📈", 2: "🏦", 3: "📋", 4: "⚡", 5: "🛡️",
  6: "🕯️", 7: "🧮", 8: "🧠", 9: "🌐", 10: "📰",
  11: "💼", 12: "⏳", 13: "👁️", 14: "🔮", 15: "🏆",
};

interface LessonState {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  unlocksLabel?: string;
}

interface Props {
  lessonStates: LessonState[];
  totalCompleted: number;
  totalLessons: number;
}

function ProgressRing({ completed, total, size = 80 }: { completed: number; total: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : completed / total;
  const dash = pct * circ;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(92,122,99,0.15)" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={pct === 1 ? "#8C2F39" : "#2F6B4F"}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="IBM Plex Mono" fontSize="13" fontWeight="600" fill="#1E2A44">
        {completed}
      </text>
      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="IBM Plex Mono" fontSize="7" fill="rgba(30,42,68,0.45)">
        /{total}
      </text>
    </svg>
  );
}

export function LessonsClientView({ lessonStates, totalCompleted, totalLessons }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const pctDone = totalLessons === 0 ? 0 : (totalCompleted / totalLessons) * 100;
  const nextUnlocked = lessonStates.find(s => !s.completed && !s.locked);

  return (
    <div className="min-h-screen bg-parchment-base grid-bg bg-grid-pattern relative overflow-x-hidden">
      {/* Rotated Background Watermark */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 z-0 text-watermark font-display pointer-events-none select-none">
        पाठ्यक्रम
      </div>

      {/* ══ HERO HEADER ══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-b border-rule/25 bg-ink shadow-2xl">
        {/* Ledger lines on dark */}
        <div className="absolute inset-0"
          style={{ backgroundImage: "repeating-linear-gradient(transparent,transparent 47px,rgba(92,122,99,0.06) 47px,rgba(92,122,99,0.06) 48px)" }}
        />
        {/* Ambient mesh background */}
        <div className="absolute inset-0 mesh-dark opacity-80" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06] dotgrid-bg pointer-events-none" />
        {/* Stamp spine */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-stamp via-stamp/80 to-stamp" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 py-12">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <Link href="/dashboard" className="font-mono text-[10px] font-bold uppercase tracking-widest text-paper/60 hover:text-paper transition-colors bg-white/10 px-2.5 py-1 rounded-xs border border-white/10">
                  ← Dashboard
                </Link>
                <span className="text-paper/30">·</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/40 font-semibold">
                  NiveshLoop Curriculum
                </span>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-display text-4xl sm:text-5xl font-semibold text-paper leading-[1.0] mb-4"
              >
                Your<br />
                <span className="text-stamp italic drop-shadow-xs">learning path.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-body text-sm text-paper/65 max-w-md leading-relaxed"
              >
                15 interactive lessons. Each one connects directly to a simulated trade. Complete them in order — every lesson unlocks a real tool in your portfolio.
              </motion.p>
            </div>

            {/* Progress ring + stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="hidden sm:flex flex-col items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-sm backdrop-blur-md shadow-xl"
            >
              <ProgressRing completed={totalCompleted} total={totalLessons} size={90} />
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-paper/60 text-center">
                {pctDone.toFixed(0)}% Mastered
              </p>
            </motion.div>
          </div>

          {/* Wide progress bar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white/5 p-4 rounded-xs border border-white/10"
          >
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-paper/50 font-bold">Overall Progress</span>
              <span className="font-mono text-[10px] tabular-nums text-paper/70 font-semibold">
                {totalCompleted} of {totalLessons} Lessons Stamped
              </span>
            </div>
            <div className="h-2 bg-paper/15 rounded-full overflow-hidden p-0.5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: pctDone === 100 ? "#8C2F39" : "#2F6B4F" }}
                initial={{ width: 0 }}
                animate={{ width: `${pctDone}%` }}
                transition={{ duration: 1, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
          </motion.div>

          {/* Next up CTA */}
          {nextUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-5 flex items-center gap-3 bg-stamp/20 border border-stamp/40 px-4 py-2 rounded-xs"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest text-paper/60 font-bold">Up Next →</span>
              <Link
                href={`/lessons/${nextUnlocked.lesson.slug}`}
                className="font-mono text-xs text-paper font-bold hover:underline"
              >
                Lesson {nextUnlocked.lesson.orderIndex}: {nextUnlocked.lesson.title}
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      {/* ══ LESSON CARDS ═════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

        {/* Grid of lesson cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonStates.map(({ lesson, completed, locked, unlocksLabel }, idx) => {
            const icon = LESSON_ICONS[lesson.orderIndex] ?? "📚";
            const isNext = !completed && !locked && lessonStates.slice(0, idx).every(s => s.completed);

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative"
              >
                {/* "NEXT" badge */}
                {isNext && (
                  <div className="absolute -top-2.5 -right-2 z-20 bg-stamp text-paper font-mono text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-xs font-extrabold shadow-md glow-border-stamp">
                    Up Next
                  </div>
                )}

                <Link
                  href={locked ? "/lessons" : `/lessons/${lesson.slug}`}
                  className={[
                    "block border-2 rounded-xs p-5 transition-all duration-200 relative overflow-hidden deep-shadow",
                    locked
                      ? "border-ink/20 bg-paper/60 cursor-not-allowed opacity-60"
                      : completed
                      ? "border-gain bg-paper hover:-translate-y-1"
                      : isNext
                      ? "border-stamp bg-paper shadow-lg hover:-translate-y-1 font-semibold"
                      : "border-ink bg-paper hover:-translate-y-1",
                  ].join(" ")}
                >
                  {/* Completed green tint bar */}
                  {completed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gain" />
                  )}
                  {isNext && !completed && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-stamp" />
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none" aria-hidden>{icon}</span>
                      <span className="font-mono text-[9.5px] uppercase font-bold tracking-widest text-muted tabular-nums">
                        L-{String(lesson.orderIndex).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      {locked ? (
                        <span className="font-mono text-[10px] text-muted/50">🔒</span>
                      ) : completed ? (
                        <Stamp label={lesson.title} earned size="sm" animateOnMount={false} />
                      ) : (
                        <span className="font-mono text-[10px] text-stamp font-bold">○</span>
                      )}
                    </div>
                  </div>

                  <p className={[
                    "font-display text-base font-semibold leading-snug mb-2",
                    locked ? "text-muted/60" : "text-ink",
                  ].join(" ")}>
                    {lesson.title}
                  </p>

                  {unlocksLabel && !locked && (
                    <div className="flex items-center gap-1.5 mt-2 bg-rule/5 px-2 py-1 rounded-xs border border-rule/15">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-muted font-semibold">Unlocks</span>
                      <span className="font-mono text-[8px] text-stamp font-bold uppercase tracking-widest truncate">
                        {unlocksLabel}
                      </span>
                    </div>
                  )}

                  {/* Status row */}
                  <div className="mt-4 pt-3 border-t border-rule/15 flex items-center justify-between">
                    {completed ? (
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gain flex items-center gap-1">
                        ✓ Stamped
                      </span>
                    ) : locked ? (
                      <span className="font-mono text-[9px] text-muted/50">Locked</span>
                    ) : (
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-stamp">
                        {isNext ? "Start Lesson →" : "Available"}
                      </span>
                    )}
                    <span className="font-mono text-[8.5px] text-muted/60 tabular-nums">~4 min read</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer disclaimer */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 border border-rule/30 bg-paper/90 p-5 rounded-xs shadow-sm flex items-start gap-3"
        >
          <span className="font-mono text-stamp font-bold text-lg mt-0.5">—</span>
          <p className="font-body text-xs text-ink/75 leading-relaxed">
            NiveshLoop lessons connect theory straight to simulated order forms.
            Educational portfolio simulation · Delayed prices ~15 min · Zero real money.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

