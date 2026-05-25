# Align Academy — Project Brief

## What it is
A web platform where beginners learn web development and Python through text-based lessons with in-browser interactive exercises. Free to use; revenue comes from paid certificates issued per course and per track.

## Audience
Mostly absolute beginners. UX must be calm, guided, and rewarding. No clutter, no jargon walls, no feature dumps.

## Brand & feel
- Name: Align Academy
- Tone: clean, techy, friendly, fun-to-learn
- Visual direction: modern dev-tool aesthetic (think Linear, Vercel docs, Cal.com) — generous whitespace, monospace accents for code, smooth micro-interactions
- Dark mode is first-class, not an afterthought

## Tech stack (locked)
- Next.js 14+ (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase (Postgres, Auth, Storage)
- MDX for course content (contentlayer or next-mdx-remote — decide in Phase 2)
- Monaco Editor for the playground
- Pyodide for in-browser Python
- sass.js for in-browser Sass compilation
- Paystack for payments (Nigerian market primary)
- Resend for transactional email
- @react-pdf/renderer for certificates
- Vercel for hosting

## Languages supported in exercises/playground
HTML, CSS, Sass, JavaScript, TypeScript, Python. All run client-side. No server-side code execution at v1.

## Core features (v1)
1. Auth (email + Google via Supabase)
2. Course catalog + track catalog
3. Lesson reader with MDX, syntax highlighting, prev/next nav, mark-complete
4. Embedded `<CodeExercise>` component inside lessons
5. Standalone /playground with Monaco editor, multi-language support
6. Progress tracking (lessons, exercises, course completion)
7. Paystack checkout for per-course and per-track certificates
8. PDF certificate generation with public verification URL
9. User dashboard (enrolled courses, progress, certificates)
10. Admin panel (users, payments, certificates, track builder)

## Explicitly OUT of v1
- Video lessons
- Discussion forums / comments
- Native mobile app
- Subscriptions (only one-time certificate payments)
- Social logins beyond Google
- Gamification beyond progress bars + streaks
- Course authoring CMS (MDX in git for now)
- Server-side code execution (Judge0 etc.)

## Data model (target — implement in Phase 3)
- users (extends Supabase auth.users with profile data + is_premium flag)
- courses (slug, title, description, difficulty, order, track_id nullable, language, estimated_hours)
- lessons (course_id, slug, title, order, content_path)
- tracks (slug, title, description, order)
- enrollments (user_id, course_id, enrolled_at, completed_at)
- lesson_progress (user_id, lesson_id, completed_at)
- exercise_attempts (user_id, exercise_id string, course_id, passed, code, attempted_at)
- certificates (user_id, course_id OR track_id, issued_at, verification_code, pdf_url, payment_id)
- payments (user_id, paystack_ref, amount, currency, status, certificate_id)

Course content lives as MDX files in /content, NOT in the database. Only metadata, progress, and payment data live in Postgres.

## Folder structure
```
/app                  # Next.js App Router routes
  /(marketing)        # Public pages — landing, about, pricing
  /(app)              # Authed pages — dashboard, learn
  /courses/[slug]
  /tracks/[slug]
  /learn/[course]/[lesson]
  /playground
  /admin
  /verify/[code]
  /api                # Route handlers (webhooks, server actions support)
/components
  /ui                 # shadcn primitives
  /layout             # nav, footer
  /course             # course-specific (LessonNav, ProgressBar)
  /exercise           # CodeExercise + language runners
  /playground         # editor, file tabs, output panel
/content
  /courses            # MDX files, one folder per course
  /tracks             # track manifests (JSON or MDX frontmatter)
/lib
  /supabase           # client + server helpers
  /paystack
  /pdf                # certificate generator
  /mdx                # MDX config, components map
  /utils
/types                # shared TS types
```

## Phased build plan
- Phase 1 (current): Project scaffold, base layout, placeholder routes
- Phase 2: Auth, user profile, dashboard shell, Supabase schema
- Phase 3: MDX pipeline, course/lesson rendering, progress tracking
- Phase 4: <CodeExercise> component + iframe/Pyodide/TS/Sass runners
- Phase 5: Playground (Monaco, multi-file, premium gating)
- Phase 6: Paystack + PDF certificates + verification page
- Phase 7: Admin panel + track builder UI
- Phase 8: Polish, onboarding quiz, mobile pass, launch prep

## Working agreement
- Ask before adding dependencies not listed above
- Ask before introducing new patterns (state mgmt libs, ORMs beyond Supabase client, etc.)
- Server components by default; "use client" only when interactivity demands it
- Small, readable code over clever code
- Summarize changes after each meaningful chunk