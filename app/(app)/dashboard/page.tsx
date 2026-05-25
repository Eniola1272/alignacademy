import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Trophy, ExternalLink, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCourse } from "@/lib/content/loader";
import { OnboardingQuiz } from "@/components/onboarding/onboarding-quiz";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, is_premium")
    .eq("id", user!.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  // ── Data fetching ──────────────────────────────────────────────────────────

  const [
    { data: enrollments },
    { data: certificates },
    { data: allLessons },
    { data: allProgress },
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, enrolled_at, completed_at, course_id, courses(title, slug)")
      .eq("user_id", user!.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("certificates")
      .select(
        "id, verification_code, issued_at, recipient_name, courses(title), tracks(title)"
      )
      .eq("user_id", user!.id)
      .order("issued_at", { ascending: false }),
    supabase
      .from("lessons")
      .select("id, course_id")
      .in(
        "course_id",
        // placeholder — will be filtered below
        ["00000000-0000-0000-0000-000000000000"]
      ),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user!.id),
  ]);

  // Re-fetch lessons for actual course IDs
  const courseIds = enrollments?.map((e) => e.course_id).filter(Boolean) ?? [];

  const { data: lessons } =
    courseIds.length > 0
      ? await supabase
          .from("lessons")
          .select("id, course_id")
          .in("course_id", courseIds)
      : { data: [] };

  // ── Progress per course ───────────────────────────────────────────────────

  type ProgressEntry = { completed: number; total: number };
  const progressMap = new Map<string, ProgressEntry>();

  for (const enrollment of enrollments ?? []) {
    const cid = enrollment.course_id;
    const total = lessons?.filter((l) => l.course_id === cid).length ?? 0;
    const completed =
      allProgress?.filter((p) =>
        lessons?.some((l) => l.id === p.lesson_id && l.course_id === cid)
      ).length ?? 0;
    progressMap.set(cid, { completed, total });
  }

  const enrolled = enrollments?.length ?? 0;
  const completed = enrollments?.filter((e) => e.completed_at).length ?? 0;
  const earned = certificates?.length ?? 0;

  const inProgress = enrollments?.filter((e) => !e.completed_at) ?? [];

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Hey, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {enrolled === 0
            ? "Ready to start learning? Pick a course below."
            : "Here's where you left off."}
        </p>
      </div>

      {/* Onboarding quiz — hidden once dismissed (client-side localStorage) */}
      {enrolled === 0 && <OnboardingQuiz />}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: BookOpen, label: "Enrolled",   value: enrolled  },
          { icon: BookOpen, label: "Completed",  value: completed },
          { icon: Trophy,   label: "Certs earned", value: earned  },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-border p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{label}</span>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Continue learning */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Continue learning</h2>
          <Link
            href="/courses"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {inProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center gap-3">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              className={cn(buttonVariants({ size: "sm" }), "gap-2")}
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map((enrollment) => {
              type CourseRef = { title: string; slug: string };
              const course = (
                Array.isArray(enrollment.courses)
                  ? enrollment.courses[0]
                  : enrollment.courses
              ) as CourseRef | null;

              const prog = progressMap.get(enrollment.course_id);
              const pct =
                prog && prog.total > 0
                  ? Math.round((prog.completed / prog.total) * 100)
                  : 0;

              // Try to get estimated hours from content loader
              const detail = course ? getCourse(course.slug) : null;

              return (
                <Link
                  key={enrollment.id}
                  href={`/courses/${course?.slug ?? ""}`}
                  className="group rounded-lg border border-border p-5 hover:border-primary/40 transition-all flex flex-col gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors mb-1">
                      {course?.title ?? "Course"}
                    </h3>
                    {detail && (
                      <p className="text-xs text-muted-foreground">
                        {detail.estimatedHours}h · {detail.totalLessons} lessons
                      </p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">
                        {prog?.completed ?? 0}/{prog?.total ?? 0} lessons
                      </span>
                      <span className="text-xs font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Certificates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your certificates</h2>
        </div>

        {earned === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center gap-3">
            <p className="text-sm text-muted-foreground">
              No certificates yet — complete a course to earn one.
            </p>
            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-2"
              )}
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {certificates?.map((cert) => {
              type EntityRef = { title: string };
              const course = (
                Array.isArray(cert.courses)
                  ? cert.courses[0]
                  : cert.courses
              ) as EntityRef | null;
              const track = (
                Array.isArray(cert.tracks) ? cert.tracks[0] : cert.tracks
              ) as EntityRef | null;

              const entityTitle = course?.title ?? track?.title ?? "Certificate";
              const entityType = cert.courses ? "course" : "track";

              return (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-lg border border-border px-5 py-4 gap-4"
                >
                  <div>
                    <p className="font-medium text-sm">{entityTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {entityType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Issued{" "}
                        {new Date(cert.issued_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/verify/${cert.verification_code}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "shrink-0 gap-1.5"
                    )}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
