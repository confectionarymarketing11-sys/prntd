import { createReviewAction, updateReviewStatusAction } from "@/features/reviews/actions/reviews";
import { getReviews } from "@/features/reviews/data/reviews";
import { shopProducts } from "@/data/shop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Reviews</h1>
        <p className="mt-2 text-sm text-slate-500">Create and moderate customer reviews before publishing them to product pages.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Add Customer Review</CardTitle></CardHeader>
        <CardContent>
          <form action={createReviewAction} className="grid gap-3 md:grid-cols-2">
            <Input name="customerName" placeholder="Customer name" />
            <Input name="customerEmail" placeholder="Customer email" type="email" />
            <select name="productId" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">All products</option>
              {shopProducts.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
            <select name="rating" defaultValue="5" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
            <Input name="title" placeholder="Review title" className="md:col-span-2" />
            <Textarea name="body" rows={4} placeholder="Review body" className="md:col-span-2" />
            <select name="status" defaultValue="published" className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="hidden">Hidden</option>
            </select>
            <Button type="submit" className="w-fit">Add Review</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Review Queue</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {reviews.length ? reviews.map((review) => (
            <article key={review.id} className="grid gap-3 rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black">{review.title || `${review.rating}/5 review`}</p>
                  <p className="text-sm text-slate-500">
                    {review.customer_name || review.customer_email || "Anonymous"} · {review.product_id || "All products"} · {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={review.status === "published" ? "success" : "secondary"}>{review.status}</Badge>
              </div>
              <p className="text-sm leading-6 text-slate-700">{review.body}</p>
              <form action={updateReviewStatusAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="reviewId" value={review.id} />
                <select name="status" defaultValue={review.status} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                  <option value="flagged">Flagged</option>
                </select>
                <Button type="submit" size="sm">Save</Button>
              </form>
            </article>
          )) : <p className="text-sm text-slate-500">No reviews yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
