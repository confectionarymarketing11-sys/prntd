export const stripeProductTypes = ["stickers", "business-cards", "shirts"] as const;
export const checkoutProductTypes = ["stickers", "business-cards", "shirts", "credits"] as const;
export const creditTopUpPackIds = ["credits_25", "credits_50", "credits_100"] as const;

export type StripeProductType = (typeof stripeProductTypes)[number];
export type CheckoutProductType = (typeof checkoutProductTypes)[number];
export type CreditTopUpPackId = (typeof creditTopUpPackIds)[number];

export type StripeCheckoutProduct = {
  type: StripeProductType;
  label: string;
  priceId: string;
  fulfillmentProductId: string;
};

export const subscriptionCreditGrants: Record<string, number> = {
  starter: 15,
  pro: 40,
  business: 85,
};

export const subscriptionQrLimits: Record<string, number> = {
  none: 0,
  starter: 1,
  pro: 5,
  business: 10,
};

export const trialCreditGrant = 10;

export const creditTopUpPacks: Record<
  CreditTopUpPackId,
  {
    id: CreditTopUpPackId;
    label: string;
    credits: number;
    amountCents: number;
    currency: "cad";
    productId: string;
  }
> = {
  credits_25: {
    id: "credits_25",
    label: "25 Credits",
    credits: 25,
    amountCents: 700,
    currency: "cad",
    productId: "top-up-credits",
  },
  credits_50: {
    id: "credits_50",
    label: "50 Credits",
    credits: 50,
    amountCents: 1100,
    currency: "cad",
    productId: "top-up-credits",
  },
  credits_100: {
    id: "credits_100",
    label: "100 Credits",
    credits: 100,
    amountCents: 1900,
    currency: "cad",
    productId: "top-up-credits",
  },
};

export const stripeCheckoutProducts: Record<StripeProductType, StripeCheckoutProduct> = {
  stickers: {
    type: "stickers",
    label: "Custom Stickers",
    priceId: "price_1TZsaDD2DvSztXsd4EI2s2L2",
    fulfillmentProductId: "die-cut-stickers",
  },
  "business-cards": {
    type: "business-cards",
    label: "Custom Business Cards",
    priceId: "price_1TZsZ3D2DvSztXsd6GBlrjgc",
    fulfillmentProductId: "business-cards",
  },
  shirts: {
    type: "shirts",
    label: "Custom Shirts",
    priceId: "price_1TZsX8D2DvSztXsdADOtqAgR",
    fulfillmentProductId: "classic-tee",
  },
};

export function getStripeCheckoutProduct(type: StripeProductType) {
  return stripeCheckoutProducts[type];
}

export function getCreditTopUpPack(id: CreditTopUpPackId) {
  return creditTopUpPacks[id];
}

export function getStripeCheckoutProductByPrice(priceId: string) {
  return Object.values(stripeCheckoutProducts).find((product) => product.priceId === priceId) ?? null;
}

export function inferSubscriptionTier(value: string | null | undefined) {
  const normalized = (value ?? "").toLowerCase();

  if (normalized.includes("business")) return "business";
  if (normalized.includes("pro")) return "pro";
  if (normalized.includes("starter")) return "starter";

  return "none";
}
