import AccountShell from "@/components/account/AccountShell";
import { requireCustomerUser } from "@/lib/auth/customer";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomerUser();

  return <AccountShell email={user.email ?? "customer"}>{children}</AccountShell>;
}
