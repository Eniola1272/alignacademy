import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/tracks", label: "Tracks" },
  { href: "/playground", label: "Playground" },
];

// Server component — ThemeToggle and MobileNav are client islands
export function Navbar() {
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

        {/* Right side: theme toggle + auth + mobile trigger */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
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
            className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex")}
          >
            Get started
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
