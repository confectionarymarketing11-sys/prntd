"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthToken } from "@/lib/prntdClient";

type PrntdAccountSession = {
  email: string;
  token: string;
  user: User;
};

export function usePrntdAccount() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("Loading your account...");
  const [isLoading, setIsLoading] = useState(true);

  const redirectToLogin = useCallback(() => {
    const next = pathname || "/dashboard";
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  }, [pathname]);

  const loadAccount = useCallback(async (): Promise<PrntdAccountSession | null> => {
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !authUser?.email) {
        setStatus("Sign in to continue.");
        redirectToLogin();
        return null;
      }

      const normalizedEmail = authUser.email.trim().toLowerCase();
      const nextToken = await getAuthToken(normalizedEmail);

      setEmail(normalizedEmail);
      setToken(nextToken);
      setUser(authUser);
      setStatus(`Signed in as ${normalizedEmail}`);

      return {
        email: normalizedEmail,
        token: nextToken,
        user: authUser,
      };
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load your account.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAccount();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAccount]);

  return {
    email,
    token,
    user,
    status,
    isLoading,
    loadAccount,
  };
}
