import { Stamp } from "./Stamp";
import type { Lesson } from "@/types";

interface LessonEntryProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
}

/**
 * One row in the passbook — the ledger line that separates lesson-rows
 * from trade-rows is deliberately invisible. Both types share exactly the
 * same horizontal rhythm: stamp · date/counter · title · action.
 * See docs/DESIGN_SYSTEM.md §"Layout concept".
 */
export function LessonEntry({ lesson, completed, locked }: LessonEntryProps) {
  return (
    <div
      className={[
        "flex items-center gap-4 border-b border-rule/20 py-4 px-1 group",
        locked ? "opacity-40 pointer-events-none select-none" : "",
      ].join(" ")}
    >
      {/* The only use of the Stamp: a lesson genuinely completed */}
      <Stamp label={lesson.title} earned={completed} animateOnMount={completed} />

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
        ) : !completed ? (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">
            Not yet completed
          </p>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-widest text-gain mt-0.5">
            Completed ✓
          </p>
        )}
      </div>

      {/* Action link — only if available */}
      {!locked && !completed && (
        <a
          href={`/lessons/${lesson.slug}`}
          className="font-mono text-xs uppercase tracking-widest text-stamp hover:text-stamp/70 transition-colors shrink-0 group-hover:translate-x-0.5 transition-transform"
        >
          Start →
        </a>
      )}

      {!locked && completed && (
        <a
          href={`/lessons/${lesson.slug}`}
          className="font-mono text-[10px] uppercase tracking-widest text-muted hover:text-ink transition-colors shrink-0"
          aria-label={`Review ${lesson.title}`}
        >
          Review
        </a>
      )}
    </div>
  );
}
