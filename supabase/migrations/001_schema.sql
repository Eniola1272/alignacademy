-- =============================================================
-- Align Academy — Migration 001: Schema
-- Apply in: Supabase Dashboard → SQL Editor
-- =============================================================

-- ── Helper functions ─────────────────────────────────────────

-- Generic updated_at trigger function (used by any table that tracks it)
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Admin check — security definer so it bypasses RLS (avoids infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── Tracks ───────────────────────────────────────────────────

create table if not exists public.tracks (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        not null unique,
  title       text        not null,
  description text        not null default '',
  "order"     integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ── Courses ──────────────────────────────────────────────────

create table if not exists public.courses (
  id               uuid           primary key default gen_random_uuid(),
  slug             text           not null unique,
  title            text           not null,
  description      text           not null default '',
  difficulty       text           not null default 'beginner'
                   check (difficulty in ('beginner', 'intermediate', 'advanced')),
  language         text           not null
                   check (language in ('html', 'css', 'sass', 'javascript', 'typescript', 'python')),
  estimated_hours  numeric(4, 1)  not null default 1,
  track_id         uuid           references public.tracks (id) on delete set null,
  "order"          integer        not null default 0,
  created_at       timestamptz    not null default now()
);

create index if not exists courses_track_id_idx on public.courses (track_id);

-- ── Lessons ──────────────────────────────────────────────────
-- Metadata only. Actual content lives in /content/courses/*.mdx

create table if not exists public.lessons (
  id           uuid        primary key default gen_random_uuid(),
  course_id    uuid        not null references public.courses (id) on delete cascade,
  slug         text        not null,
  title        text        not null,
  "order"      integer     not null default 0,
  content_path text        not null, -- e.g. courses/html-basics/01-intro.mdx
  created_at   timestamptz not null default now(),
  unique (course_id, slug)
);

create index if not exists lessons_course_id_order_idx on public.lessons (course_id, "order");

-- ── Users ────────────────────────────────────────────────────
-- Extends auth.users. Populated automatically via trigger on signup.

create table if not exists public.users (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null,
  full_name   text,
  avatar_url  text,
  role        text        not null default 'student'
              check (role in ('student', 'admin')),
  is_premium  boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Sync new auth user → public.users on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sync email changes in auth.users → public.users
create or replace function public.handle_user_email_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users set email = new.email where id = new.id;
  return new;
end;
$$;

create or replace trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();

-- Auto-update updated_at
create or replace trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- ── Enrollments ──────────────────────────────────────────────

create table if not exists public.enrollments (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users (id) on delete cascade,
  course_id   uuid        not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create index if not exists enrollments_user_id_idx  on public.enrollments (user_id);
create index if not exists enrollments_course_id_idx on public.enrollments (course_id);

-- ── Lesson progress ──────────────────────────────────────────

create table if not exists public.lesson_progress (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  lesson_id    uuid        not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)   -- upsert-safe: re-completing a lesson is idempotent
);

create index if not exists lesson_progress_user_id_idx  on public.lesson_progress (user_id);
create index if not exists lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);

-- ── Exercise attempts ────────────────────────────────────────
-- exercise_id is a string key from the MDX file, not a FK

create table if not exists public.exercise_attempts (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  exercise_id  text        not null,  -- e.g. "html-basics:ex-01"
  course_id    uuid        not null references public.courses (id) on delete cascade,
  passed       boolean     not null default false,
  code         text        not null default '',
  attempted_at timestamptz not null default now()
);

create index if not exists exercise_attempts_user_id_idx   on public.exercise_attempts (user_id);
create index if not exists exercise_attempts_exercise_id_idx on public.exercise_attempts (user_id, exercise_id);

-- ── Certificates ─────────────────────────────────────────────
-- payment_id FK added after payments table (circular dep workaround)

create table if not exists public.certificates (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.users (id) on delete cascade,
  course_id         uuid        references public.courses (id) on delete set null,
  track_id          uuid        references public.tracks (id) on delete set null,
  issued_at         timestamptz not null default now(),
  -- 16-char uppercase hex: 64 bits of entropy, URL-friendly
  verification_code text        not null unique
                    default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 16)),
  pdf_url           text,
  payment_id        uuid,       -- FK added below after payments table exists
  check (course_id is not null or track_id is not null)
);

create index if not exists certificates_user_id_idx on public.certificates (user_id);

-- ── Payments ─────────────────────────────────────────────────

create table if not exists public.payments (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users (id) on delete cascade,
  paystack_ref    text        not null unique,
  amount          integer     not null,   -- in kobo (NGN smallest unit)
  currency        text        not null default 'NGN',
  status          text        not null default 'pending'
                  check (status in ('pending', 'success', 'failed')),
  certificate_id  uuid        references public.certificates (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments (user_id);

-- Close the circular FK: certificates.payment_id → payments
alter table public.certificates
  add constraint certificates_payment_id_fkey
  foreign key (payment_id) references public.payments (id) on delete set null;
