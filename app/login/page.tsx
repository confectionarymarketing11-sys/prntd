import AuthForm from "@/components/auth/AuthForm";
import ShopHeader from "@/components/ShopHeader";
import { redirectIfCustomerLoggedIn } from "@/lib/auth/customer";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; message?: string }> }) {
  await redirectIfCustomerLoggedIn();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <AuthForm mode="login" nextPath={params.next ?? "/account"} initialMessage={params.message ?? ""} />
    </main>
  );
}
