import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CourseEditorRow } from "@/components/admin/course-editor-row";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Admin — Track: ${slug}` };
}

export default async function AdminTrackEditorPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: track } = await supabase
    .from("tracks")
    .select(
      `id, title, slug,
       courses(id, title, slug, status, "order")`
    )
    .eq("slug", slug)
    .single();

  if (!track) notFound();

  type CourseRow = {
    id: string;
    title: string;
    slug: string;
    status: "published" | "coming-soon" | "draft";
    order: number;
  };

  const courses = (
    Array.isArray(track.courses) ? track.courses : []
  ) as CourseRow[];

  const sorted = [...courses].sort((a, b) => a.order - b.order);

  return (
    <div>
      <Link
        href="/admin/tracks"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All tracks
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-1">{track.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        {sorted.length} courses · slug:{" "}
        <span className="font-mono">{track.slug}</span>
      </p>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Courses
          </p>
          <p className="text-xs text-muted-foreground">
            Status changes take effect immediately in the DB.
            <br />
            Catalog pages will reflect changes after Phase 8 integration.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          {sorted.map((course, i) => (
            <CourseEditorRow
              key={course.id}
              course={course}
              prevCourse={i > 0 ? sorted[i - 1] : null}
              nextCourse={i < sorted.length - 1 ? sorted[i + 1] : null}
            />
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No courses in this track. Run{" "}
            <code className="font-mono text-foreground">npm run seed</code>.
          </div>
        )}
      </div>
    </div>
  );
}
