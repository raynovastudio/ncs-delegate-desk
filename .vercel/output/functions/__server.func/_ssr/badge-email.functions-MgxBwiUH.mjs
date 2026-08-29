import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-UH_Jp6hR.mjs";
import { t as Resend } from "../_libs/resend+standardwebhooks.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-email.functions-MgxBwiUH.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function getResendClient() {
	const apiKey = process.env["RESEND_API_KEY"];
	if (!apiKey) return null;
	return new Resend(apiKey);
}
async function sendBadgeMail(input) {
	const resend = getResendClient();
	if (!resend) return {
		sent: false,
		reason: "email_not_configured",
		message: "Email sending is not set up yet — set the RESEND_API_KEY environment variable."
	};
	const from = process.env["EMAIL_FROM"] || "NCS Delegate Desk <badges@nigeriancardiacsociety.com>";
	try {
		await resend.emails.send({
			from,
			to: input.to,
			subject: `Your NCS EKO 2026 Delegate Badge — ${input.registrationCode}`,
			html: buildBadgeHtml(input)
		});
		return { sent: true };
	} catch (error) {
		return {
			sent: false,
			reason: "error",
			message: error instanceof Error ? error.message : "Email delivery failed"
		};
	}
}
function buildBadgeHtml(input) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#0c3d54 0%,#066aab 100%);padding:28px 32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Nigerian Cardiac Society</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:600;color:#ffffff;">55th AGM &amp; Scientific Conference</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.7);">EKO 2026 · Lagos, Nigeria</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a1a;">Hello ${input.fullName},</p>
              <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#444;">
                Your delegate badge for the Nigerian Cardiac Society 55th Annual General Meeting &amp; Scientific Conference is ready.
                Please find your personal QR code below — scan it at the venue entrance for check-in.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f8fafb;border:1px solid #e2e8f0;border-radius:8px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#066aab;font-weight:600;">Registration Code</p>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#0c3d54;letter-spacing:0.05em;">${input.registrationCode}</p>
                    <p style="margin:8px 0 0;font-size:12px;text-transform:capitalize;color:#64748b;">${input.category}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;line-height:1.6;color:#444;text-align:center;">
                Your QR badge:
              </p>
              <p style="margin:16px 0;text-align:center;">
                <img src="${input.qrImageUrl}" alt="QR Badge for ${input.fullName}" width="200" height="200" style="border:1px solid #e2e8f0;border-radius:8px;" />
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:20px 0 0;">
                    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                      <strong>What to bring:</strong> A valid photo ID and this QR code (on your phone or printed).<br />
                      <strong>Venue:</strong> Lagos, Nigeria<br />
                      <strong>Questions?</strong> Contact the conference secretariat at secretariat@nigeriancardiacsociety.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafb;padding:16px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                Nigerian Cardiac Society · 55th AGM &amp; Scientific Conference · EKO 2026
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
var sendBadgeEmail_createServerFn_handler = createServerRpc({
	id: "8fd33fd438ad0c7d1f452b0b0bc424de3dcedd9b639131896b8d7dde9c0472b3",
	name: "sendBadgeEmail",
	filename: "src/lib/badge-email.functions.ts"
}, (opts) => sendBadgeEmail.__executeServer(opts));
var sendBadgeEmail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((input) => input).handler(sendBadgeEmail_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: isTeam } = await supabase.rpc("is_team_member", { _user_id: userId });
	if (!isTeam) return {
		sent: false,
		reason: "error",
		message: "Not authorised."
	};
	const { data: participant, error } = await supabase.from("participants").select("id, full_name, email, category, registration_code, qr_token").eq("id", data.participantId).maybeSingle();
	if (error || !participant) return {
		sent: false,
		reason: "error",
		message: error?.message ?? "Participant not found."
	};
	const origin = data.origin.replace(/\/$/, "");
	const result = await sendBadgeMail({
		to: participant.email,
		fullName: participant.full_name,
		category: participant.category,
		registrationCode: participant.registration_code,
		qrImageUrl: `${origin}/api/public/qr/${participant.qr_token}.png`,
		idempotencyKey: `badge-${participant.id}`
	});
	if (result.sent) await supabase.from("participants").update({
		email_sent: true,
		email_sent_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", participant.id);
	return result;
});
//#endregion
export { sendBadgeEmail_createServerFn_handler };
