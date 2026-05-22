import AccountDesignGrid from "@/components/account/AccountDesignGrid";
import { fetchCustomerDesigns } from "@/lib/account/customer-data";
import { requireCustomerUser } from "@/lib/auth/customer";

export default async function AccountDesignsPage() {
  const user = await requireCustomerUser();
  const designs = await fetchCustomerDesigns(user.email ?? "");

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-[clamp(34px,4.2vw,56px)] font-black leading-none tracking-normal">Designs</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#6b7280]">Saved design assets tied to your authenticated account email.</p>
      </header>

      <AccountDesignGrid initialDesigns={designs} />
    </div>
  );
}
