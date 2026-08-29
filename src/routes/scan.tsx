import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CameraOff, CheckCircle2, Loader2, ScanLine, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRequireTeam } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CONFERENCE, parseQrPayload } from "@/lib/conference";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "QR check-in scanner | NCS EKO 2026" },
      {
        name: "description",
        content:
          "Scan delegate QR badges at the venue entrance to check participants into the Nigerian Cardiac Society 55th AGM.",
      },
      { property: "og:title", content: "QR check-in scanner | NCS EKO 2026" },
      {
        property: "og:description",
        content: "Live QR scanning for venue check-in at the NCS 55th AGM.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

type ScanState =
  | { kind: "idle" }
  | { kind: "checking" }
  | {
      kind: "ok";
      name: string;
      category: string;
      code: string;
      repeat: boolean;
      at: string;
    }
  | { kind: "error"; message: string };

const REGION_ID = "ncs-qr-region";

function ScanPage() {
  const { session, loading, isTeam, rolesLoaded } = useRequireTeam();
  const qc = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [state, setState] = useState<ScanState>({ kind: "idle" });
  const [manual, setManual] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const busyRef = useRef(false);
  const lastRef = useRef<{ token: string; at: number } | null>(null);

  const recent = useQuery({
    queryKey: ["recent-check-ins"],
    enabled: !!session && isTeam,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("id, checked_in_at, participants(full_name, category, registration_code)")
        .order("checked_in_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function checkIn(raw: string) {
    const token = parseQrPayload(raw);
    if (!token) {
      setState({ kind: "error", message: "This code is not a valid conference badge." });
      return;
    }
    const now = Date.now();
    if (lastRef.current && lastRef.current.token === token && now - lastRef.current.at < 4000)
      return;
    lastRef.current = { token, at: now };
    if (busyRef.current) return;
    busyRef.current = true;
    setState({ kind: "checking" });

    try {
      const { data: participant, error } = await supabase
        .from("participants")
        .select("id, full_name, category, registration_code")
        .eq("qr_token", token)
        .maybeSingle();

      if (error) throw error;
      if (!participant) {
        setState({ kind: "error", message: "Badge not recognised. Not on the participant list." });
        return;
      }

      const { count } = await supabase
        .from("check_ins")
        .select("id", { count: "exact", head: true })
        .eq("participant_id", participant.id);

      const { error: insertError } = await supabase.from("check_ins").insert({
        participant_id: participant.id,
        checked_in_by: session?.user?.id ?? null,
      });
      if (insertError) throw insertError;

      setState({
        kind: "ok",
        name: participant.full_name,
        category: participant.category,
        code: participant.registration_code,
        repeat: (count ?? 0) > 0,
        at: new Date().toLocaleTimeString(),
      });
      void qc.invalidateQueries({ queryKey: ["recent-check-ins"] });
      void qc.invalidateQueries({ queryKey: ["check-ins"] });
    } catch (e) {
      setState({ kind: "error", message: e instanceof Error ? e.message : "Check-in failed" });
    } finally {
      busyRef.current = false;
    }
  }

  async function startScanner() {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(REGION_ID);
      scannerRef.current = {
        stop: () => scanner.stop(),
        clear: () => scanner.clear(),
      };
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decoded) => void checkIn(decoded),
        () => {},
      );
      setScanning(true);
    } catch (e) {
      scannerRef.current = null;
      toast.error(
        e instanceof Error ? e.message : "Camera unavailable. Allow camera access and try again.",
      );
    }
  }

  async function stopScanner() {
    const s = scannerRef.current;
    scannerRef.current = null;
    setScanning(false);
    if (s) {
      try {
        await s.stop();
        s.clear();
      } catch {
        /* already stopped */
      }
    }
  }

  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s)
        void s
          .stop()
          .then(() => s.clear())
          .catch(() => {});
    };
  }, []);

  if (loading || (session && !rolesLoaded)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell email={session?.user.email}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {CONFERENCE.theme} · Venue entrance
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">QR check-in scanner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Point the camera at a delegate badge. Every scan is recorded with a timestamp.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="panel overflow-hidden">
          <div className="relative aspect-square w-full bg-navy sm:aspect-video">
            <div
              id={REGION_ID}
              className="absolute inset-0 [&_video]:size-full [&_video]:object-cover"
            />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-navy-foreground">
                <ScanLine className="size-10 opacity-70" />
                <p className="text-sm text-navy-foreground/70">Camera is off</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
            {scanning ? (
              <Button variant="destructive" onClick={() => void stopScanner()}>
                <CameraOff className="size-4" /> Stop camera
              </Button>
            ) : (
              <Button onClick={() => void startScanner()}>
                <ScanLine className="size-4" /> Start camera
              </Button>
            )}
            <form
              className="flex flex-1 items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!manual.trim()) return;
                void checkIn(manual);
                setManual("");
              }}
            >
              <div className="flex-1 space-y-1">
                <Label htmlFor="manual" className="text-xs text-muted-foreground">
                  Manual badge code
                </Label>
                <Input
                  id="manual"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="Paste badge token"
                />
              </div>
              <Button type="submit" variant="secondary">
                Check in
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <ScanResult state={state} />

          <div className="panel p-4">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent check-ins
            </h2>
            <ul className="mt-3 space-y-3">
              {(recent.data ?? []).length === 0 && (
                <li className="text-sm text-muted-foreground">No check-ins recorded yet.</li>
              )}
              {(recent.data ?? []).map((row) => {
                const p = row.participants as unknown as {
                  full_name: string;
                  category: string;
                  registration_code: string;
                } | null;
                return (
                  <li key={row.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{p?.full_name ?? "Unknown"}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {p?.category} · {p?.registration_code}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(row.checked_in_at).toLocaleTimeString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ScanResult({ state }: { state: ScanState }) {
  if (state.kind === "idle") {
    return <div className="panel p-5 text-sm text-muted-foreground">Waiting for a badge scan…</div>;
  }
  if (state.kind === "checking") {
    return (
      <div className="panel flex items-center gap-3 p-5 text-sm">
        <Loader2 className="size-4 animate-spin" /> Verifying badge…
      </div>
    );
  }
  if (state.kind === "error") {
    return (
      <div className="panel border-destructive/40 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="size-5" />
          <p className="font-display font-semibold">Check-in failed</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }
  return (
    <div className="panel border-success/40 p-5">
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="size-5" />
        <p className="font-display font-semibold">
          {state.repeat ? "Already checked in — re-entry logged" : "Checked in"}
        </p>
      </div>
      <p className="mt-3 font-display text-xl font-semibold">{state.name}</p>
      <p className="text-sm capitalize text-muted-foreground">
        {state.category} · {state.code}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Recorded at {state.at}</p>
    </div>
  );
}
