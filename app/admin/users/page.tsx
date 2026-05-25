import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";

export const metadata: Metadata = { title: "Admin — Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, role, is_premium, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <span className="text-sm text-muted-foreground">
          {users?.length ?? 0} shown
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                {/* User info */}
                <td className="px-4 py-3">
                  <p className="font-medium leading-tight">
                    {u.full_name || <span className="text-muted-foreground italic">No name</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>

                {/* Role + premium */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className="text-xs capitalize"
                    >
                      {u.role}
                    </Badge>
                    {u.is_premium && (
                      <Badge variant="outline" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Joined */}
                <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                  {new Date(u.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <UserActions
                    userId={u.id}
                    isPremium={u.is_premium}
                    role={u.role}
                    isSelf={u.id === currentUser?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!users || users.length === 0) && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No users yet.
          </div>
        )}
      </div>
    </div>
  );
}
