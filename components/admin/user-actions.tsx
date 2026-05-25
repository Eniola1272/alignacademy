"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { setUserPremium, setUserRole } from "@/lib/actions/admin";

interface UserActionsProps {
  userId: string;
  isPremium: boolean;
  role: string;
  isSelf: boolean; // prevent admins from demoting themselves
}

export function UserActions({ userId, isPremium, role, isSelf }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();

  const toggle = (fn: () => Promise<void>) =>
    startTransition(async () => { await fn(); });

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}

      {/* Premium toggle */}
      <button
        disabled={isPending}
        onClick={() =>
          toggle(() => setUserPremium(userId, !isPremium))
        }
        className={cn(
          buttonVariants({
            variant: isPremium ? "outline" : "secondary",
            size: "sm",
          }),
          "h-6 text-xs px-2"
        )}
      >
        {isPremium ? "Revoke premium" : "Grant premium"}
      </button>

      {/* Role toggle */}
      {!isSelf && (
        <button
          disabled={isPending}
          onClick={() =>
            toggle(() =>
              setUserRole(userId, role === "admin" ? "student" : "admin")
            )
          }
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-6 text-xs px-2 text-muted-foreground"
          )}
        >
          {role === "admin" ? "Demote" : "Make admin"}
        </button>
      )}
    </div>
  );
}
