import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getCourse,
  findLesson,
  readLessonSource,
  getAdjacentLessons,
  getOrderedLessons,
} from "@/lib/content/loader";
import { preprocessMdx } from "@/lib/mdx/preprocessor";
import { MDX_COMPONENTS } from "@/lib/mdx/components";
import { MDX_OPTIONS } from "@/lib/mdx/options";
import { LessonSidebar } from "@/components/course/lesson-sidebar";
import { LessonNav } from "@/components/course/lesson-nav";
import { MarkCompleteButton } from "@/components/course/mark-complete-button";

type Props = { params: Promise<{ course: string; lesson: string }> };

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const { getAllCourseSlugs, getOrderedLessons: getOL } = await import(
    "@/lib/content/loader"
  );
  const params: { course: string; lesson: string }[] = [];
  for (const courseSlug of getAllCourseSlugs()) {
    for (const lesson of getOL(courseSlug)) {
      params.push({ course: courseSlug, lesson: lesson.slug });
    }
  }
  return params;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const lesson = findLesson(courseSlug, lessonSlug);
  if (!lesson) return {};
  return {
    title: lesson.title,
    description: `${lesson.title} — ${lesson.estimatedMinutes} min read`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LessonPage({ params }: Props) {
  const { course: courseSlug, lesson: lessonSlug } = await params;

  const course = getCourse(courseSlug);
  const lesson = findLesson(courseSlug, lessonSlug);

  if (!course || !lesson) notFound();

  // Adjacent lessons for nav
  const { prev, next } = getAdjacentLessons(courseSlug, lessonSlug);

  // Auth + progress (non-blocking — works for logged-out users too)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let completedSlugs = new Set<string>();
  let isComplete = false;

  if (user) {
    // Get all lesson slugs → IDs for this course, then cross-ref with progress
    const { data: dbLessons } = await supabase
      .from("lessons")
      .select("id, slug")
      .eq(
        "course_id",
        (
          await supabase
            .from("courses")
            .select("id")
            .eq("slug", courseSlug)
            .single()
        ).data?.id ?? ""
      );

    if (dbLessons) {
      const idBySlug = new Map(dbLessons.map((l) => [l.slug, l.id]));
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .in("lesson_id", dbLessons.map((l) => l.id));

      const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? []);
      completedSlugs = new Set(
        [...idBySlug.entries()]
          .filter(([, id]) => completedIds.has(id))
          .map(([slug]) => slug)
      );
      isComplete = completedSlugs.has(lessonSlug);

      // Auto-enrol on first visit
      const { data: dbCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", courseSlug)
        .single();

      if (dbCourse) {
        await supabase
          .from("enrollments")
          .upsert(
            { user_id: user.id, course_id: dbCourse.id },
            { onConflict: "user_id,course_id", ignoreDuplicates: true }
          );
      }
    }
  }

  // Compile MDX (preprocessor handles raw HTML in StartingCode/Solution)
  const source = readLessonSource(lesson.contentPath);
  const { content } = await compileMDX({
    source: preprocessMdx(source),
    components: MDX_COMPONENTS,
    options: {
      parseFrontmatter: true,
      mdxOptions: MDX_OPTIONS,
    },
  });

  const orderedLessons = getOrderedLessons(courseSlug);
  const lessonIndex = orderedLessons.findIndex((l) => l.slug === lessonSlug);

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (desktop) ──────────────────────────────────── */}
      <div className="hidden lg:block w-72 xl:w-80 shrink-0 border-r border-border">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-5">
          <LessonSidebar
            course={course}
            currentLessonSlug={lessonSlug}
            completedLessonSlugs={completedSlugs}
          />
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 font-mono">
            <span>{course.title}</span>
            <span>/</span>
            <span>{lesson.title}</span>
          </div>

          {/* Lesson header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{lesson.estimatedMinutes} min</span>
              {lessonIndex >= 0 && (
                <>
                  <span>·</span>
                  <span>
                    Lesson {lessonIndex + 1} of {orderedLessons.length}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* MDX content */}
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-code:before:content-none prose-code:after:content-none prose-pre:p-0 prose-pre:bg-transparent">
            {content}
          </article>

          {/* Footer: mark complete + prev/next */}
          <div className="mt-12 flex flex-col gap-6">
            {user ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {isComplete
                    ? "You've completed this lesson."
                    : "Ready to move on?"}
                </p>
                <MarkCompleteButton
                  courseSlug={courseSlug}
                  lessonSlug={lessonSlug}
                  completed={isComplete}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
                <a
                  href={`/auth/login?next=/learn/${courseSlug}/${lessonSlug}`}
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Sign in
                </a>{" "}
                to track your progress
              </div>
            )}

            <LessonNav courseSlug={courseSlug} prev={prev} next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
