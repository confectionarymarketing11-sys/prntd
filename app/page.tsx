import PrntdToolsLanding from "@/components/PrntdToolsLanding";
import ShopHeader from "@/components/ShopHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <ShopHeader />
      <PrntdToolsLanding />
    </main>
  );
}
