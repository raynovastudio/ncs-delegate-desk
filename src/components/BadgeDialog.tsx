import { Download, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONFERENCE } from "@/lib/conference";

export type BadgeParticipant = {
  id: string;
  full_name: string;
  email: string;
  category: string;
  registration_code: string;
  qr_token: string;
};

export function BadgeDialog({
  participant,
  onOpenChange,
}: {
  participant: BadgeParticipant | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qrUrl = participant ? `/api/public/qr/${participant.qr_token}.png` : "";
  const absolute =
    participant && typeof window !== "undefined" ? `${window.location.origin}${qrUrl}` : qrUrl;

  return (
    <Dialog open={!!participant} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {participant && (
          <>
            <DialogHeader>
              <DialogTitle>Delegate badge</DialogTitle>
              <DialogDescription>
                {CONFERENCE.edition} — scan at the venue entrance to check in.
              </DialogDescription>
            </DialogHeader>

            <div className="panel overflow-hidden p-0">
              <div className="surface-navy px-5 py-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-navy-foreground/60">
                  {CONFERENCE.theme}
                </p>
                <p className="mt-1 font-display text-base font-semibold text-navy-foreground">
                  {participant.full_name}
                </p>
                <p className="text-xs capitalize text-navy-foreground/70">
                  {participant.category} · {participant.registration_code}
                </p>
              </div>
              <div className="flex justify-center bg-card p-5">
                <img
                  src={qrUrl}
                  alt={`QR check-in code for ${participant.full_name}`}
                  className="size-56 rounded-lg border border-border"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="secondary" className="flex-1">
                <a href={qrUrl} download={`${participant.registration_code}-badge.png`}>
                  <Download className="size-4" /> Download
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  void navigator.clipboard.writeText(absolute);
                  toast.success("Badge link copied");
                }}
              >
                <Link2 className="size-4" /> Copy link
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
