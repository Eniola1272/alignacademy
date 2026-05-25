import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — Tracks" };

export default async function AdminTracksPage() {
  const supabase = await createClient();

  const { data: tracks } = await supabase
    .from("tracks")
    .select(
      `id, slug, title, "order",
       courses(id, slug, title, status, "order")`
    )
    .order("order");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Tracks</h1>

      <div className="flex flex-col gap-4">
        {tracks?.map((track) => {
          type CourseRow = { id: string; slug: string; title: string; status: string; order: number };
          const courses = (
            Array.isArray(track.courses) ? track.courses : []
          ) as CourseRow[];

          const published = courses.filter((c) => c.status === "published").length;

          return (
            <div
              key={track.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              {/* Track header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border">
                <div>
                  <h2 className="font-medium text-sm">{track.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {published}/{courses.length} courses published
                  </p>
                </div>
                <Link
                  href={`/admin/tracks/${track.slug}`}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Edit
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Course list preview */}
              <ul className="divide-y divide-border/40">
                {courses
                  .sort((a, b) => a.order - b.order)
                  .map((course) => (
                    <li
                      key={course.id}
                      className="flex items-center justify-between px-5 py-2.5"
                    >
                      <span className="text-sm text-muted-foreground">
                        {course.order}. {course.title}
                      </span>
                      <Badge
                        variant={
                          course.status === "published"
                            ? "default"
                            : course.status === "coming-soon"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs capitalize"
                      >
                        {course.status}
                      </Badge>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })}

        {(!tracks || tracks.length === 0) && (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No tracks found. Run{" "}
            <code className="font-mono text-foreground">npm run seed</code> to
            populate from content files.
          </div>
        )}
      </div>
    </div>
  );
}
