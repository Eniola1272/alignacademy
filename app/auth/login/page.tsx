import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono font-semibold text-sm"
          >
            <span className="text-primary">▲</span>
            Align Academy
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to continue learning</CardDescription>
          </CardHeader>
          <CardContent>
            {/*
             * Suspense is required because LoginForm reads useSearchParams(),
             * which opts the component into client-side rendering.
             */}
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
