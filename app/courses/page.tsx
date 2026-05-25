import type { Metadata } from "next";
import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { getAllCourses } from "@/lib/content/loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse all Align Academy courses — free to start.",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const LANGUAGE_LABEL: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  sass: "Sass",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
};

export default function CoursesPage() {
  const courses = getAllCourses();

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Courses</h1>
        <p className="text-muted-foreground">
          Free to learn. Earn a verified certificate when you finish.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.slug}
            href={`/courses/${course.slug}`}
            className="group flex flex-col rounded-lg border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <Badge variant="secondary" className="font-mono text-xs shrink-0">
                {LANGUAGE_LABEL[course.language] ?? course.language}
              </Badge>
              <span className="text-xs text-muted-foreground capitalize">
                {DIFFICULTY_LABEL[course.difficulty] ?? course.difficulty}
              </span>
            </div>

            <h2 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
              {course.title}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
              {course.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/60">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {course.estimatedHours}h
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
