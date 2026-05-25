import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Set new password",
};

export default function ResetPasswordPage() {
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
            <CardTitle>Set a new password</CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
