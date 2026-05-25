import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";

/**
 * OAuth / magic-link callback handler.
 * Supabase redirects here with a one-time `code` after sign-in.
 * We exchange it for a session, send a welcome email to new users,
 * then redirect to the intended destination.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Detect new users by checking how recently the account was created.
      // Two-minute window is generous enough to cover email verification flows.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const ageMs = Date.now() - new Date(user.created_at).getTime();
        if (ageMs < 2 * 60 * 1000) {
          // Fire-and-forget — don't block the redirect if Resend is slow
          sendWelcomeEmail(
            user.email,
            (user.user_metadata?.full_name as string | undefined) ?? null
          ).catch((err) => console.error("[welcome-email]", err));
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
