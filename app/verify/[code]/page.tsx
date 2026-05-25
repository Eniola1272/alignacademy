import type { Metadata } from "next";
import { Construction } from "lucide-react";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Verify Certificate · ${code}`,
    description: "Verify the authenticity of an Align Academy certificate.",
  };
}

// Public page — no auth required.
// Phase 6: look up certificate by verification_code, render details + PDF link.
export default async function VerifyPage({ params }: Props) {
  const { code } = await params;

  return (
    <div className="container max-w-screen-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Verify Certificate
      </h1>
      <p className="text-muted-foreground mb-4">
        Verification code:{" "}
        <span className="font-mono text-foreground">{code}</span>
      </p>

      {/* Phase 6: query Supabase for certificate, show holder name + course/track + date */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Construction className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground font-mono">
          Certificate verification · Phase 6
        </p>
      </div>
    </div>
  );
}
