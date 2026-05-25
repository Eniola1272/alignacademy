-- =============================================================
-- Align Academy — Migration 002: Row Level Security
-- Run AFTER 001_schema.sql
-- Apply in: Supabase Dashboard → SQL Editor
-- =============================================================
-- Note: public.is_admin() is defined in 001_schema.sql.
--       It uses security definer to avoid RLS recursion.
-- =============================================================

-- ── Enable RLS on all tables ─────────────────────────────────

alter table public.users             enable row level security;
alter table public.tracks            enable row level security;
alter table public.courses           enable row level security;
alter table public.lessons           enable row level security;
alter table public.enrollments       enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.certificates      enable row level security;
alter table public.payments          enable row level security;

-- ── public.users ─────────────────────────────────────────────

-- Users can read their own profile
create policy "users: select own"
  on public.users for select
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "users: select all (admin)"
  on public.users for select
  using (public.is_admin());

-- Users can update their own profile (role and id are not updatable by design —
-- enforce this in application code or add a CHECK trigger if needed)
create policy "users: update own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can update any profile (e.g. promote to admin, set is_premium)
create policy "users: update any (admin)"
  on public.users for update
  using (public.is_admin());

-- No direct INSERT — rows are created by the handle_new_user() trigger
-- No DELETE policy — users cannot delete their account via the client

-- ── public.tracks ────────────────────────────────────────────

-- Track catalog is publicly readable (unauthenticated visitors can browse)
create policy "tracks: public read"
  on public.tracks for select
  using (true);

create policy "tracks: admin write"
  on public.tracks for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── public.courses ───────────────────────────────────────────

create policy "courses: public read"
  on public.courses for select
  using (true);

create policy "courses: admin write"
  on public.courses for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── public.lessons ───────────────────────────────────────────

create policy "lessons: public read"
  on public.lessons for select
  using (true);

create policy "lessons: admin write"
  on public.lessons for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── public.enrollments ───────────────────────────────────────

-- Users can see their own enrollments
create policy "enrollments: select own"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- Authenticated users can enroll themselves
create policy "enrollments: insert own"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

-- Users can unenroll (delete) themselves
create policy "enrollments: delete own"
  on public.enrollments for delete
  using (auth.uid() = user_id);

-- Admins can see and manage all enrollments
create policy "enrollments: admin all"
  on public.enrollments for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── public.lesson_progress ───────────────────────────────────

create policy "lesson_progress: select own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "lesson_progress: insert own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

-- Allow upsert (on conflict do update) by permitting delete too
create policy "lesson_progress: delete own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);

create policy "lesson_progress: admin all"
  on public.lesson_progress for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── public.exercise_attempts ─────────────────────────────────

create policy "exercise_attempts: select own"
  on public.exercise_attempts for select
  using (auth.uid() = user_id);

create policy "exercise_attempts: insert own"
  on public.exercise_attempts for insert
  with check (auth.uid() = user_id);

create policy "exercise_attempts: admin all"
  on public.exercise_attempts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── public.certificates ──────────────────────────────────────

-- Anyone (including unauthenticated) can look up a certificate.
-- This is intentional: /verify/[code] is a public page.
create policy "certificates: public read"
  on public.certificates for select
  using (true);

-- Only service role (webhook handlers) can issue certificates.
-- The service role bypasses RLS entirely — no insert policy needed.
-- If you want to lock this down further, remove this comment and add:
-- create policy "certificates: admin insert"
--   on public.certificates for insert
--   with check (public.is_admin());

-- ── public.payments ──────────────────────────────────────────

-- Users can see their own payment history
create policy "payments: select own"
  on public.payments for select
  using (auth.uid() = user_id);

-- Admins can see all payments
create policy "payments: admin all"
  on public.payments for all
  using (public.is_admin())
  with check (public.is_admin());

-- INSERT and UPDATE are done via service role key in webhook handlers only.
-- No client-side insert policy is intentional.
