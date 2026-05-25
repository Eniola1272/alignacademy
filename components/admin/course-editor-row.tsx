"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { setCourseStatus, swapCourseOrder } from "@/lib/actions/admin";

type Status = "published" | "coming-soon" | "draft";

interface CourseRow {
  id: string;
  title: string;
  order: number;
  status: Status;
}

interface Props {
  course: CourseRow;
  prevCourse: CourseRow | null;
  nextCourse: CourseRow | null;
}

export function CourseEditorRow({ course, prevCourse, nextCourse }: Props) {
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) =>
    startTransition(async () => { await fn(); });

  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      {/* Order indicator */}
      <span className="shrink-0 w-5 text-xs text-muted-foreground text-right">
        {course.order}.
      </span>

      {/* Title */}
      <span className="flex-1 text-sm">{course.title}</span>

      {isPending && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
      )}

      {/* Status select */}
      <select
        disabled={isPending}
        defaultValue={course.status}
        onChange={(e) =>
          run(() => setCourseStatus(course.id, e.target.value as Status))
        }
        className={cn(
          "rounded-md border border-border bg-background px-2 py-1 text-xs",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:opacity-50"
        )}
      >
        <option value="published">Published</option>
        <option value="coming-soon">Coming soon</option>
        <option value="draft">Draft</option>
      </select>

      {/* Order buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          disabled={isPending || !prevCourse}
          title="Move up"
          onClick={() =>
            prevCourse &&
            run(() =>
              swapCourseOrder(
                course.id,
                course.order,
                prevCourse.id,
                prevCourse.order
              )
            )
          }
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-6 w-6 p-0 disabled:opacity-30"
          )}
        >
          <ArrowUp className="h-3 w-3" />
        </button>
        <button
          disabled={isPending || !nextCourse}
          title="Move down"
          onClick={() =>
            nextCourse &&
            run(() =>
              swapCourseOrder(
                course.id,
                course.order,
                nextCourse.id,
                nextCourse.order
              )
            )
          }
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-6 w-6 p-0 disabled:opacity-30"
          )}
        >
          <ArrowDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
