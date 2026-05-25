import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Write and run HTML, CSS, JavaScript, TypeScript, and Python right in your browser.",
};

export default function PlaygroundPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Playground</h1>
      <p className="text-muted-foreground mb-12">
        Write and run code in your browser — no install needed.
      </p>

      {/* Phase 5: Monaco editor, multi-language support, file tabs */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Construction className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          Playground · Phase 5
        </p>
      </div>
    </div>
  );
}
