/**
 * Shared TypeScript types for Align Academy.
 *
 * These are stub types for Phase 1 scaffolding.
 * They will be expanded — and replaced with Supabase-generated types — in Phase 3.
 */

// ── Enums / literals ──────────────────────────────────────────────────────────

export type UserRole = "student" | "admin";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Language =
  | "html"
  | "css"
  | "sass"
  | "javascript"
  | "typescript"
  | "python";

export type PaymentStatus = "pending" | "success" | "failed";

// ── Domain types ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language: Language;
  estimated_hours: number;
  track_id: string | null;
  order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  order: number;
  content_path: string; // path to MDX file in /content
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string | null;
  track_id: string | null;
  issued_at: string;
  verification_code: string;
  pdf_url: string | null;
  payment_id: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  paystack_ref: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  certificate_id: string | null;
}
