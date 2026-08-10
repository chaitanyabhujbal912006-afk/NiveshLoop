import { redirect } from "next/navigation";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import type { Lesson } from "@/types";
import { LessonsClientView } from "@/components/LessonsClientView";

export const revalidate = 0;

export default async function LessonsPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = supabaseAdmin();

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

  const { data: progress } = await admin
    .from("lesson_progress")
    .select("lesson_id, lessons(slug)")
    .eq("user_id", user.id);

  const completedIds = new Set((progress ?? []).map((p: any) => p.lesson_id));
  const completedSlugs = (progress ?? []).map((p: any) => p.lessons?.slug).filter(Boolean) as string[];

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

  const lessonStates = lessons.map((lesson: any, idx: number) => {
    const completed = completedIds.has(lesson.id);
    let locked = false;
    if (idx > 0) {
      const prev = lessons[idx - 1];
      locked = !completedIds.has(prev.id);
    }
    return {
      lesson: toLesson(lesson),
      completed,
      locked,
      unlocksLabel: lesson.unlocks_action?.replace(/_/g, " ") ?? undefined,
    };
  });

  return (
    <LessonsClientView
      lessonStates={lessonStates}
      totalCompleted={completedIds.size}
      totalLessons={lessons.length}
    />
  );
}
