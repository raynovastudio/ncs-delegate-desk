//#region node_modules/.nitro/vite/services/ssr/assets/conference-bp2X8G4L.js
var CONFERENCE = {
	society: "Nigerian Cardiac Society",
	edition: "55th Annual General Meeting & Scientific Conference",
	shortName: "NCS EKO 2026",
	theme: "EKO 2026",
	venue: "Lagos, Nigeria"
};
var QR_PREFIX = "NCS55:";
function qrPayload(token) {
	return `${QR_PREFIX}${token}`;
}
function parseQrPayload(raw) {
	const value = raw.trim();
	const candidate = value.startsWith("NCS55:") ? value.slice(6) : value;
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidate) ? candidate.toLowerCase() : null;
}
var CATEGORIES = [
	"delegate",
	"speaker",
	"exhibitor",
	"guest",
	"sponsor"
];
//#endregion
export { qrPayload as i, CONFERENCE as n, parseQrPayload as r, CATEGORIES as t };
