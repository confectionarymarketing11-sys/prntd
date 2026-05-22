import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ShopHeader from "@/components/ShopHeader";
import { shopProducts } from "@/data/shop";

export function generateStaticParams() {
  return shopProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = shopProducts.find((item) => item.id === id);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <ProductDetail product={product} />
    </main>
  );
}
