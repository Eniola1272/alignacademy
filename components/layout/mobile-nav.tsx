"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  user,
}: {
  links: NavLink[];
  user: User | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "md:hidden h-9 w-9"
        )}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open menu</span>
      </SheetTrigger>

      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Link
            href="/"
            className="flex items-center gap-2 font-mono font-semibold text-sm"
            onClick={() => setOpen(false)}
          >
            <span className="text-primary">▲</span>
            Align Academy
          </Link>
        </SheetHeader>

        <Separator className="my-4" />

        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Separator className="my-4" />

        {user ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground truncate px-0.5 mb-1">
              {user.email}
            </p>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "justify-start gap-2"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start gap-2 text-destructive hover:text-destructive"
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className={buttonVariants({ size: "sm" })}
            >
              Get started
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
