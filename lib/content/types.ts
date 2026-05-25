/**
 * Types for the filesystem content layer.
 * These mirror the database schema but are read directly from
 * JSON manifests + MDX frontmatter — no Supabase query needed to render a lesson.
 */

export interface LessonFrontmatter {
  title: string;
  slug: string; // clean URL slug, e.g. "what-is-html"
  module: string;
  moduleSlug: string;
  course: string;
  courseSlug: string;
  order: number;
  estimatedMinutes: number;
}

export interface LessonMeta {
  slug: string; // URL slug (from frontmatter)
  fileSlug: string; // filename slug, e.g. "01-what-is-html"
  title: string;
  order: number;
  estimatedMinutes: number;
  moduleSlug: string;
  contentPath: string; // relative to content/, e.g. "tracks/web-development-fundamentals/courses/html-foundations/module-1-first-steps/01-what-is-html.mdx"
}

export interface ModuleMeta {
  slug: string;
  title: string;
  order: number;
  description: string;
  lessons: LessonMeta[];
}

export interface CourseMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  difficulty: string;
  order: number;
  trackSlug: string | null;
  estimatedHours: number;
  totalLessons: number;
  modules: ModuleMeta[];
  prerequisites: string[];
  certificatePrice: { amount: number; currency: string };
  learningOutcomes: string[];
}

export interface TrackCourseSummary {
  courseSlug: string;
  order: number;
  status: "published" | "coming-soon";
}

export interface TrackMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  courses: TrackCourseSummary[];
  estimatedHours: number;
  difficulty: string;
  certificatePrice: { amount: number; currency: string; note?: string };
}
