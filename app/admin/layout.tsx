import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check admin role
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="rounded-full bg-muted p-4 mb-6">
          <ShieldX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Access denied</h1>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          This area is for Align Academy administrators only.
        </p>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-border px-3 py-6">
        <p className="px-3 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        <AdminNav />
        <div className="mt-auto pt-6">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto px-6 py-8">{children}</main>
    </div>
  );
}
