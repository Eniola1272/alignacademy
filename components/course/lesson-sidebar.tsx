import Link from "next/link";
import { CheckCircle, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseMeta, LessonMeta } from "@/lib/content/types";

interface Props {
  course: CourseMeta;
  currentLessonSlug: string;
  completedLessonSlugs: Set<string>;
}

export function LessonSidebar({
  course,
  currentLessonSlug,
  completedLessonSlugs,
}: Props) {
  const totalLessons = course.modules.flatMap((m) => m.lessons).length;
  const completedCount = completedLessonSlugs.size;
  const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <aside className="flex flex-col gap-4">
      {/* Course header */}
      <div className="px-1">
        <Link
          href={`/courses/${course.slug}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {course.title}
        </Link>
      </div>

      {/* Progress bar */}
      {completedCount > 0 && (
        <div className="px-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium">
              {completedCount}/{totalLessons}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Module + lesson list */}
      <nav className="flex flex-col gap-5">
        {course.modules.map((mod) => (
          <div key={mod.slug}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {mod.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {mod.lessons.map((lesson) => (
                <LessonItem
                  key={lesson.slug}
                  lesson={lesson}
                  courseSlug={course.slug}
                  isCurrent={lesson.slug === currentLessonSlug}
                  isCompleted={completedLessonSlugs.has(lesson.slug)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function LessonItem({
  lesson,
  courseSlug,
  isCurrent,
  isCompleted,
}: {
  lesson: LessonMeta;
  courseSlug: string;
  isCurrent: boolean;
  isCompleted: boolean;
}) {
  return (
    <li>
      <Link
        href={`/learn/${courseSlug}/${lesson.slug}`}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
          isCurrent
            ? "bg-primary/10 text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        {isCompleted ? (
          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
        ) : isCurrent ? (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
        ) : (
          <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
        )}
        <span className="truncate">{lesson.title}</span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground/60">
          {lesson.estimatedMinutes}m
        </span>
      </Link>
    </li>
  );
}
