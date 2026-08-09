import { Stamp } from "./Stamp";
import type { Lesson } from "@/types";

interface LessonEntryProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
}

/**
 * One row in the passbook. Lessons and trades share this same visual rhythm
 * deliberately (see docs/DESIGN_SYSTEM.md "Layout concept") — this is what
 * makes the dashboard read as one continuous ledger instead of two glued-
 * together features.
 */
export function LessonEntry({ lesson, completed, locked }: LessonEntryProps) {
  return (
    <div
      className={[
        "flex items-center gap-4 border-b border-rule/25 py-4 px-1",
        locked ? "opacity-40" : "",
      ].join(" ")}
    >
      <Stamp label={lesson.title} earned={completed} />

      <div className="flex-1 min-w-0">
        <p className="font-display text-lg text-ink truncate">{lesson.title}</p>
        {locked && (
          <p className="font-body text-sm text-muted">Complete the previous lesson to unlock</p>
        )}
      </div>

      {!locked && !completed && (
        <a
          href={`/lessons/${lesson.slug}`}
          className="font-body text-sm font-medium text-stamp hover:underline shrink-0"
        >
          Start →
        </a>
      )}
    </div>
  );
}
