import { redirect } from "next/navigation";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminUser } from "@/features/admin/types/database";

export type CurrentAdmin = {
  id: string;
  email: string;
  profile: AdminUser;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  if (!hasSupabaseAdminConfig()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const adminSupabase = createSupabaseAdminClient();
  const { data: profile, error } = await adminSupabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle<AdminUser>();

  if (error || !profile) return null;

  return {
    id: user.id,
    email: user.email,
    profile,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
