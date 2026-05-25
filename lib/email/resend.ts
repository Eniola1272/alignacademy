/**
 * Resend email helper.
 * All email-sending functions live here.
 * Call from server-side code only — never from client components.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@alignacademy.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alignacademy.com";

// ── Welcome email ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string | null) {
  const firstName = name?.split(" ")[0] ?? "there";

  await resend.emails.send({
    from: `Align Academy <${FROM}>`,
    to: email,
    subject: "Welcome to Align Academy 🎉",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Align Academy</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">

          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:28px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;font-family:monospace;">
                Align Academy
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">
                Hey ${firstName}, welcome! 👋
              </h1>
              <p style="margin:0 0 16px;color:#555;line-height:1.6;">
                You're all set. Align Academy is a free, structured way to learn
                web development and Python — with verified certificates you can
                actually show employers.
              </p>
              <p style="margin:0 0 24px;color:#555;line-height:1.6;">
                Here's what to do next:
              </p>

              <!-- Steps -->
              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
                ${[
                  ["Browse tracks", "Tracks guide you from zero to capable in a structured sequence.", "/tracks"],
                  ["Pick a course", "Every course is free. Start with HTML Foundations if you're new.", "/courses"],
                  ["Earn a certificate", "Complete all lessons, pay a small fee, get a verified certificate.", "/courses"],
                ]
                  .map(
                    ([title, desc, href]) => `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
                      <a href="${APP_URL}${href}" style="color:#0f172a;font-weight:600;text-decoration:none;">
                        ${title} →
                      </a>
                      <p style="margin:4px 0 0;color:#888;font-size:13px;">${desc}</p>
                    </td>
                  </tr>`
                  )
                  .join("")}
              </table>

              <!-- CTA -->
              <a href="${APP_URL}/dashboard"
                 style="display:inline-block;background:#0f172a;color:#ffffff;
                        padding:12px 24px;border-radius:6px;font-size:14px;
                        font-weight:600;text-decoration:none;">
                Go to your dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                You received this email because you created an account on
                <a href="${APP_URL}" style="color:#999;">Align Academy</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
