import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="font-mono text-5xl font-bold text-muted-foreground/30 mb-6">
        404
      </p>
      <h1 className="text-xl font-bold mb-2">Page not found</h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/courses" className={cn(buttonVariants({ size: "sm" }))}>
          Browse courses
        </Link>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
