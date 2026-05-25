-- =============================================================
-- Align Academy — Migration 004: Course status column
-- Run AFTER 003_certificate_recipient.sql
-- =============================================================

-- Adds a `status` column to courses so the track builder can publish
-- or hide courses without touching the filesystem.
-- Values: 'published' | 'coming-soon' | 'draft'
-- Phase 8: update catalog pages to read status from DB instead of JSON.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
  CHECK (status IN ('published', 'coming-soon', 'draft'));

-- Seed status from the files is handled by the seed script (npm run seed).
-- Existing rows default to 'published'; re-run the seed script to sync.
