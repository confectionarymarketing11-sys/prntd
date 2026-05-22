"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button type="button" onClick={logout} className="rounded-[18px] border border-red-500/15 bg-red-50 px-4 py-3 text-sm font-extrabold text-red-700">
      Logout
    </button>
  );
}
