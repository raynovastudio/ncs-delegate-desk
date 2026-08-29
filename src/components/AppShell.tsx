import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ScanLine } from "lucide-react";
import type { ReactNode } from "react";

import { CONFERENCE } from "@/lib/conference";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scan", label: "Scan & check-in", icon: ScanLine },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="surface-navy grid-lines sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 overflow-hidden">
              <img src="/Logo.png" alt="NCS Logo" className="size-9 object-contain" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-sm font-bold tracking-tight text-white">
                {CONFERENCE.society}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
                {CONFERENCE.theme} · Delegate Desk
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-2xl bg-white/10 p-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    active
                      ? "bg-white text-[#1a1a2e] shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <item.icon className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
