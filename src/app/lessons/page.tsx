import { redirect } from "next/navigation";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { LessonEntry } from "@/components/LessonEntry";
import Link from "next/link";
import type { Lesson } from "@/types";

export const revalidate = 0;

/**
 * /lessons — full sequential list of all lessons with locked/unlocked/completed state.
 * Unlocking is strictly sequential: each lesson requires the previous one to be done.
 * Exception: lesson 1 (order_index=1) is always accessible.
 *
 * @see docs/LOGIC.md §1
 */
export default async function LessonsPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = supabaseAdmin();

  // Fetch all lessons ordered
  const { data: lessons, error } = await admin
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });

  if (error || !lessons) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-body text-sm text-loss">Failed to load lessons. Try refreshing.</p>
      </main>
    );
  }

  // Fetch user's completed lesson IDs and slugs
  const { data: progress } = await admin
    .from("lesson_progress")
    .select("lesson_id, lessons(slug)")
    .eq("user_id", user.id);

  const completedIds = new Set((progress ?? []).map((p: any) => p.lesson_id));
  const completedSlugs = (progress ?? []).map((p: any) => p.lessons?.slug).filter(Boolean) as string[];

  // Determine locked state: lesson N is locked if lesson N-1 is not completed
  // Lesson 1 is always unlocked
  const lessonStates = lessons.map((lesson: any, idx: number) => {
    const completed = completedIds.has(lesson.id);
    let locked = false;
    if (idx > 0) {
      const prev = lessons[idx - 1];
      locked = !completedIds.has(prev.id);
    }
    return { lesson, completed, locked };
  });

  const totalCompleted = completedIds.size;

  // Map DB rows to Lesson type
  function toLesson(row: any): Lesson {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      bodyMd: row.body_md,
      orderIndex: row.order_index,
      unlocksAction: row.unlocks_action ?? null,
    };
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-rule/25 bg-paper">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 pb-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">
                Nivesh<span className="text-stamp">Loop</span>
              </p>
              <h1 className="font-display text-2xl font-semibold text-ink">
                Lessons
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="font-mono text-xs text-muted hover:text-ink border border-rule/25 px-3 py-1.5 rounded-sm transition-colors"
            >
              ← Dashboard
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                Progress
              </span>
              <span className="font-mono text-xs tabular-nums text-ink">
                {totalCompleted} / {lessons.length} completed
              </span>
            </div>
            <div className="h-px bg-rule/15 relative">
              <div
                className="absolute top-0 left-0 h-px bg-stamp transition-all duration-500"
                style={{ width: `${(totalCompleted / lessons.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tab line alignment */}
          <div className="h-4" />
        </div>
      </div>

      {/* Lesson list */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
        {/* Column headers */}
        <div className="flex items-center gap-4 px-1 pb-2 border-b border-rule/30 mb-0">
          <span className="w-11 shrink-0" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted flex-1">Lesson</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted w-24 text-right">Unlocks</span>
        </div>

        <div className="divide-y divide-rule/10">
          {lessonStates.map(({ lesson, completed, locked }) => (
            <LessonEntry
              key={lesson.id}
              lesson={toLesson(lesson)}
              completed={completed}
              locked={locked}
              unlocksLabel={lesson.unlocks_action?.replace(/_/g, " ") ?? undefined}
            />
          ))}
        </div>

        {/* Placeholder notice */}
        <div className="mt-8 border border-rule/20 bg-rule/[0.04] rounded-sm p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            ⚠ Content notice
          </p>
          <p className="font-body text-xs text-ink/65">
            All lesson bodies are currently <strong>placeholders</strong> marked{" "}
            <code className="font-mono text-xs bg-rule/10 px-1">[PLACEHOLDER — NEEDS REAL CONTENT BEFORE LAUNCH]</code>.
            The unlock wiring, lesson flow, and trade-form behavior are fully functional for testing.
          </p>
        </div>
      </div>
    </div>
  );
}
