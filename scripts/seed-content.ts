/**
 * Align Academy — Content Seed Script
 *
 * Reads track/course/lesson metadata from JSON manifests + MDX frontmatter
 * and upserts records into Supabase.
 *
 * Run once after applying migrations, and re-run whenever content is added.
 *
 * Usage:
 *   npx tsx scripts/seed-content.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env.local
config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

// Service role client — bypasses RLS (safe for a local seed script)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CONTENT_DIR = path.join(process.cwd(), "content");
const TRACKS_DIR = path.join(CONTENT_DIR, "tracks");

interface LessonFrontmatter {
  title: string;
  slug: string;
  order: number;
  estimatedMinutes: number;
}

async function seed() {
  console.log("🌱  Starting content seed…\n");

  const trackDirs = fs
    .readdirSync(TRACKS_DIR)
    .filter((d) => fs.statSync(path.join(TRACKS_DIR, d)).isDirectory());

  for (const trackSlug of trackDirs) {
    await seedTrack(trackSlug);
  }

  console.log("\n✅  Seed complete.");
}

async function seedTrack(trackSlug: string) {
  const trackJson = JSON.parse(
    fs.readFileSync(path.join(TRACKS_DIR, trackSlug, "track.json"), "utf-8")
  );

  console.log(`📚  Track: ${trackJson.title}`);

  const { data: track, error: trackErr } = await supabase
    .from("tracks")
    .upsert(
      {
        slug: trackJson.slug,
        title: trackJson.title,
        description: trackJson.description,
        order: trackJson.order,
      },
      { onConflict: "slug", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (trackErr || !track) {
    console.error(`  ❌  Failed to upsert track "${trackSlug}":`, trackErr?.message);
    return;
  }

  console.log(`  ✓  Track upserted (id: ${track.id})`);

  const coursesDir = path.join(TRACKS_DIR, trackSlug, "courses");
  if (!fs.existsSync(coursesDir)) return;

  for (const courseEntry of trackJson.courses) {
    if (courseEntry.status !== "published") {
      console.log(`  ⏭   Skipping ${courseEntry.courseSlug} (${courseEntry.status})`);
      continue;
    }
    await seedCourse(trackSlug, track.id, courseEntry.courseSlug);
  }
}

async function seedCourse(
  trackSlug: string,
  trackDbId: string,
  courseSlug: string
) {
  const courseJsonPath = path.join(
    TRACKS_DIR,
    trackSlug,
    "courses",
    courseSlug,
    "course.json"
  );

  if (!fs.existsSync(courseJsonPath)) {
    console.warn(`  ⚠️   course.json not found for ${courseSlug}`);
    return;
  }

  const courseJson = JSON.parse(fs.readFileSync(courseJsonPath, "utf-8"));
  console.log(`\n    📖  Course: ${courseJson.title}`);

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .upsert(
      {
        slug: courseJson.slug,
        title: courseJson.title,
        description: courseJson.description,
        difficulty: courseJson.difficulty,
        language: courseJson.language,
        estimated_hours: courseJson.estimatedHours,
        track_id: trackDbId,
        order: courseJson.order,
      },
      { onConflict: "slug", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (courseErr || !course) {
    console.error(`    ❌  Failed to upsert course "${courseSlug}":`, courseErr?.message);
    return;
  }

  console.log(`    ✓  Course upserted (id: ${course.id})`);

  for (const module of courseJson.modules) {
    for (const lessonEntry of module.lessons) {
      await seedLesson(
        trackSlug,
        courseSlug,
        course.id,
        module.slug,
        lessonEntry.slug
      );
    }
  }
}

async function seedLesson(
  trackSlug: string,
  courseSlug: string,
  courseDbId: string,
  moduleSlug: string,
  fileSlug: string // e.g. "01-what-is-html"
) {
  const relPath = `tracks/${trackSlug}/courses/${courseSlug}/${moduleSlug}/${fileSlug}.mdx`;
  const absPath = path.join(CONTENT_DIR, relPath);

  if (!fs.existsSync(absPath)) {
    console.warn(`      ⚠️   File not found: ${relPath}`);
    return;
  }

  const { data: fm } = matter(fs.readFileSync(absPath, "utf-8"));
  const frontmatter = fm as LessonFrontmatter;

  const { error } = await supabase.from("lessons").upsert(
    {
      course_id: courseDbId,
      slug: frontmatter.slug, // clean URL slug, e.g. "what-is-html"
      title: frontmatter.title,
      order: frontmatter.order,
      content_path: relPath,
    },
    { onConflict: "course_id,slug", ignoreDuplicates: false }
  );

  if (error) {
    console.error(`      ❌  Failed lesson "${frontmatter.slug}":`, error.message);
  } else {
    console.log(`      ✓  ${frontmatter.order.toString().padStart(2, " ")}. ${frontmatter.title}`);
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
