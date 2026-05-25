/**
 * Thin wrappers around Paystack's REST API.
 * All functions run server-side only — they use the secret key.
 */

const BASE = "https://api.paystack.co";

function headers() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
    "Content-Type": "application/json",
  };
}

export interface InitializeParams {
  email: string;
  amount: number;     // kobo
  reference: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}

export interface InitializeResult {
  authorizationUrl: string;
  reference: string;
}

export async function initializeTransaction(
  params: InitializeParams
): Promise<InitializeResult> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack init failed");

  return {
    authorizationUrl: json.data.authorization_url as string,
    reference: json.data.reference as string,
  };
}

export interface VerifyResult {
  status: "success" | "failed" | "abandoned" | string;
  amount: number;     // kobo
  reference: string;
  metadata: Record<string, string>;
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyResult> {
  const res = await fetch(
    `${BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: headers() }
  );

  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack verify failed");

  const data = json.data;
  return {
    status: data.status as string,
    amount: data.amount as number,
    reference: data.reference as string,
    metadata: (data.metadata ?? {}) as Record<string, string>,
  };
}

/** Unique, URL-safe payment reference. */
export function makeReference(userId: string): string {
  return `algnac-${userId.slice(0, 8)}-${Date.now()}`;
}
