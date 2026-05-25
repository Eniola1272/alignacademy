import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Admin — Payments" };

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  success: "default",
  pending: "secondary",
  failed: "destructive",
};

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(
      "id, paystack_ref, amount, currency, status, created_at, users(email, full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const totalRevenue =
    payments
      ?.filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0) ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <span className="text-sm text-muted-foreground">
          Revenue:{" "}
          <span className="font-medium text-foreground">
            ₦{(totalRevenue / 100).toLocaleString()}
          </span>
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ref</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {payments?.map((p) => {
              type UserRow = { email: string; full_name: string | null };
              const user = (Array.isArray(p.users) ? p.users[0] : p.users) as UserRow | null;
              return (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium leading-tight text-xs">
                      {user?.full_name || user?.email || "—"}
                    </p>
                    {user?.full_name && (
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.paystack_ref}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ₦{(p.amount / 100).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={STATUS_VARIANT[p.status] ?? "secondary"}
                      className="text-xs capitalize"
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {new Date(p.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!payments || payments.length === 0) && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No payments yet.
          </div>
        )}
      </div>
    </div>
  );
}
