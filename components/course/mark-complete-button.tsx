"use client";

import { useTransition } from "react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { markLessonComplete } from "@/lib/actions/progress";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  courseSlug: string;
  lessonSlug: string;
  completed: boolean;
}

export function MarkCompleteButton({ courseSlug, lessonSlug, completed }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (completed) return; // idempotent, but block the UI
    startTransition(async () => {
      await markLessonComplete(courseSlug, lessonSlug);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || completed}
      className={cn(
        buttonVariants({ variant: completed ? "outline" : "default", size: "sm" }),
        "gap-2 transition-all"
      )}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : completed ? (
        <CheckCircle className="h-4 w-4 text-primary" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {completed ? "Completed" : "Mark complete"}
    </button>
  );
}
