import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONFERENCE } from "@/lib/conference";
import { setupAdmin } from "@/lib/setup.functions";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await setupAdmin({ data: { email, password, fullName } });
      if (result.success) {
        toast.success(result.message);
        navigate({ to: "/auth" });
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="surface-navy grid-lines relative flex flex-col justify-between px-6 py-10 lg:w-[46%] lg:px-14 lg:py-16">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-navy-foreground/10 ring-1 ring-navy-foreground/20">
            <HeartPulse className="size-6 text-navy-foreground" />
          </span>
          <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-navy-foreground/80">
            {CONFERENCE.society}
          </span>
        </div>
        <div className="mt-12 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-navy-foreground/60">
            {CONFERENCE.theme} · {CONFERENCE.venue}
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-navy-foreground sm:text-4xl">
            {CONFERENCE.edition}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-navy-foreground/70">
            First-time setup — create the conference administrator account.
          </p>
        </div>
        <p className="mt-12 text-xs text-navy-foreground/50">
          This page is only available when no admin account exists yet.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h2 className="font-display text-2xl font-semibold">Conference setup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create the admin account to get started.
          </p>

          <form onSubmit={handleSetup} className="panel mt-6 space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Adaeze Okoro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nigeriancardiacsociety.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Create admin account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already set up?{" "}
            <Link to="/auth" className="text-primary underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
