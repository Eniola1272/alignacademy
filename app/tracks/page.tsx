import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Tracks",
  description: "Structured learning tracks — a curated sequence of courses.",
};

export default function TracksPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Tracks</h1>
      <p className="text-muted-foreground mb-12">
        Structured sequences of courses, designed to take you from zero to
        capable.
      </p>

      {/* Phase 3: track catalog grid goes here */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Construction className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          Track catalog · Phase 3
        </p>
      </div>
    </div>
  );
}
