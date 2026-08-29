import { createServerFn } from "@tanstack/react-start";
import { sendBadgeMail } from "./badge-email.server";

export type BadgeEmailResult = {
  sent: boolean;
  reason?: "email_not_configured" | "recipient_suppressed" | "error";
  message?: string;
};

/**
 * Emails one participant their personal QR badge.
 */
export const sendBadgeEmail = createServerFn({ method: "POST" })
  .validator((input: { participantId: string; origin: string }) => input)
  .handler(async ({ data }): Promise<BadgeEmailResult> => {
    const supabaseUrl = process.env["SUPABASE_URL"] || "";
    const supabaseKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_ANON_KEY"] || "";

    const response = await fetch(`${supabaseUrl}/rest/v1/participants?id=eq.${data.participantId}&select=id,full_name,email,category,registration_code,qr_token`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const participants = await response.json();
    const participant = participants?.[0];

    if (!participant) {
      return { sent: false, reason: "error", message: "Participant not found." };
    }

    const origin = data.origin.replace(/\/$/, "");
    const result = await sendBadgeMail({
      to: participant.email,
      fullName: participant.full_name,
      category: participant.category,
      registrationCode: participant.registration_code,
      qrImageUrl: `${origin}/api/public/qr/${participant.qr_token}.png`,
      idempotencyKey: `badge-${participant.id}`,
    });

    if (result.sent) {
      await fetch(`${supabaseUrl}/rest/v1/participants?id=eq.${participant.id}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email_sent: true, email_sent_at: new Date().toISOString() }),
      });
    }

    return result;
  });
