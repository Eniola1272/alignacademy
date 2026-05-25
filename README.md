# Align Academy

A web platform for learning web development and Python through text-based lessons, in-browser interactive exercises, and verifiable certificates.

**Stack:** Next.js 16 (App Router) · TypeScript (strict) · Tailwind v4 · shadcn/ui · Supabase · Paystack · Resend · Vercel

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine for dev)
- npm (bundled with Node)

---

## Local setup

### 1. Clone and install

```bash
git clone <repo-url>
cd alignacademy
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API ⚠️ server-side only |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack → Settings → API Keys |
| `PAYSTACK_SECRET_KEY` | Paystack → Settings → API Keys ⚠️ server-side only |
| `RESEND_API_KEY` | Resend → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  (marketing)/       # Public marketing pages — landing, about, pricing
  (app)/             # Auth-protected pages — dashboard, learn
  courses/[slug]/    # Course detail pages
  tracks/[slug]/     # Track detail pages
  playground/        # Standalone code editor
  admin/             # Admin panel (role-gated)
  verify/[code]/     # Public certificate verification
  api/               # Route handlers (webhooks, etc.)

components/
  ui/                # shadcn/ui primitives
  layout/            # Navbar, Footer, ThemeProvider, ThemeToggle, MobileNav
  course/            # Lesson nav, progress bar, etc. (Phase 3+)
  exercise/          # CodeExercise + language runners (Phase 4+)
  playground/        # Monaco editor, file tabs, output panel (Phase 5+)

content/
  courses/           # MDX lesson files, one subfolder per course
  tracks/            # Track manifests

lib/
  supabase/          # client.ts (browser) + server.ts (RSC/actions)
  paystack/          # Paystack helpers (Phase 6)
  pdf/               # Certificate PDF generation (Phase 6)
  mdx/               # MDX config + component map (Phase 3)

types/               # Shared TypeScript types (index.ts)
```

---

## Build phases

| Phase | Scope |
|---|---|
| **1** ✅ | Scaffold — base layout, placeholder routes, env setup |
| **2** | Auth (email + Google), user profile, Supabase schema, dashboard shell |
| **3** | MDX pipeline, course/lesson rendering, progress tracking |
| **4** | `<CodeExercise>` + in-browser runners (HTML/CSS/JS/TS/Python) |
| **5** | Playground (Monaco, multi-file, premium gating) |
| **6** | Paystack checkout + PDF certificates + `/verify/[code]` |
| **7** | Admin panel + track builder UI |
| **8** | Polish, onboarding quiz, mobile pass, launch prep |

---

## Key commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) — it's the target host.  
Add all `.env.local` values as environment variables in the Vercel project settings.  
Set `NEXT_PUBLIC_APP_URL` to your production domain.
