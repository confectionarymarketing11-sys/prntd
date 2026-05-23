import Link from "next/link";
import { ImageIcon, Layers, Scissors, WandSparkles } from "lucide-react";
import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";

const tools = [
  {
    href: "/design-generator",
    title: "Design Creator",
    description: "Generate new print-ready ideas for shirts, cards, stickers, logos, and labels.",
    icon: WandSparkles,
  },
  {
    href: "/edit-design",
    title: "Image Editor",
    description: "Upload an image and apply AI edits using your account credits.",
    icon: ImageIcon,
  },
  {
    href: "/background-remover",
    title: "Background Remover",
    description: "Remove image backgrounds for cleaner print files and product mockups.",
    icon: Scissors,
  },
  {
    href: "/my-designs",
    title: "Saved Designs",
    description: "Review saved designs and send artwork back into your product workflow.",
    icon: Layers,
  },
];

export default function DesignToolsPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8">
        <PortalSidebar />
        <div className="grid gap-6">
          <div className="rounded-[30px] border border-white/70 bg-white p-8 shadow-[0_12px_38px_rgba(0,0,0,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4f46e5]">Design tools</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Create and prepare artwork</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#6b7280]">
              Generate new designs, edit images, remove backgrounds, and manage saved artwork from one account-connected workspace.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-[26px] border border-white/70 bg-white p-6 text-[#111827] no-underline shadow-[0_10px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef2ff] text-[#4f46e5] transition group-hover:bg-[#4f46e5] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-2xl font-black tracking-[-0.03em]">{tool.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
