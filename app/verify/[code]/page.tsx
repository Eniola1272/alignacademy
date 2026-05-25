import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Verify Certificate · ${code}`,
    description: "Verify the authenticity of an Align Academy certificate.",
  };
}

// Public page — no auth required.
// certificates has a public-read RLS policy, so the anon key can read it.
// recipient_name is stored on the certificate itself, so no join to users needed.
export default async function VerifyPage({ params }: Props) {
  const { code } = await params;
  const normalised = code.toUpperCase();

  const supabase = await createClient();

  const { data: cert } = await supabase
    .from("certificates")
    .select(
      "verification_code, issued_at, recipient_name, course_id, track_id, courses(title, slug), tracks(title, slug)"
    )
    .eq("verification_code", normalised)
    .single();

  return (
    <div className="container max-w-screen-md mx-auto px-4 py-16">
      <Link
        href="/"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        ← Align Academy
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-8">
        Certificate Verification
      </h1>

      {cert ? (
        <CertificateFound cert={cert} rawCode={normalised} />
      ) : (
        <CertificateNotFound code={normalised} />
      )}
    </div>
  );
}

// ── Certificate found ─────────────────────────────────────────────────────────

// Supabase infers FK joins as arrays even for many-to-one relationships
// when type generation hasn't been run. We normalise to a single object in use.
type JoinedEntity = { title: string; slug: string };
type CertRow = {
  verification_code: string;
  issued_at: string;
  recipient_name: string;
  course_id: string | null;
  track_id: string | null;
  courses: JoinedEntity | JoinedEntity[] | null;
  tracks: JoinedEntity | JoinedEntity[] | null;
};

function resolveJoin(v: JoinedEntity | JoinedEntity[] | null): JoinedEntity | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function CertificateFound({
  cert,
  rawCode,
}: {
  cert: CertRow;
  rawCode: string;
}) {
  const entityType = cert.course_id ? "course" : "track";
  const courseEntity = resolveJoin(cert.courses);
  const trackEntity  = resolveJoin(cert.tracks);
  const entityTitle  = courseEntity?.title ?? trackEntity?.title ?? "Unknown";
  const entitySlug   = courseEntity?.slug  ?? trackEntity?.slug;
  const entityHref = entitySlug
    ? `/${entityType === "course" ? "courses" : "tracks"}/${entitySlug}`
    : null;

  const issuedAt = new Date(cert.issued_at).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Status banner */}
      <div className="flex items-center gap-3 bg-primary/5 border-b border-border px-6 py-4">
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm font-medium">
          This is a valid Align Academy certificate.
        </p>
      </div>

      {/* Certificate details */}
      <div className="px-6 py-8 flex flex-col gap-6">
        {/* Recipient */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Awarded to
          </p>
          <p className="text-xl font-bold">{cert.recipient_name || "—"}</p>
        </div>

        {/* What they completed */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            For completing the {entityType}
          </p>
          {entityHref ? (
            <Link
              href={entityHref}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              {entityTitle}
            </Link>
          ) : (
            <p className="text-lg font-semibold">{entityTitle}</p>
          )}
          <Badge variant="secondary" className="mt-1 text-xs capitalize">
            {entityType}
          </Badge>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border text-sm text-muted-foreground">
          <span>
            <span className="text-foreground font-medium">Issued: </span>
            {issuedAt}
          </span>
          <span className="font-mono text-xs">
            <span className="text-foreground font-medium not-mono">Code: </span>
            {cert.verification_code}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center gap-3">
        <a
          href={`/api/certificate/${rawCode}/pdf`}
          download
          className={cn(
            buttonVariants({ size: "sm" }),
            "gap-2"
          )}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
        <p className="text-xs text-muted-foreground">
          Shareable link:{" "}
          <span className="font-mono">
            {process.env.NEXT_PUBLIC_VERIFY_BASE_URL ?? ""}/verify/{cert.verification_code}
          </span>
        </p>
      </div>
    </div>
  );
}

// ── Certificate not found ─────────────────────────────────────────────────────

function CertificateNotFound({ code }: { code: string }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-3 bg-destructive/5 border-b border-border px-6 py-4">
        <XCircle className="h-5 w-5 text-destructive shrink-0" />
        <p className="text-sm font-medium">No certificate found for this code.</p>
      </div>
      <div className="px-6 py-8">
        <p className="text-muted-foreground text-sm leading-relaxed mb-1">
          The code{" "}
          <span className="font-mono text-foreground">{code}</span> does not
          match any issued Align Academy certificate.
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Double-check the code for typos. Certificate codes are 16 uppercase
          characters.
        </p>
      </div>
    </div>
  );
}
