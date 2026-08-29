import { createFileRoute } from "@tanstack/react-router";
import QRCode from "qrcode";

import { qrPayload } from "@/lib/conference";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public badge image endpoint. The token itself is the only secret; it carries no
// participant data, so rendering the QR is safe without a session (email clients
// fetch this URL anonymously).
export const Route = createFileRoute("/api/public/qr/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token.replace(/\.png$/i, "");
        if (!UUID.test(token)) {
          return new Response("Invalid token", { status: 400 });
        }

        const buffer = await QRCode.toBuffer(qrPayload(token.toLowerCase()), {
          type: "png",
          width: 640,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#0c3d54", light: "#ffffff" },
        });

        return new Response(new Uint8Array(buffer), {
          headers: {
            "content-type": "image/png",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
