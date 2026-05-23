import { z } from "zod";
import { ApiError, apiJson, withApiErrorHandling } from "@/lib/api-response";
import { getCurrentCustomer, getOrCreateCustomerForEmail } from "@/lib/auth/customer";
import { corsPreflight } from "@/lib/cors";
import { getStripe } from "@/lib/stripe";
import { getSiteSettings } from "@/features/site-settings/data/site-settings";
import { getStripeCheckoutProduct, stripeProductTypes } from "@/lib/stripe-products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  productType: z.enum(stripeProductTypes),
  quantity: z.coerce.number().int().positive().max(1000),
  customerEmail: z.string().trim().email().optional(),
  productId: z.string().trim().max(120).optional(),
  uploadIds: z.array(z.string().trim().max(120)).max(20).optional(),
  designReferences: z.array(z.string().trim().max(500)).max(20).optional(),
  pricingContext: z.record(z.string(), z.unknown()).optional(),
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

async function createOrReuseStripeCustomer(input: {
  email: string;
  name?: string | null;
  authUserId?: string | null;
  platformCustomerId?: string | null;
  existingStripeCustomerId?: string | null;
}) {
  const settings = await getSiteSettings();
  const stripe = getStripe({ testMode: settings.test_mode_enabled });

  if (input.existingStripeCustomerId && !settings.test_mode_enabled) {
    return input.existingStripeCustomerId;
  }

  const existing = await stripe.customers.list({
    email: input.email,
    limit: 1,
  });

  if (existing.data[0]) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email: input.email,
    name: input.name ?? undefined,
    metadata: {
      auth_user_id: input.authUserId ?? "",
      platform_customer_id: input.platformCustomerId ?? "",
      source: "prntd_next",
    },
  });

  return customer.id;
}

export async function POST(request: Request) {
  return withApiErrorHandling(request, async () => {
    const input = checkoutSchema.parse(await request.json());
    const product = getStripeCheckoutProduct(input.productType);
    const origin = getOrigin(request);
    const settings = await getSiteSettings();
    const stripe = getStripe({ testMode: settings.test_mode_enabled });
    const authenticated = await getCurrentCustomer();
    const email = authenticated?.user.email ?? input.customerEmail;

    if (!email) {
      throw new ApiError("Customer email is required.", 400, "customer_email_required");
    }

    const platformCustomer = authenticated?.customer ?? (await getOrCreateCustomerForEmail({ email }));
    const stripeCustomerId = await createOrReuseStripeCustomer({
      email,
      name: platformCustomer.name,
      authUserId: authenticated?.user.id ?? platformCustomer.auth_user_id,
      platformCustomerId: platformCustomer.id,
      existingStripeCustomerId: platformCustomer.stripe_customer_id,
    });

    const customer = await getOrCreateCustomerForEmail({
      email,
      authUserId: authenticated?.user.id ?? platformCustomer.auth_user_id,
      name: platformCustomer.name,
      stripeCustomerId,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: product.priceId,
          quantity: input.quantity,
        },
      ],
      customer: stripeCustomerId,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["CA", "US"],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        customer_id: customer.id,
        auth_user_id: authenticated?.user.id ?? customer.auth_user_id ?? "",
        stripe_customer_id: stripeCustomerId,
        test_mode: settings.test_mode_enabled ? "true" : "false",
        product_type: product.type,
        product_id: input.productId ?? product.fulfillmentProductId,
        product_name: product.label,
        quantity: String(input.quantity),
        pricing_context: compactMetadataValue(input.pricingContext),
        upload_ids: compactMetadataValue(input.uploadIds),
        design_references: compactMetadataValue(input.designReferences),
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
