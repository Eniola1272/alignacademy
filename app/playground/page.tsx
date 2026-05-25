import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PlaygroundGate } from "@/components/playground/playground-gate";
import { PlaygroundEditor } from "@/components/playground/playground-editor";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Write and run HTML, CSS, and JavaScript right in your browser.",
};

export default async function PlaygroundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated — show sign-in prompt
  if (!user) {
    return <PlaygroundGate reason="unauthenticated" />;
  }

  // Authenticated — check premium status
  const { data: profile } = await supabase
    .from("users")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return <PlaygroundGate reason="not-premium" />;
  }

  // Premium user — show the full editor
  return <PlaygroundEditor />;
}
