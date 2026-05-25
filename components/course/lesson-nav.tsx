import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { LessonMeta } from "@/lib/content/types";

interface Props {
  courseSlug: string;
  prev: LessonMeta | null;
  next: LessonMeta | null;
}

export function LessonNav({ courseSlug, prev, next }: Props) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-8 mt-8">
      {prev ? (
        <Link
          href={`/learn/${courseSlug}/${prev.slug}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2 max-w-[45%]"
          )}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/learn/${courseSlug}/${next.slug}`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-2 max-w-[45%] ml-auto"
          )}
        >
          <span className="truncate">{next.title}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : (
        <Link
          href={`/courses/${courseSlug}`}
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-2 ml-auto"
          )}
        >
          Back to course
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      )}
    </div>
  );
}
