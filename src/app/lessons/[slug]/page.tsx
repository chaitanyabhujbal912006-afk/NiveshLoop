import { redirect, notFound } from "next/navigation";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { LessonDetailClient } from "@/components/LessonDetailClient";
import type { Lesson } from "@/types";

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

/**
 * /lessons/[slug] — lesson detail page.
 * Server component: fetches lesson + user progress, then passes to client
 * component for the "Mark as complete" interactive flow.
 *
 * Personalization: replaces {{top_symbol}} in body_md with the user's
 * largest holding if one exists.
 */
export default async function LessonPage({ params }: Props) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = supabaseAdmin();

  // Fetch this lesson
  const { data: lesson, error } = await admin
    .from("lessons")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !lesson) notFound();

  // Fetch all lessons (for navigation prev/next)
  const { data: allLessons } = await admin
    .from("lessons")
    .select("id, slug, title, order_index")
    .order("order_index", { ascending: true });

  const currentIndex = (allLessons ?? []).findIndex((l: any) => l.id === lesson.id);
  const prev = currentIndex > 0 ? allLessons![currentIndex - 1] : null;
  const next =
    allLessons && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  // Fetch user's completed lesson IDs
  const { data: progress } = await admin
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  const completedIds = new Set((progress ?? []).map((p: any) => p.lesson_id));
  const isCompleted = completedIds.has(lesson.id);

  // Check if this lesson is locked (previous not complete)
  let isLocked = false;
  if (currentIndex > 0 && allLessons) {
    const prevLesson = allLessons[currentIndex - 1];
    isLocked = !completedIds.has(prevLesson.id);
  }

  // Personalization: replace {{top_symbol}} with user's largest holding
  let bodyMd: string = lesson.body_md;
  try {
    const { data: portfolio } = await admin
      .from("portfolios")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (portfolio) {
      const { data: holdings } = await admin
        .from("holdings")
        .select("symbol, qty, avg_price")
        .eq("portfolio_id", portfolio.id)
        .gt("qty", 0)
        .order("qty", { ascending: false })
        .limit(1);

      if (holdings && holdings.length > 0) {
        bodyMd = bodyMd.replace(/\{\{top_symbol\}\}/g, holdings[0].symbol);
      }
    }
  } catch {
    // Non-fatal — keep original body
  }

  const lessonObj: Lesson = {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    bodyMd,
    orderIndex: lesson.order_index,
    unlocksAction: lesson.unlocks_action ?? null,
  };

  return (
    <LessonDetailClient
      lesson={lessonObj}
      isCompleted={isCompleted}
      isLocked={isLocked}
      prev={prev ? { slug: prev.slug, title: prev.title } : null}
      next={next ? { slug: next.slug, title: next.title } : null}
      totalLessons={allLessons?.length ?? 15}
    />
  );
}
