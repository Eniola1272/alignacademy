import type { Metadata } from "next";
import { BookOpen, Trophy, Clock, Construction } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile for the greeting
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, is_premium")
    .eq("id", user!.id)
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  // These queries will return data once courses/enrollments are populated in Phase 3
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, enrolled_at, completed_at, course_id")
    .eq("user_id", user!.id);

  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, issued_at, verification_code")
    .eq("user_id", user!.id);

  const enrolled = enrollments?.length ?? 0;
  const completed = enrollments?.filter((e) => e.completed_at).length ?? 0;
  const earned = certificates?.length ?? 0;

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Hey, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s where you left off.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <StatCard
          icon={BookOpen}
          label="Enrolled courses"
          value={enrolled}
        />
        <StatCard
          icon={Clock}
          label="Completed"
          value={completed}
        />
        <StatCard
          icon={Trophy}
          label="Certificates earned"
          value={earned}
        />
      </div>

      {/* Active courses */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Continue learning</h2>
        {enrolled === 0 ? (
          <EmptyState
            message="You haven't enrolled in any courses yet."
            action="Browse courses"
            href="/courses"
          />
        ) : (
          <Placeholder label="Active course cards · Phase 3" />
        )}
      </section>

      {/* Certificates */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Your certificates</h2>
        {earned === 0 ? (
          <EmptyState
            message="No certificates yet — complete a course to earn one."
            action="Browse courses"
            href="/courses"
          />
        ) : (
          <Placeholder label="Certificate list · Phase 6" />
        )}
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-xs font-medium">{label}</CardDescription>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  message,
  action,
  href,
}: {
  message: string;
  action: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center gap-3">
      <p className="text-sm text-muted-foreground">{message}</p>
      <a
        href={href}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        {action} →
      </a>
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
      <Construction className="h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-xs text-muted-foreground font-mono">{label}</p>
    </div>
  );
}
