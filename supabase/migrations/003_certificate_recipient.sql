-- =============================================================
-- Align Academy — Migration 003: Certificate recipient name
-- Run AFTER 002_rls.sql
-- =============================================================

-- Store a snapshot of the recipient's name at certificate issuance time.
-- Needed so the public /verify page can display the name without joining
-- the RLS-protected public.users table under the anon key.
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS recipient_name text NOT NULL DEFAULT '';

-- Prevent issuing a second certificate for the same user + course or track.
-- Partial unique indexes ignore NULL so they don't conflict across types.
CREATE UNIQUE INDEX IF NOT EXISTS certs_user_course_unique
  ON public.certificates (user_id, course_id)
  WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS certs_user_track_unique
  ON public.certificates (user_id, track_id)
  WHERE track_id IS NOT NULL;
