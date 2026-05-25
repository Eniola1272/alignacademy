import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Phase 2: this route will be guarded by auth middleware.
// For now it renders as a public placeholder.
export default function DashboardPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-12">
        Your courses, progress, and certificates — all in one place.
      </p>

      {/* Phase 2: enrolled courses, progress bars, certificate list */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Construction className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          Dashboard · Phase 2
        </p>
      </div>
    </div>
  );
}
