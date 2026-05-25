"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

type NavLink = { href: string; label: string };

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* SheetTrigger renders as a button natively — apply button styles via className */}
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
          {/* Visually-hidden title for screen readers */}
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
      </SheetContent>
    </Sheet>
  );
}
