import type { MetadataRoute } from "next";
import { getAllCourseSlugs, getTrackSlugs, getAllCourses } from "@/lib/content/loader";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "https://alignacademy.com").replace(/\/$/, "");

  // Static public pages
  const statics: MetadataRoute.Sitemap = [
    { url: base,              changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/courses`, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/tracks`,  changeFrequency: "weekly",  priority: 0.9 },
  ];

  // Course and track catalog pages
  const courses: MetadataRoute.Sitemap = getAllCourseSlugs().map((slug) => ({
    url: `${base}/courses/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tracks: MetadataRoute.Sitemap = getTrackSlugs().map((slug) => ({
    url: `${base}/tracks/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Individual lesson pages
  const lessons: MetadataRoute.Sitemap = getAllCourses().flatMap((course) =>
    course.modules.flatMap((mod) =>
      mod.lessons.map((lesson) => ({
        url: `${base}/learn/${course.slug}/${lesson.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    )
  );

  return [...statics, ...courses, ...tracks, ...lessons];
}
