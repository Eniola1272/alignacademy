import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
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
            <CardTitle>Start learning free</CardTitle>
            <CardDescription>
              Create an account to track your progress and earn certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
