import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

import { sendBadgeMail } from "./badge-email.server";

export type BadgeEmailResult = {
  sent: boolean;
  reason?: "email_not_configured" | "recipient_suppressed" | "error";
  message?: string;
};

/**
 * Emails one participant their personal QR badge.
 * The caller must be a signed-in secretariat team member.
 */
export const sendBadgeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { participantId: string; origin: string }) => input)
  .handler(async ({ data, context }): Promise<BadgeEmailResult> => {
    const { supabase, userId } = context;

    const { data: isTeam } = await supabase.rpc("is_team_member", { _user_id: userId });
    if (!isTeam) return { sent: false, reason: "error", message: "Not authorised." };

    const { data: participant, error } = await supabase
      .from("participants")
      .select("id, full_name, email, category, registration_code, qr_token")
      .eq("id", data.participantId)
      .maybeSingle();

    if (error || !participant) {
      return { sent: false, reason: "error", message: error?.message ?? "Participant not found." };
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
      await supabase
        .from("participants")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("id", participant.id);
    }

    return result;
  });
