"use server";

/**
 * Checkout server actions — initiate Paystack payment for a certificate.
 *
 * Flow:
 *   1. Verify user is authenticated and has completed the course/track
 *   2. Check they don't already have a certificate
 *   3. Call Paystack to initialize a transaction
 *   4. Store a pending payment record
 *   5. Return the Paystack authorization URL for the client to redirect to
 */

import { createClient } from "@/lib/supabase/server";
import { initializeTransaction, makeReference } from "@/lib/paystack/client";
import { getCourse, getTrack } from "@/lib/content/loader";

type CheckoutResult =
  | { authorizationUrl: string }
  | { existingCode: string }      // already has a certificate
  | { error: string };

// ── Course certificate ────────────────────────────────────────────────────────

export async function initializeCourseCheckout(
  courseSlug: string
): Promise<CheckoutResult> {
  const supabase = await createClient();

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // 2. User profile
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profile not found." };

  // 3. Course from DB
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();
  if (!course) return { error: "Course not found." };

  // 4. Check all lessons are complete (enrollment.completed_at is set)
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single();

  if (!enrollment?.completed_at) {
    return { error: "You must complete all lessons before getting a certificate." };
  }

  // 5. Check for an existing certificate
  const { data: existing } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();
  if (existing) return { existingCode: existing.verification_code };

  // 6. Price from content loader
  const courseDetail = getCourse(courseSlug);
  const amount = courseDetail?.certificatePrice.amount ?? 500000; // ₦5,000 fallback

  // 7. Initialize Paystack
  const reference = makeReference(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { authorizationUrl } = await initializeTransaction({
    email: profile.email,
    amount,
    reference,
    callbackUrl: `${appUrl}/api/paystack/callback`,
    metadata: {
      user_id: user.id,
      entity_type: "course",
      entity_id: course.id,
      entity_slug: courseSlug,
      recipient_name: profile.full_name ?? user.email ?? "",
    },
  });

  // 8. Create pending payment record
  await supabase.from("payments").insert({
    user_id: user.id,
    paystack_ref: reference,
    amount,
    currency: "NGN",
    status: "pending",
  });

  return { authorizationUrl };
}

// ── Track certificate ─────────────────────────────────────────────────────────

export async function initializeTrackCheckout(
  trackSlug: string
): Promise<CheckoutResult> {
  const supabase = await createClient();

  // 1. Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  // 2. User profile
  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profile not found." };

  // 3. Track from DB
  const { data: track } = await supabase
    .from("tracks")
    .select("id")
    .eq("slug", trackSlug)
    .single();
  if (!track) return { error: "Track not found." };

  // 4. All courses in the track must be completed
  const { data: trackCourses } = await supabase
    .from("courses")
    .select("id")
    .eq("track_id", track.id);

  if (!trackCourses || trackCourses.length === 0) {
    return { error: "No courses found in this track." };
  }

  const { data: completedEnrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id)
    .in(
      "course_id",
      trackCourses.map((c) => c.id)
    )
    .not("completed_at", "is", null);

  if (
    !completedEnrollments ||
    completedEnrollments.length < trackCourses.length
  ) {
    return { error: "You must complete all courses in the track first." };
  }

  // 5. Check for an existing certificate
  const { data: existing } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("user_id", user.id)
    .eq("track_id", track.id)
    .maybeSingle();
  if (existing) return { existingCode: existing.verification_code };

  // 6. Price from content loader
  const trackDetail = getTrack(trackSlug);
  const amount = trackDetail?.certificatePrice.amount ?? 1000000; // ₦10,000 fallback

  // 7. Initialize Paystack
  const reference = makeReference(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { authorizationUrl } = await initializeTransaction({
    email: profile.email,
    amount,
    reference,
    callbackUrl: `${appUrl}/api/paystack/callback`,
    metadata: {
      user_id: user.id,
      entity_type: "track",
      entity_id: track.id,
      entity_slug: trackSlug,
      recipient_name: profile.full_name ?? user.email ?? "",
    },
  });

  // 8. Pending payment
  await supabase.from("payments").insert({
    user_id: user.id,
    paystack_ref: reference,
    amount,
    currency: "NGN",
    status: "pending",
  });

  return { authorizationUrl };
}
