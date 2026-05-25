import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Award } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-screen-xl mx-auto px-4 pt-24 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 font-mono text-xs">
          Free to learn · Pay only for your certificate
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Learn to code.{" "}
          <span className="text-muted-foreground">Actually</span> code.
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
          Align Academy teaches web development and Python through short,
          focused lessons with interactive exercises right in your browser. No
          setup required. No noise.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses" className={buttonVariants({ size: "lg" })}>
            Browse courses <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/playground"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Try the playground
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="w-full max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-6 rounded-lg border border-border/60 bg-card"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="w-full max-w-screen-xl mx-auto px-4 pb-24 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to start?</h2>
        <p className="text-muted-foreground mb-6">
          Create a free account and start your first lesson in minutes.
        </p>
        <Link href="/auth/register" className={buttonVariants({ size: "lg" })}>
          Create free account
        </Link>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Text-first lessons",
    body: "Clear, concise lessons — no hour-long videos. Read, understand, then practice immediately.",
  },
  {
    icon: Code2,
    title: "In-browser exercises",
    body: "Write real code and see it run instantly — HTML, CSS, JavaScript, TypeScript, Python.",
  },
  {
    icon: Award,
    title: "Verified certificates",
    body: "Finish a course or learning track and earn a shareable, publicly verifiable certificate.",
  },
];
