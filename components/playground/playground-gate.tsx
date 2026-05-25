import Link from "next/link";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface PlaygroundGateProps {
  reason: "unauthenticated" | "not-premium";
}

export function PlaygroundGate({ reason }: PlaygroundGateProps) {
  const isPremiumGate = reason === "not-premium";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-6">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Playground</h1>

      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
        {isPremiumGate
          ? "The Playground is a premium feature. Upgrade your account to get full access to the interactive HTML, CSS, and JavaScript editor."
          : "Sign in to access the Playground — write and run HTML, CSS, and JavaScript directly in your browser."}
      </p>

      <div className="flex items-center gap-3">
        {isPremiumGate ? (
          <>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Get Premium
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/auth/login?next=/playground"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
