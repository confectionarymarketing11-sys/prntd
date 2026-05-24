import Link from "next/link";

import {
  ImageIcon,
  Layers,
  Scissors,
  WandSparkles,
} from "lucide-react";

import PortalSidebar from "@/components/PortalSidebar";
import ShopHeader from "@/components/ShopHeader";

const tools = [
  {
    href: "/design-generator",
    title: "Design Creator",
    description:
      "Generate new print-ready ideas for shirts, cards, stickers, logos, and labels.",
    icon: WandSparkles,
  },
  {
    href: "/edit-design",
    title: "Image Editor",
    description:
      "Upload an image and apply AI-powered edits using your creator credits.",
    icon: ImageIcon,
  },
  {
    href: "/background-remover",
    title: "Background Remover",
    description:
      "Remove image backgrounds for cleaner print files and product mockups.",
    icon: Scissors,
  },
  {
    href: "/my-designs",
    title: "Saved Designs",
    description:
      "Review saved artwork and continue your product workflow instantly.",
    icon: Layers,
  },
];

export default function DesignToolsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* BG */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8">
          {/* SIDEBAR */}
          <PortalSidebar />

          {/* CONTENT */}
          <div className="grid gap-6">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e1b4b_100%)] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:p-10">
              <div className="absolute right-[-10%] top-[-20%] h-[280px] w-[280px] rounded-full bg-[#6366f1]/20 blur-[90px]" />

              <div className="relative z-10">
                <p className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                  Design Tools
                </p>

                <h1 className="mt-5 text-[clamp(42px,5vw,74px)] font-black leading-[0.95] tracking-[-0.06em]">
                  Create &
                  <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                    Prepare Artwork
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[#cbd5e1]">
                  Generate new designs,
                  edit images, remove
                  backgrounds, and manage
                  saved artwork from one
                  creator workspace.
                </p>
              </div>
            </div>

            {/* TOOL GRID */}
            <div className="grid gap-5 md:grid-cols-2">
              {tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0f172a]/80 p-7 text-white no-underline shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  >
                    {/* GLOW */}
                    <div className="absolute right-[-20%] top-[-20%] h-[180px] w-[180px] rounded-full bg-[#6366f1]/10 blur-[70px] transition group-hover:bg-[#6366f1]/20" />

                    <div className="relative z-10">
                      <span className="grid h-14 w-14 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] shadow-[0_12px_40px_rgba(99,102,241,0.35)]">
                        <Icon className="h-6 w-6 text-white" />
                      </span>

                      <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-white">
                        {tool.title}
                      </h2>

                      <p className="mt-4 text-sm leading-7 text-[#cbd5e1]">
                        {tool.description}
                      </p>

                      <div className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[#a5b4fc]">
                        Open Tool
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}