import type { Metadata } from "next";
import { Users, Award, CreditCard, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: certCount },
    { count: pendingCount },
    { data: payments },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("payments").select("amount").eq("status", "success"),
  ]);

  const totalRevenue =
    payments?.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0) ?? 0;

  const stats = [
    {
      label: "Total users",
      value: (userCount ?? 0).toLocaleString(),
      icon: Users,
    },
    {
      label: "Certificates issued",
      value: (certCount ?? 0).toLocaleString(),
      icon: Award,
    },
    {
      label: "Revenue (NGN)",
      value: `₦${(totalRevenue / 100).toLocaleString()}`,
      icon: TrendingUp,
    },
    {
      label: "Pending payments",
      value: (pendingCount ?? 0).toLocaleString(),
      icon: CreditCard,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Overview</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
