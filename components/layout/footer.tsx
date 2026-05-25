import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "/tracks", label: "Tracks" },
  { href: "/playground", label: "Playground" },
  { href: "/verify/demo", label: "Verify Certificate" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40">
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm font-semibold"
          >
            <span className="text-primary">▲</span>
            <span>Align Academy</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Align Academy
          </p>
        </div>
        <Separator className="my-6" />
        <p className="text-center text-xs text-muted-foreground">
          Free to learn · Pay only for your certificate
        </p>
      </div>
    </footer>
  );
}
