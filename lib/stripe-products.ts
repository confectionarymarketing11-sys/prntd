export const stripeProductTypes = ["stickers", "business-cards", "shirts"] as const;

export type StripeProductType = (typeof stripeProductTypes)[number];

export type StripeCheckoutProduct = {
  type: StripeProductType;
  label: string;
  priceId: string;
  fulfillmentProductId: string;
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

export function getStripeCheckoutProductByPrice(priceId: string) {
  return Object.values(stripeCheckoutProducts).find((product) => product.priceId === priceId) ?? null;
}
