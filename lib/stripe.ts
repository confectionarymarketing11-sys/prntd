import Stripe from "stripe";
import { getEnv } from "@/lib/env";

const stripeClients = new Map<string, Stripe>();

export function getStripe(options?: { testMode?: boolean }) {
  const useTestKey = Boolean(options?.testMode && process.env.STRIPE_TEST_SECRET_KEY);
  const keyName = useTestKey ? "STRIPE_TEST_SECRET_KEY" : "STRIPE_SECRET_KEY";
  const key = getEnv(keyName);
  const cacheKey = `${keyName}:${key.slice(-8)}`;

  if (!stripeClients.has(cacheKey)) {
    stripeClients.set(
      cacheKey,
      new Stripe(key, {
        apiVersion: "2026-04-22.dahlia",
      })
    );
  }

  return stripeClients.get(cacheKey)!;
}

export function getStripeWebhookSecret(options?: { testMode?: boolean }) {
  if (options?.testMode && process.env.STRIPE_TEST_WEBHOOK_SECRET) {
    return getEnv("STRIPE_TEST_WEBHOOK_SECRET");
  }

  return getEnv("STRIPE_WEBHOOK_SECRET");
}
