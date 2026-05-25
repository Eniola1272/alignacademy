import { redirect } from "next/navigation";
import { getCourse, getOrderedLessons } from "@/lib/content/loader";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ course: string }> };

// Redirect /learn/{course} → first lesson
export default async function LearnCoursePage({ params }: Props) {
  const { course: courseSlug } = await params;
  const course = getCourse(courseSlug);
  if (!course) notFound();

  const lessons = getOrderedLessons(courseSlug);
  if (!lessons.length) notFound();

  redirect(`/learn/${courseSlug}/${lessons[0].slug}`);
}
