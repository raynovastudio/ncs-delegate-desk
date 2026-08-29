import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CONFERENCE } from "@/lib/conference";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Team sign in | NCS EKO 2026 Delegate Desk" },
      {
        name: "description",
        content:
          "Secure sign in for Nigerian Cardiac Society conference staff managing delegate badges and venue check-in.",
      },
      { property: "og:title", content: "Team sign in | NCS EKO 2026 Delegate Desk" },
      {
        property: "og:description",
        content: "Secure sign in for NCS 55th AGM conference staff.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your inbox if confirmation is required.");
    navigate({ to: "/" });
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
            Delegate desk for issuing QR badges by email and checking participants into the venue
            with a live scanner.
          </p>
        </div>
        <p className="mt-12 text-xs text-navy-foreground/50">
          Restricted to accredited conference secretariat staff.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h2 className="font-display text-2xl font-semibold">Delegate desk access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your secretariat account to continue.
          </p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="panel mt-4 space-y-4 p-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="secretariat@nigeriancardiacsociety.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="panel mt-4 space-y-4 p-5">
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
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Password</Label>
                  <Input
                    id="password2"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />} Create account
                </Button>
                <p className="text-xs text-muted-foreground">
                  The first account created becomes the conference administrator. Later accounts
                  need to be granted access by an administrator.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
