import type { Metadata } from "next";
import Link from "next/link";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import { getAllTracks } from "@/lib/content/loader";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Tracks",
  description: "Structured learning tracks — curated course sequences from beginner to capable.",
  openGraph: {
    title: "Learning Tracks — Align Academy",
    description: "Structured course sequences from beginner to capable. One certificate per track.",
    type: "website",
  },
};

export default async function TracksPage() {
  // Merge DB course status so the track builder changes are reflected here
  const supabase = await createClient();
  const { data: dbCourses } = await supabase.from("courses").select("slug, status");
  const dbStatusMap = new Map(dbCourses?.map((c) => [c.slug, c.status]) ?? []);

  const tracks = getAllTracks().map((track) => ({
    ...track,
    courses: track.courses.map((c) => ({
      ...c,
      status: dbStatusMap.get(c.courseSlug) ?? c.status,
    })),
  }));

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tracks</h1>
        <p className="text-muted-foreground">
          Structured sequences of courses that take you from zero to capable — with one certificate per track.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {tracks.map((track) => {
          const published = track.courses.filter((c) => c.status === "published").length;

          return (
            <Link
              key={track.slug}
              href={`/tracks/${track.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center gap-6 rounded-lg border border-border bg-card p-6 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {track.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {published}/{track.courses.length} courses published
                  </span>
                </div>
                <h2 className="font-semibold text-lg mb-1.5 group-hover:text-primary transition-colors">
                  {track.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {track.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {track.courses.length} courses
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    ~{track.estimatedHours}h
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
