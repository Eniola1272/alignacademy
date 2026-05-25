"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error reporting service here
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="font-mono text-5xl font-bold text-muted-foreground/30 mb-6">
        :(
      </p>
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
        An unexpected error occurred. Try refreshing the page — if it keeps
        happening, let us know.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Try again
        </button>
        <a
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Home
        </a>
      </div>
    </div>
  );
}
