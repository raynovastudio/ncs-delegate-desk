import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, ScanLine } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CONFERENCE } from "@/lib/conference";
import { signOut } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan & check-in", icon: ScanLine },
] as const;

export function AppShell({ children, email }: { children: ReactNode; email?: string | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-navy grid-lines sticky top-0 z-40 border-b border-sidebar-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-navy-foreground/10 ring-1 ring-navy-foreground/20 overflow-hidden">
              <img src="/Logo.png" alt="NCS Logo" className="size-8 object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-semibold tracking-tight text-navy-foreground">
                {CONFERENCE.society}
              </span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-navy-foreground/60">
                {CONFERENCE.theme} · Delegate desk
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 rounded-full bg-navy-foreground/10 p-1">
              {NAV.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-navy-foreground text-navy"
                        : "text-navy-foreground/75 hover:text-navy-foreground",
                    )}
                  >
                    <item.icon className="size-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
              className="text-navy-foreground/75 hover:bg-navy-foreground/10 hover:text-navy-foreground"
              title={email ?? undefined}
            >
              <LogOut className="size-4" />
              <span className="hidden lg:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
