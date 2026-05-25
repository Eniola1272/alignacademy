import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse all Align Academy courses.",
};

export default function CoursesPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Courses</h1>
      <p className="text-muted-foreground mb-12">
        Browse all available courses — more coming soon.
      </p>

      {/* Phase 3: course catalog grid goes here */}
      <Placeholder label="Course catalog · Phase 3" />
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
      <Construction className="h-10 w-10 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground font-mono">{label}</p>
    </div>
  );
}
