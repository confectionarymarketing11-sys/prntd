import { signInAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { hasSupabaseConfig } from "@/lib/supabase";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = hasSupabaseConfig() && hasSupabaseAdminConfig();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-white">
      <Card className="w-full max-w-md border-white/10 bg-white text-slate-950 shadow-2xl">
        <CardHeader>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Internal fulfillment</p>
          <CardTitle className="text-3xl font-black">PRNTD Admin</CardTitle>
          <CardDescription>Sign in with a Supabase admin account to manage production.</CardDescription>
        </CardHeader>
        <CardContent>
          {!configured && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
              Supabase admin env vars are missing. Add `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
              `SUPABASE_SERVICE_ROLE_KEY`.
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              {error === "missing" ? "Email and password are required." : "Unable to sign in or admin access is not enabled."}
            </div>
          )}
          <form action={signInAdmin} className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <Input name="email" type="email" autoComplete="email" placeholder="admin@prntd.ca" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <Input name="password" type="password" autoComplete="current-password" />
            </label>
            <Button type="submit" disabled={!configured}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
