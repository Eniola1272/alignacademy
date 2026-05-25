"use server";

/**
 * Admin server actions — all mutations for the admin panel.
 * Every action re-verifies admin role server-side so they can't
 * be called directly by non-admins even if they bypass the UI guard.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

// ── User actions ──────────────────────────────────────────────────────────────

export async function setUserPremium(userId: string, isPremium: boolean) {
  const supabase = await requireAdmin();
  await supabase
    .from("users")
    .update({ is_premium: isPremium })
    .eq("id", userId);
  revalidatePath("/admin/users");
}

export async function setUserRole(
  userId: string,
  role: "admin" | "student"
) {
  const supabase = await requireAdmin();
  await supabase.from("users").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}

// ── Course (track builder) actions ────────────────────────────────────────────

export async function setCourseStatus(
  courseId: string,
  status: "published" | "coming-soon" | "draft"
) {
  const supabase = await requireAdmin();
  await supabase.from("courses").update({ status }).eq("id", courseId);
  revalidatePath("/admin/tracks");
}

export async function swapCourseOrder(
  courseIdA: string,
  orderA: number,
  courseIdB: string,
  orderB: number
) {
  const supabase = await requireAdmin();

  // Swap the two order values
  await Promise.all([
    supabase.from("courses").update({ order: orderB }).eq("id", courseIdA),
    supabase.from("courses").update({ order: orderA }).eq("id", courseIdB),
  ]);

  revalidatePath("/admin/tracks");
}
