import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Review = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  product_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  status: "pending" | "published" | "hidden" | "flagged";
  source: string;
  created_at: string;
};

export async function getReviews() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(100);

  if (error?.code === "42P01") return [] as Review[];
  if (error) throw new Error(error.message);

  return (data ?? []) as Review[];
}

export async function getPublishedReviewsForProduct(productId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, title, body, status, source, product_id, created_at")
    .eq("status", "published")
    .or(`product_id.eq.${productId},product_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error?.code === "42P01") return [] as Review[];
  if (error) throw new Error(error.message);

  return (data ?? []) as Review[];
}

export async function getPublishedReviewSummary() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .eq("status", "published");

  if (error?.code === "42P01") return new Map<string, { count: number; average: number }>();
  if (error) throw new Error(error.message);

  const totals = new Map<string, { count: number; sum: number }>();

  for (const review of data ?? []) {
    const productId = String((review as { product_id?: string | null }).product_id || "all");
    const current = totals.get(productId) ?? { count: 0, sum: 0 };
    current.count += 1;
    current.sum += Number((review as { rating?: number }).rating ?? 0);
    totals.set(productId, current);
  }

  return new Map(
    Array.from(totals.entries()).map(([productId, value]) => [
      productId,
      {
        count: value.count,
        average: value.count ? value.sum / value.count : 0,
      },
    ])
  );
}

export async function updateReviewStatus(reviewId: string, status: Review["status"]) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("reviews").update({ status, updated_at: new Date().toISOString() }).eq("id", reviewId);
  if (error) throw new Error(error.message);
}

export async function createReview(input: {
  productId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  rating: number;
  title?: string | null;
  body: string;
  status: Review["status"];
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("reviews").insert({
    product_id: input.productId || null,
    customer_name: input.customerName || null,
    customer_email: input.customerEmail || null,
    rating: input.rating,
    title: input.title || null,
    body: input.body,
    status: input.status,
    source: "admin",
  });

  if (error) throw new Error(error.message);
}
