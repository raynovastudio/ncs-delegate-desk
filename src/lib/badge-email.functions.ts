import { createServerFn } from "@tanstack/react-start";

import { sendBadgeMail } from "./badge-email.server";

export type BadgeEmailResult = {
  sent: boolean;
  reason?: "email_not_configured" | "recipient_suppressed" | "error";
  message?: string;
};

export const sendBadgeEmail = createServerFn({ method: "POST" })
  .validator(
    (input: {
      participantId: string;
      to: string;
      fullName: string;
      category: string;
      registrationCode: string;
      qrToken: string;
      origin: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<BadgeEmailResult> => {
    console.log("[sendBadgeEmail] Starting...", { to: data.to, name: data.fullName });

    const origin = data.origin.replace(/\/$/, "");
    const result = await sendBadgeMail({
      to: data.to,
      fullName: data.fullName,
      category: data.category,
      registrationCode: data.registrationCode,
      qrImageUrl: `${origin}/api/public/qr/${data.qrToken}.png`,
      idempotencyKey: `badge-${data.participantId}`,
    });

    console.log("[sendBadgeEmail] Result:", JSON.stringify(result));
    return result;
  });
