import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCustomerUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireCustomerUser() {
  const user = await getCustomerUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return user;
}

export async function redirectIfCustomerLoggedIn() {
  const user = await getCustomerUser();

  if (user) {
    redirect("/account");
  }
}
