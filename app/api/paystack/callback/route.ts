/**
 * Paystack callback — the user is redirected here by Paystack after payment.
 * URL: /api/paystack/callback?reference=xxx&trxref=xxx
 *
 * Verify the transaction, create the certificate, then redirect the user
 * to their new verify page.
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyTransaction } from "@/lib/paystack/client";
import { createCertificateForPayment } from "@/lib/paystack/create-certificate";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")
    ?? request.nextUrl.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/dashboard?payment=missing_ref", request.url));
  }

  try {
    const tx = await verifyTransaction(reference);

    if (tx.status !== "success") {
      return NextResponse.redirect(new URL("/dashboard?payment=failed", request.url));
    }

    const meta = tx.metadata;
    const { verificationCode } = await createCertificateForPayment({
      userId: meta.user_id,
      entityType: meta.entity_type as "course" | "track",
      entityId: meta.entity_id,
      recipientName: meta.recipient_name ?? "",
      paystackRef: reference,
      amount: tx.amount,
    });

    return NextResponse.redirect(
      new URL(`/verify/${verificationCode}`, request.url)
    );
  } catch (err) {
    console.error("[paystack/callback]", err);
    return NextResponse.redirect(new URL("/dashboard?payment=error", request.url));
  }
}
