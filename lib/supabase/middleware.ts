import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Creates a Supabase client inside middleware, refreshing the session cookie
 * on every request so it doesn't expire mid-session.
 *
 * Returns the (possibly refreshed) response so cookies are forwarded correctly.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to the request (so subsequent server code sees them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild the response with the updated cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: always call getUser() — this refreshes the session token.
  // Do not call getSession() here; it does not validate the token server-side.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Route protection ───────────────────────────────────────
  const { pathname } = request.nextUrl;

  // Authed-only routes: /dashboard and anything under it
  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only routes — unauthenticated users redirected to login
  // Role check (student vs admin) happens in the page/layout
  if (!user && pathname.startsWith("/admin")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect signed-in users away from auth pages
  if (
    user &&
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register"))
  ) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
