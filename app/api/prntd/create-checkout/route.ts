import { z } from "zod";
import { apiJson, withApiErrorHandling } from "@/lib/api-response";
import { corsPreflight } from "@/lib/cors";
import { getStripe } from "@/lib/stripe";
import { getStripeCheckoutProduct, stripeProductTypes } from "@/lib/stripe-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  productType: z.enum(stripeProductTypes),
  quantity: z.coerce.number().int().positive().max(1000),
  customerEmail: z.string().trim().email().optional(),
  customization: z.record(z.string(), z.unknown()).optional(),
  successPath: z.string().trim().startsWith("/").optional(),
  cancelPath: z.string().trim().startsWith("/").optional(),
});

function getOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  return request.headers.get("origin") || `${requestUrl.protocol}//${requestUrl.host}`;
}

function compactMetadataValue(value: unknown) {
  const serialized = JSON.stringify(value ?? {});
  return serialized.length > 450 ? serialized.slice(0, 450) : serialized;
}

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    const input = checkoutSchema.parse(await request.json());
    const product = getStripeCheckoutProduct(input.productType);
    const origin = getOrigin(request);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: product.priceId,
          quantity: input.quantity,
        },
      ],
      customer_email: input.customerEmail,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["CA", "US"],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        product_type: product.type,
        product_id: product.fulfillmentProductId,
        product_name: product.label,
        quantity: String(input.quantity),
        customization: compactMetadataValue(input.customization),
      },
      success_url: `${origin}${input.successPath ?? "/success"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${input.cancelPath ?? "/products"}`,
    });

    return apiJson(request, {
      url: session.url,
      sessionId: session.id,
    });
  });
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request, "POST, OPTIONS");
}
