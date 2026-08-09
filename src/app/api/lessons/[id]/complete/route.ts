import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/lessons/[id]/complete
 *
 * Marks a lesson as complete for the authenticated user.
 * Idempotent — safe to call multiple times (ON CONFLICT DO NOTHING).
 * Returns the user's full list of completed lesson slugs so the client
 * can immediately update UI without a separate fetch.
 *
 * @see docs/LOGIC.md §1 — lesson unlock table
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const lessonId = params.id;
  if (!lessonId) {
    return NextResponse.json({ error: "Missing lesson id" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Verify the lesson exists
  const { data: lesson, error: lessonErr } = await admin
    .from("lessons")
    .select("id, slug, unlocks_action")
    .eq("id", lessonId)
    .single();

  if (lessonErr || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Insert progress — ON CONFLICT DO NOTHING (idempotent)
  const { error: insertErr } = await admin.from("lesson_progress").upsert(
    { user_id: user.id, lesson_id: lessonId, completed_at: new Date().toISOString() },
    { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
  );

  if (insertErr) {
    console.error("lesson_progress insert error:", insertErr);
    return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
  }

  // Return the user's full completed slug list so the client can update immediately
  const { data: progress } = await admin
    .from("lesson_progress")
    .select("lessons(slug)")
    .eq("user_id", user.id);

  const completedSlugs = (progress ?? [])
    .map((p: any) => p.lessons?.slug)
    .filter(Boolean) as string[];

  return NextResponse.json({
    success: true,
    completedLesson: { id: lesson.id, slug: lesson.slug, unlocksAction: lesson.unlocks_action },
    completedSlugs,
  });
}
