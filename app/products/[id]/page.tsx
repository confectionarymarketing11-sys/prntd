import { notFound, redirect } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ShopHeader from "@/components/ShopHeader";
import { shopProducts } from "@/data/shop";
import { getPublishedReviewsForProduct } from "@/features/reviews/data/reviews";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return shopProducts.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = shopProducts.find((item) => item.id === id);

  if (!product) notFound();

  if (product.category.toLowerCase() === "apparel") {
    redirect(`/designer?product=${encodeURIComponent(product.id)}`);
  }

  if (product.id === "business-cards") {
    redirect("/business-card-designer?product=business-cards");
  }

  const reviews = await getPublishedReviewsForProduct(product.id);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />
      <ProductDetail product={product} reviews={reviews} />
    </main>
  );
}
