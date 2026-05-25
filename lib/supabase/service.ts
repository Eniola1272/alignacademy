/**
 * Service-role Supabase client — bypasses RLS entirely.
 * Use ONLY in server-side code that you fully control:
 *   - API route handlers (webhooks, certificate PDF)
 *   - Trusted server actions
 * Never expose this client to the browser.
 */
import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
