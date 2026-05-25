import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, BookOpen, Lock } from "lucide-react";
import { getTrack, getCourse, getTrackSlugs } from "@/lib/content/loader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getTrackSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) return {};
  return { title: track.title, description: track.description };
}

export default async function TrackDetailPage({ params }: Props) {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();

  // Load published course details
  const publishedCourses = track.courses
    .filter((c) => c.status === "published")
    .map((c) => ({ ...c, detail: getCourse(c.courseSlug) }))
    .filter((c) => c.detail !== null);

  const comingSoon = track.courses.filter((c) => c.status !== "published");

  const firstCourse = publishedCourses[0]?.detail;
  const firstLesson = firstCourse?.modules[0]?.lessons[0];

  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-16">
      <Link
        href="/tracks"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        ← All tracks
      </Link>

      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs capitalize">
            {track.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {track.courses.length} courses
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{track.title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          {track.description}
        </p>
        <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            ~{track.estimatedHours}h total
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {publishedCourses.length} of {track.courses.length} courses available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Course list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-lg font-semibold mb-1">Courses in this track</h2>

          {publishedCourses.map(({ detail: course, order }) => (
            course && (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="group flex items-start gap-4 rounded-lg border border-border p-5 hover:border-primary/40 transition-all"
              >
                <span className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {order}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                    <span>{course.totalLessons} lessons</span>
                    <span>·</span>
                    <span>{course.estimatedHours}h</span>
                    <span>·</span>
                    <Badge variant="secondary" className="text-xs font-mono py-0">
                      {course.language}
                    </Badge>
                  </div>
                </div>
              </Link>
            )
          ))}

          {comingSoon.map(({ courseSlug, order }) => (
            <div
              key={courseSlug}
              className="flex items-start gap-4 rounded-lg border border-border/50 p-5 opacity-50"
            >
              <span className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-sm font-bold">
                {order}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm capitalize">
                    {courseSlug.replace(/-/g, " ")}
                  </h3>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-lg border border-border p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Track certificate</p>
              <p className="text-2xl font-bold">
                ₦{(track.certificatePrice.amount / 100).toLocaleString()}
              </p>
              {track.certificatePrice.note && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {track.certificatePrice.note}
                </p>
              )}
            </div>

            {firstCourse && firstLesson && (
              <Link
                href={`/learn/${firstCourse.slug}/${firstLesson.slug}`}
                className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
              >
                Start the track
              </Link>
            )}

            <div className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
              Each course in the track has its own certificate (
              {publishedCourses
                .map(
                  (c) =>
                    c.detail &&
                    `₦${(c.detail.certificatePrice.amount / 100).toLocaleString()}`
                )
                .filter(Boolean)
                .join(", ")}
              ). The track certificate is earned after completing all courses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
