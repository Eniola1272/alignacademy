/**
 * Shared helper — idempotently creates a certificate after a successful payment.
 * Called by both the Paystack callback and the webhook so neither can miss it.
 * Uses the service-role client so it can write regardless of RLS.
 */

import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CertificatePayload {
  userId: string;
  entityType: "course" | "track";
  entityId: string;       // course_id or track_id UUID
  recipientName: string;
  paystackRef: string;
  amount: number;         // kobo
}

interface CertificateResult {
  verificationCode: string;
  alreadyExisted: boolean;
}

export async function createCertificateForPayment(
  payload: CertificatePayload
): Promise<CertificateResult> {
  const supabase: SupabaseClient = createServiceClient();

  // 1. Update or create the payment record
  await supabase
    .from("payments")
    .update({ status: "success" })
    .eq("paystack_ref", payload.paystackRef);

  // 2. Check if certificate already exists (webhook + callback can both fire)
  const baseExistingQuery = supabase
    .from("certificates")
    .select("id, verification_code")
    .eq("user_id", payload.userId);

  const { data: existing } = await (
    payload.entityType === "course"
      ? baseExistingQuery.eq("course_id", payload.entityId)
      : baseExistingQuery.eq("track_id", payload.entityId)
  ).maybeSingle();
  if (existing) {
    return { verificationCode: existing.verification_code, alreadyExisted: true };
  }

  // 3. Find the payment record we just updated so we can FK it
  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("paystack_ref", payload.paystackRef)
    .single();

  // 4. Insert the certificate
  const { data: cert, error } = await supabase
    .from("certificates")
    .insert({
      user_id: payload.userId,
      course_id: payload.entityType === "course" ? payload.entityId : null,
      track_id: payload.entityType === "track" ? payload.entityId : null,
      recipient_name: payload.recipientName,
      payment_id: payment?.id ?? null,
    })
    .select("id, verification_code")
    .single();

  if (error || !cert) {
    throw new Error(`Failed to create certificate: ${error?.message}`);
  }

  // 5. Link certificate back to the payment
  if (payment) {
    await supabase
      .from("payments")
      .update({ certificate_id: cert.id })
      .eq("id", payment.id);
  }

  return { verificationCode: cert.verification_code, alreadyExisted: false };
}
