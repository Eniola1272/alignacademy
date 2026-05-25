import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout for all authenticated (app) routes.
 * The middleware already redirects unauthenticated users before they reach here,
 * but we do a server-side guard as a defence-in-depth layer.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
