import type { Metadata } from "next";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin",
};

// Phase 7: protected by admin role check in middleware
export default function AdminPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Admin</h1>
      <p className="text-muted-foreground mb-12">
        Manage users, payments, certificates, and course tracks.
      </p>

      {/* Phase 7: admin panel — users, payments, certificate table, track builder */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Construction className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          Admin panel · Phase 7
        </p>
      </div>
    </div>
  );
}
