/**
 * On-demand PDF certificate download.
 * URL: /api/certificate/{verificationCode}/pdf
 *
 * Public — anyone who knows the verification code can download the PDF.
 * (The code is already displayed on the public /verify page.)
 *
 * Uses the service-role client so it can read the users table for
 * the recipient name without RLS blocking the anon key.
 */

import { NextResponse, type NextRequest } from "next/server";
import React from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createServiceClient } from "@/lib/supabase/service";
import { CertificatePDF } from "@/lib/pdf/certificate";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = createServiceClient();

  const { data: cert } = await supabase
    .from("certificates")
    .select(
      "id, verification_code, issued_at, recipient_name, course_id, track_id, courses(title), tracks(title)"
    )
    .eq("verification_code", code.toUpperCase())
    .single();

  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404 });
  }

  // Supabase infers FK joins as arrays; coerce to the actual shape.
  type WithTitle = { title: string };
  const courseData = (cert.courses as unknown as WithTitle | WithTitle[] | null);
  const trackData  = (cert.tracks  as unknown as WithTitle | WithTitle[] | null);
  const resolveTitle = (v: WithTitle | WithTitle[] | null) =>
    Array.isArray(v) ? v[0]?.title : v?.title;

  const entityTitle = resolveTitle(courseData) ?? resolveTitle(trackData) ?? "Unknown";
  const entityType: "course" | "track" = cert.course_id ? "course" : "track";

  const issuedAt = new Date(cert.issued_at as string).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // renderToBuffer expects ReactElement<DocumentProps>; cast because
  // CertificatePDF's props don't extend DocumentProps at the type level.
  const element = React.createElement(CertificatePDF, {
    recipientName: cert.recipient_name as string,
    entityTitle,
    entityType,
    issuedAt,
    verificationCode: cert.verification_code as string,
  }) as React.ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(element);

  // Buffer is a Uint8Array subclass; convert explicitly for the Web Response API.
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${cert.verification_code as string}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
