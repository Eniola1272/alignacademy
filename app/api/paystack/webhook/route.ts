/**
 * Paystack webhook — server-to-server notification after payment events.
 *
 * Paystack signs the payload with HMAC-SHA512 using the webhook secret.
 * We verify the signature before trusting any data.
 *
 * This is the reliable safety net: even if the browser callback is missed
 * (tab closed, network blip), the certificate is still created here.
 */

import { createHmac } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createCertificateForPayment } from "@/lib/paystack/create-certificate";

function verifySignature(body: string, signature: string): boolean {
  const expected = createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad JSON", { status: 400 });
  }

  // Only handle successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const meta = (data.metadata ?? {}) as Record<string, string>;

  if (!meta.user_id || !meta.entity_type || !meta.entity_id) {
    // Not one of our transactions (could be a test event)
    return NextResponse.json({ received: true });
  }

  try {
    await createCertificateForPayment({
      userId: meta.user_id,
      entityType: meta.entity_type as "course" | "track",
      entityId: meta.entity_id,
      recipientName: meta.recipient_name ?? "",
      paystackRef: data.reference as string,
      amount: data.amount as number,
    });
  } catch (err) {
    console.error("[paystack/webhook]", err);
    // Return 200 anyway so Paystack doesn't retry indefinitely.
    // Log the error and investigate manually.
  }

  return NextResponse.json({ received: true });
}
