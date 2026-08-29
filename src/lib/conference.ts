export const CONFERENCE = {
  society: "Nigerian Cardiac Society",
  edition: "55th Annual General Meeting & Scientific Conference",
  shortName: "NCS EKO 2026",
  theme: "EKO 2026",
  venue: "Lagos, Nigeria",
} as const;

export const QR_PREFIX = "NCS55:";

export function qrPayload(token: string) {
  return `${QR_PREFIX}${token}`;
}

export function parseQrPayload(raw: string): string | null {
  const value = raw.trim();
  const candidate = value.startsWith(QR_PREFIX) ? value.slice(QR_PREFIX.length) : value;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuid.test(candidate) ? candidate.toLowerCase() : null;
}

export const CATEGORIES = ["delegate", "speaker", "exhibitor", "guest", "sponsor"] as const;
export type Category = (typeof CATEGORIES)[number];
