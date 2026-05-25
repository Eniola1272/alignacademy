import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  CourseMeta,
  TrackMeta,
  LessonMeta,
  LessonFrontmatter,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const TRACKS_DIR = path.join(CONTENT_DIR, "tracks");

// ── Tracks ────────────────────────────────────────────────────────────────────

export function getTrackSlugs(): string[] {
  return fs.readdirSync(TRACKS_DIR).filter((entry) => {
    return fs.statSync(path.join(TRACKS_DIR, entry)).isDirectory();
  });
}

export function getTrack(trackSlug: string): TrackMeta | null {
  const jsonPath = path.join(TRACKS_DIR, trackSlug, "track.json");
  if (!fs.existsSync(jsonPath)) return null;
  return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as TrackMeta;
}

export function getAllTracks(): TrackMeta[] {
  return getTrackSlugs()
    .map((slug) => getTrack(slug))
    .filter(Boolean) as TrackMeta[];
}

// ── Courses ───────────────────────────────────────────────────────────────────

/**
 * Returns all published course slugs across all tracks.
 */
export function getAllCourseSlugs(): string[] {
  const slugs: string[] = [];
  for (const trackSlug of getTrackSlugs()) {
    const track = getTrack(trackSlug);
    if (!track) continue;
    for (const c of track.courses) {
      if (c.status === "published") slugs.push(c.courseSlug);
    }
  }
  return slugs;
}

export function getCourse(courseSlug: string): CourseMeta | null {
  // Search across all tracks
  for (const trackSlug of getTrackSlugs()) {
    const jsonPath = path.join(
      TRACKS_DIR,
      trackSlug,
      "courses",
      courseSlug,
      "course.json"
    );
    if (!fs.existsSync(jsonPath)) continue;

    const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    // Hydrate each lesson with its resolved content path and frontmatter slug
    const modules = raw.modules.map((mod: { slug: string; title: string; order: number; description: string; lessons: Array<{ slug: string; order: number }> }) => ({
      ...mod,
      lessons: mod.lessons.map((l: { slug: string; order: number }) => {
        const fileSlug = l.slug; // e.g. "01-what-is-html"
        const contentPath = `tracks/${trackSlug}/courses/${courseSlug}/${mod.slug}/${fileSlug}.mdx`;
        const absPath = path.join(CONTENT_DIR, contentPath);

        // Read frontmatter to get the clean URL slug
        let urlSlug = fileSlug; // fallback
        if (fs.existsSync(absPath)) {
          const { data } = matter(fs.readFileSync(absPath, "utf-8"));
          urlSlug = (data as LessonFrontmatter).slug ?? fileSlug;
        }

        return {
          slug: urlSlug,
          fileSlug,
          title: getLessonTitle(absPath),
          order: l.order,
          estimatedMinutes: getLessonEstimate(absPath),
          moduleSlug: mod.slug,
          contentPath,
        } satisfies LessonMeta;
      }),
    }));

    return { ...raw, modules } as CourseMeta;
  }
  return null;
}

export function getAllCourses(): CourseMeta[] {
  return getAllCourseSlugs()
    .map((slug) => getCourse(slug))
    .filter(Boolean) as CourseMeta[];
}

// ── Lessons ───────────────────────────────────────────────────────────────────

/**
 * Finds a lesson within a course by its URL slug.
 * Returns the LessonMeta (including contentPath) or null.
 */
export function findLesson(
  courseSlug: string,
  lessonSlug: string
): LessonMeta | null {
  const course = getCourse(courseSlug);
  if (!course) return null;

  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) return lesson;
  }
  return null;
}

/**
 * Returns all lessons for a course in order, with their module context.
 */
export function getOrderedLessons(
  courseSlug: string
): Array<LessonMeta & { moduleSlug: string }> {
  const course = getCourse(courseSlug);
  if (!course) return [];

  return course.modules
    .flatMap((mod) => mod.lessons.map((l) => ({ ...l, moduleSlug: mod.slug })))
    .sort((a, b) => a.order - b.order);
}

/**
 * Returns the prev and next lesson slugs relative to the current lesson.
 */
export function getAdjacentLessons(
  courseSlug: string,
  currentSlug: string
): { prev: LessonMeta | null; next: LessonMeta | null } {
  const lessons = getOrderedLessons(courseSlug);
  const idx = lessons.findIndex((l) => l.slug === currentSlug);

  return {
    prev: idx > 0 ? lessons[idx - 1] : null,
    next: idx < lessons.length - 1 ? lessons[idx + 1] : null,
  };
}

/**
 * Reads the raw MDX source for a lesson (given its contentPath).
 */
export function readLessonSource(contentPath: string): string {
  const absPath = path.join(CONTENT_DIR, contentPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Lesson file not found: ${absPath}`);
  }
  return fs.readFileSync(absPath, "utf-8");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLessonTitle(absPath: string): string {
  if (!fs.existsSync(absPath)) return "";
  const { data } = matter(fs.readFileSync(absPath, "utf-8"));
  return (data as LessonFrontmatter).title ?? "";
}

function getLessonEstimate(absPath: string): number {
  if (!fs.existsSync(absPath)) return 5;
  const { data } = matter(fs.readFileSync(absPath, "utf-8"));
  return (data as LessonFrontmatter).estimatedMinutes ?? 5;
}
