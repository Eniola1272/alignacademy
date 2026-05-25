import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/tracks", label: "Tracks" },
  { href: "/playground", label: "Playground" },
];

// Server component — reads session server-side, no flash of wrong auth state
export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If signed in, grab the profile row for name + avatar
  const profile =
    user
      ? await supabase
          .from("users")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single()
          .then(({ data }) => data)
      : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl mx-auto items-center px-4">
        {/* Logo */}
        <Link
          href="/"
          className="mr-6 flex items-center gap-2 font-mono font-semibold text-sm"
        >
          <span className="text-primary">▲</span>
          <span>Align Academy</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: theme toggle + auth state + mobile trigger */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <UserMenu
              email={user.email!}
              fullName={profile?.full_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
            />
          ) : (
            <>
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden md:inline-flex"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden md:inline-flex"
                )}
              >
                Get started
              </Link>
            </>
          )}

          <MobileNav links={NAV_LINKS} user={user} />
        </div>
      </div>
    </header>
  );
}
