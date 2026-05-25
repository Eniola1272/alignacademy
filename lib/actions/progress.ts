"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Marks a lesson complete for the current user.
 *
 * Also:
 * - Auto-enrolls the user in the course if not already enrolled
 * - Marks the course as completed if all lessons are now done
 */
export async function markLessonComplete(
  courseSlug: string,
  lessonSlug: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not signed in" };

  // 1. Resolve course ID
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (courseErr || !course) return { error: "Course not found" };

  // 2. Resolve lesson ID
  const { data: lesson, error: lessonErr } = await supabase
    .from("lessons")
    .select("id")
    .eq("slug", lessonSlug)
    .eq("course_id", course.id)
    .single();

  if (lessonErr || !lesson) return { error: "Lesson not found" };

  // 3. Auto-enrol user if needed
  await supabase.from("enrollments").upsert(
    { user_id: user.id, course_id: course.id },
    { onConflict: "user_id,course_id", ignoreDuplicates: true }
  );

  // 4. Mark lesson complete (upsert = idempotent)
  const { error: progressErr } = await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lesson.id },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true }
    );

  if (progressErr) return { error: progressErr.message };

  // 5. Check if all lessons in the course are now complete
  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", course.id);

  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in(
      "lesson_id",
      (
        await supabase
          .from("lessons")
          .select("id")
          .eq("course_id", course.id)
      ).data?.map((l) => l.id) ?? []
    );

  if (totalLessons && completedLessons && completedLessons >= totalLessons) {
    await supabase
      .from("enrollments")
      .update({ completed_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .is("completed_at", null); // only set once
  }

  // Revalidate the lesson page and dashboard
  revalidatePath(`/learn/${courseSlug}/${lessonSlug}`);
  revalidatePath("/dashboard");

  return {};
}

/**
 * Returns a Set of completed lesson IDs for the current user within a course.
 * Empty set if not signed in or no progress yet.
 */
export async function getCompletedLessonIds(
  courseSlug: string
): Promise<Set<string>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (!course) return new Set();

  const { data: lessonIds } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id);

  if (!lessonIds?.length) return new Set();

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .in(
      "lesson_id",
      lessonIds.map((l) => l.id)
    );

  return new Set(progress?.map((p) => p.lesson_id) ?? []);
}

/**
 * Returns whether a specific lesson is marked complete by the current user.
 */
export async function isLessonComplete(
  courseSlug: string,
  lessonSlug: string
): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (!course) return false;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("slug", lessonSlug)
    .eq("course_id", course.id)
    .single();

  if (!lesson) return false;

  const { data } = await supabase
    .from("lesson_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lesson.id)
    .maybeSingle();

  return !!data;
}
