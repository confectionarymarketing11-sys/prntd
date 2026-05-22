import ProductCatalog from "@/components/ProductCatalog";
import ShopHeader from "@/components/ShopHeader";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <ShopHeader />
      <ProductCatalog />
    </main>
  );
}
