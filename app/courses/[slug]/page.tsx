import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Clock, BookOpen, Award, Lock } from "lucide-react";
import { getCourse, getAllCourseSlugs } from "@/lib/content/loader";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  GetCertificateButton,
  ViewCertificateButton,
} from "@/components/course/get-certificate-button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: course.title, description: course.description };
}

// ── Certificate status ────────────────────────────────────────────────────────

type CertStatus =
  | { state: "unauthenticated" }
  | { state: "incomplete"; completedCount: number; totalCount: number }
  | { state: "eligible" }
  | { state: "issued"; code: string };

async function getCertificateStatus(
  courseSlug: string,
  courseId: string,
  totalLessons: number
): Promise<CertStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { state: "unauthenticated" };

  // Check if they already have a certificate
  const { data: cert } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  if (cert) return { state: "issued", code: cert.verification_code };

  // Check course completion via enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollment?.completed_at) return { state: "eligible" };

  // Count lessons completed so far
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", courseId);

  if (!lessons || lessons.length === 0)
    return { state: "incomplete", completedCount: 0, totalCount: totalLessons };

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .in(
      "lesson_id",
      lessons.map((l) => l.id)
    );

  return {
    state: "incomplete",
    completedCount: progress?.length ?? 0,
    totalCount: lessons.length,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const firstLesson = course.modules[0]?.lessons[0];

  // Look up the course UUID from the DB (needed for certificate status check)
  const supabase = await createClient();
  const { data: dbCourse } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const certStatus = dbCourse
    ? await getCertificateStatus(slug, dbCourse.id, course.totalLessons)
    : { state: "unauthenticated" as const };

  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-16">
      {/* Back to courses */}
      <Link
        href="/courses"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        ← All courses
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="secondary" className="font-mono text-xs capitalize">
            {course.language}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {course.difficulty}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{course.title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          {course.description}
        </p>
        <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {course.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {course.estimatedHours} hours estimated
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Module list */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Course content</h2>
          <div className="flex flex-col gap-3">
            {course.modules.map((mod) => (
              <div
                key={mod.slug}
                className="rounded-lg border border-border overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-3.5 bg-muted/30">
                  <h3 className="font-medium text-sm">{mod.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {mod.lessons.length} lessons
                  </span>
                </div>
                <ul className="divide-y divide-border/60">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/${course.slug}/${lesson.slug}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors text-sm"
                      >
                        <span className="text-muted-foreground hover:text-foreground transition-colors">
                          {lesson.title}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-4">
                          {lesson.estimatedMinutes}m
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-lg border border-border p-6 flex flex-col gap-5">
            {/* Price */}
            <div>
              <p className="text-2xl font-bold mb-0.5">Free</p>
              <p className="text-xs text-muted-foreground">
                Certificate: ₦
                {(course.certificatePrice.amount / 100).toLocaleString()}
              </p>
            </div>

            {/* Start learning */}
            {firstLesson && (
              <Link
                href={`/learn/${course.slug}/${firstLesson.slug}`}
                className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
              >
                Start learning
              </Link>
            )}

            {/* Certificate section */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Certificate
                </p>
              </div>

              {certStatus.state === "unauthenticated" && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sign in to track progress and earn a certificate.
                  </p>
                  <Link
                    href={`/auth/login?next=/courses/${slug}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full justify-center"
                    )}
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {certStatus.state === "incomplete" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>
                      {certStatus.completedCount}/{certStatus.totalCount} lessons
                      complete
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width:
                          certStatus.totalCount > 0
                            ? `${(certStatus.completedCount / certStatus.totalCount) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Complete all lessons to unlock the certificate.
                  </p>
                </div>
              )}

              {certStatus.state === "eligible" && (
                <GetCertificateButton
                  courseSlug={slug}
                  price={course.certificatePrice.amount}
                />
              )}

              {certStatus.state === "issued" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-primary">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Certificate earned
                  </div>
                  <ViewCertificateButton code={certStatus.code} />
                </div>
              )}
            </div>

            {/* What you'll learn */}
            {course.learningOutcomes.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  What you&apos;ll learn
                </p>
                <ul className="flex flex-col gap-2">
                  {course.learningOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Prerequisites
                </p>
                <ul className="flex flex-col gap-1">
                  {course.prerequisites.map((prereq) => (
                    <li key={prereq}>
                      <Link
                        href={`/courses/${prereq}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {prereq.replace(/-/g, " ")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
