import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Mail,
  QrCode,
  Search,
  Send,
  SendHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { BadgeDialog, type BadgeParticipant } from "@/components/BadgeDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CONFERENCE, type Category } from "@/lib/conference";
import { sendBadgeEmail } from "@/lib/badge-email.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delegate Desk | NCS 55th AGM & Scientific Conference" },
      {
        name: "description",
        content:
          "Issue QR badges by email and check delegates into the Nigerian Cardiac Society 55th Annual General Meeting and Scientific Conference.",
      },
      { property: "og:title", content: "Delegate Desk | NCS 55th AGM" },
      {
        property: "og:description",
        content: "QR badge issuing and venue check-in for NCS EKO 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Participant = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  category: Category;
  registration_code: string;
  qr_token: string;
  email_sent: boolean;
  email_sent_at: string | null;
  notes: string | null;
};

function Dashboard() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [badge, setBadge] = useState<BadgeParticipant | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, failed: 0, total: 0 });

  const participantsQuery = useQuery({
    queryKey: ["participants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("participants")
        .select(
          "id, full_name, email, phone, organisation, category, registration_code, qr_token, email_sent, email_sent_at, notes",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Participant[];
    },
  });

  const checkInsQuery = useQuery({
    queryKey: ["check-ins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("check_ins")
        .select("id, participant_id, checked_in_at")
        .order("checked_in_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const checkedInIds = useMemo(
    () => new Set((checkInsQuery.data ?? []).map((c) => c.participant_id)),
    [checkInsQuery.data],
  );

  const participants = useMemo(() => participantsQuery.data ?? [], [participantsQuery.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) =>
      [p.full_name, p.email, p.organisation ?? "", p.registration_code]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [participants, search]);

  const addMutation = useMutation({
    mutationFn: async (values: {
      full_name: string;
      email: string;
      phone: string;
      organisation: string;
      category: Category;
      notes: string;
    }) => {
      const { error } = await supabase.from("participants").insert({
        full_name: values.full_name,
        email: values.email.toLowerCase(),
        phone: values.phone || null,
        organisation: values.organisation || null,
        category: values.category,
        notes: values.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Participant registered");
      setAddOpen(false);
      void qc.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleSend(p: Participant) {
    setSendingId(p.id);
    try {
      const result = await sendBadgeEmail({
        data: { participantId: p.id, origin: window.location.origin },
      });
      if (result.sent) {
        toast.success(`Badge emailed to ${p.email}`);
      } else {
        toast.warning(result.message || "Email could not be sent");
      }
      void qc.invalidateQueries({ queryKey: ["participants"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send badge email");
    } finally {
      setSendingId(null);
    }
  }

  async function handleBulkSend() {
    const unsent = participants.filter((p) => !p.email_sent && p.email);
    if (unsent.length === 0) {
      toast.info("All participants have already been emailed.");
      return;
    }
    setBulkSending(true);
    setBulkProgress({ sent: 0, failed: 0, total: unsent.length });
    let sent = 0;
    let failed = 0;
    for (const p of unsent) {
      try {
        const result = await sendBadgeEmail({
          data: { participantId: p.id, origin: window.location.origin },
        });
        if (result.sent) sent++;
        else failed++;
      } catch {
        failed++;
      }
      setBulkProgress({ sent, failed, total: unsent.length });
    }
    setBulkSending(false);
    void qc.invalidateQueries({ queryKey: ["participants"] });
    toast.success(`Bulk send complete: ${sent} sent, ${failed} failed`);
  }

  const stats = [
    { label: "Registered", value: participants.length, icon: Users, color: "bg-primary/10 text-primary" },
    {
      label: "Badges sent",
      value: participants.filter((p) => p.email_sent).length,
      icon: Mail,
      color: "bg-success/10 text-success",
    },
    { label: "Checked in", value: checkedInIds.size, icon: CheckCircle2, color: "bg-accent text-accent-foreground" },
    { label: "Total scans", value: checkInsQuery.data?.length ?? 0, icon: QrCode, color: "bg-secondary text-secondary-foreground" },
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            {CONFERENCE.theme} · {CONFERENCE.venue}
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{CONFERENCE.edition}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            size="lg"
            disabled={bulkSending}
            onClick={() => void handleBulkSend()}
          >
            {bulkSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
            {bulkSending
              ? `Sending ${bulkProgress.sent + bulkProgress.failed}/${bulkProgress.total}…`
              : `Send all emails`}
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg">
                <UserPlus className="size-4" /> Add participant
              </Button>
            </DialogTrigger>
          <AddParticipantDialog
            pending={addMutation.isPending}
            onSubmit={(v) => addMutation.mutate(v)}
          />
        </Dialog>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <span className={`flex size-9 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold">Participants</h2>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, code…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead className="hidden md:table-cell">Organisation</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Loading participants…
                  </TableCell>
                </TableRow>
              )}
              {!participantsQuery.isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No participants yet. Add your first delegate to issue a QR badge.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-medium">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                    <p className="text-xs text-muted-foreground">{p.registration_code}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {p.organisation ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.email_sent ? (
                      <Badge variant="outline" className="border-primary/40 text-primary">
                        Emailed
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not sent</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {checkedInIds.has(p.id) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 className="size-3.5" /> Checked in
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not arrived</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setBadge(p)}>
                        <QrCode className="size-4" />
                        <span className="hidden lg:inline">Badge</span>
                      </Button>
                      <Button
                        size="sm"
                        disabled={sendingId === p.id}
                        onClick={() => void handleSend(p)}
                      >
                        {sendingId === p.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )}
                        <span className="hidden lg:inline">Send</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <BadgeDialog participant={badge} onOpenChange={(o) => !o && setBadge(null)} />
    </AppShell>
  );
}

function AddParticipantDialog({
  pending,
  onSubmit,
}: {
  pending: boolean;
  onSubmit: (v: {
    full_name: string;
    email: string;
    phone: string;
    organisation: string;
    category: Category;
    notes: string;
  }) => void;
}) {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organisation, setOrg] = useState("");
  const [category, setCategory] = useState<Category>("delegate");
  const [notes, setNotes] = useState("");

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Add participant</DialogTitle>
        <DialogDescription>
          A unique registration code and QR badge are generated automatically.
        </DialogDescription>
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ full_name, email, phone, organisation, category, notes });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="p-name">Full name</Label>
            <Input
              id="p-name"
              required
              value={full_name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email">Email</Label>
            <Input
              id="p-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-phone">Phone</Label>
            <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-org">Organisation</Label>
            <Input id="p-org" value={organisation} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="p-notes">Notes</Label>
            <Textarea
              id="p-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Save participant
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
