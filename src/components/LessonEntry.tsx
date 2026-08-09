"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Stamp } from "./Stamp";
import type { Lesson } from "@/types";

interface LessonEntryProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  unlocksLabel?: string;
}

/**
 * One row in the lessons list passbook.
 * Shares the same horizontal rhythm as trade rows (stamp · index · title · action).
 * See docs/DESIGN_SYSTEM.md §"Layout concept".
 */
export function LessonEntry({ lesson, completed, locked, unlocksLabel }: LessonEntryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={[
        "flex items-center gap-4 py-4 px-1 group",
        locked ? "opacity-40" : "",
      ].join(" ")}
    >
      {/* Stamp or pending circle */}
      <div className="shrink-0">
        <Stamp label={lesson.title} earned={completed} animateOnMount={completed} />
      </div>

      {/* Order number */}
      <span className="font-mono text-xs tabular-nums text-muted/60 w-5 shrink-0 text-right">
        {lesson.orderIndex}
      </span>

      {/* Title + unlock label */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            "font-display text-base leading-snug",
            completed ? "text-ink" : locked ? "text-muted" : "text-ink",
          ].join(" ")}
        >
          {lesson.title}
        </p>
        {locked ? (
          <p className="font-body text-xs text-muted mt-0.5">
            Complete the previous lesson to unlock
          </p>
        ) : completed ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-gain mt-0.5">
            Done ✓{unlocksLabel ? ` · Unlocked: ${unlocksLabel}` : ""}
          </p>
        ) : (
          unlocksLabel && (
            <p className="font-mono text-[10px] text-muted mt-0.5">
              Unlocks: {unlocksLabel}
            </p>
          )
        )}
      </div>

      {/* Action */}
      <div className="shrink-0">
        {!locked && !completed && (
          <a
            href={`/lessons/${lesson.slug}`}
            className="font-mono text-xs uppercase tracking-widest text-stamp hover:text-stamp/70 transition-colors group-hover:translate-x-0.5 inline-block transition-transform"
          >
            Start →
          </a>
        )}
        {!locked && completed && (
          <a
            href={`/lessons/${lesson.slug}`}
            className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-ink transition-colors"
          >
            Review
          </a>
        )}
      </div>
    </motion.div>
  );
}
