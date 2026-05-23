"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/data/auth";
import { createReview, updateReviewStatus } from "@/features/reviews/data/reviews";
import type { Review } from "@/features/reviews/data/reviews";

export async function updateReviewStatusAction(formData: FormData) {
  await requireAdmin();

  const reviewId = String(formData.get("reviewId") ?? "");
  const status = String(formData.get("status") ?? "pending") as Review["status"];

  if (!reviewId) throw new Error("Missing review id.");

  await updateReviewStatus(reviewId, status);
  revalidatePath("/admin/reviews");
}

export async function createReviewAction(formData: FormData) {
  await requireAdmin();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) throw new Error("Review body is required.");

  await createReview({
    productId: String(formData.get("productId") ?? "").trim() || null,
    customerName: String(formData.get("customerName") ?? "").trim() || null,
    customerEmail: String(formData.get("customerEmail") ?? "").trim() || null,
    rating: Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5) || 5)),
    title: String(formData.get("title") ?? "").trim() || null,
    body,
    status: String(formData.get("status") ?? "published") as Review["status"],
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/products");
}
