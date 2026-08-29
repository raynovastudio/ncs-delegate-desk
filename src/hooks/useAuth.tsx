import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export type TeamRole = "admin" | "staff";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setRolesLoaded(!userId && !loading);
      return;
    }
    let active = true;
    setRolesLoaded(false);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!active) return;
        setRoles((data ?? []).map((r) => r.role as TeamRole));
        setRolesLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [userId, loading]);

  return {
    session,
    user: (session?.user ?? null) as User | null,
    loading,
    roles,
    rolesLoaded,
    isAdmin: roles.includes("admin"),
    isTeam: roles.length > 0,
  };
}

export function useRequireTeam() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && !auth.session) {
      navigate({ to: "/auth" });
    }
  }, [auth.loading, auth.session, navigate]);

  return auth;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/auth";
}
