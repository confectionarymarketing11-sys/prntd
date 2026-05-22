"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PasswordUpdateForm() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setPassword("");
      setMessage("Password updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={updatePassword} className="grid gap-3">
      <label className="grid gap-2">
        <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#6b7280]">New Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          className="portal-field"
          type="password"
          autoComplete="new-password"
        />
      </label>
      <button type="submit" disabled={isSaving} className="design-main-btn !mt-0">
        {isSaving ? "Saving..." : "Update Password"}
      </button>
      {message && <p className="rounded-[16px] bg-[#eef2ff] px-4 py-3 text-sm font-bold text-[#4338ca]">{message}</p>}
    </form>
  );
}
