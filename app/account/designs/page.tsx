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

      {designs.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {designs.map((design) => (
            <article key={design.path} className="rounded-[28px] border border-white/70 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
              <div className="rounded-3xl bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0px] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={design.url} alt={design.prompt || "Saved design"} className="aspect-square w-full rounded-2xl object-contain" />
              </div>
              <h2 className="mt-4 text-lg font-black">{design.product_type || "Saved Design"}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6b7280]">{design.prompt || "No prompt saved."}</p>
              <a href={design.url} download className="design-main-btn">
                Download
              </a>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_10px_28px_rgba(0,0,0,0.045)]">
          <p className="text-lg font-black">No saved designs found.</p>
          <p className="mt-2 text-[#6b7280]">Create a design with the Design Creator and it will appear here when linked to this email.</p>
        </section>
      )}
    </div>
  );
}
