import AuthForm from "@/components/auth/AuthForm";
import ShopHeader from "@/components/ShopHeader";
import { redirectIfCustomerLoggedIn } from "@/lib/auth/customer";

export default async function SignupPage() {
  await redirectIfCustomerLoggedIn();

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <AuthForm mode="signup" />
    </main>
  );
}
