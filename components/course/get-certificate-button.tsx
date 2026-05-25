"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Award, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  initializeCourseCheckout,
  initializeTrackCheckout,
} from "@/lib/actions/checkout";

interface Props {
  courseSlug?: string;
  trackSlug?: string;
  price: number;       // kobo
}

export function GetCertificateButton({ courseSlug, trackSlug, price }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = courseSlug
        ? await initializeCourseCheckout(courseSlug)
        : await initializeTrackCheckout(trackSlug!);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if ("existingCode" in result) {
        window.location.href = `/verify/${result.existingCode}`;
        return;
      }

      // Redirect to Paystack payment page
      window.location.href = result.authorizationUrl;
    });
  };

  const priceFormatted = `₦${(price / 100).toLocaleString()}`;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          buttonVariants({ size: "sm" }),
          "w-full justify-center gap-2"
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Award className="h-4 w-4" />
        )}
        {isPending ? "Processing…" : `Get Certificate · ${priceFormatted}`}
      </button>

      {error && (
        <p className="text-xs text-destructive leading-relaxed">{error}</p>
      )}
    </div>
  );
}

// Shown when the user already has a certificate for this course/track
export function ViewCertificateButton({ code }: { code: string }) {
  return (
    <Link
      href={`/verify/${code}`}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "w-full justify-center gap-2"
      )}
    >
      <ExternalLink className="h-4 w-4" />
      View Certificate
    </Link>
  );
}
