export type PrintSide = "front" | "back";

export type DesignLayer = {
  id: string;
  type: "image" | "text";
  preview?: string;
  originalPreview?: string;
  previewKey?: string;
  originalPreviewKey?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
};

export type ShippingMethodCode = "lettermail" | "tracked" | "local_pickup";

export type ShippingMethod = {
  code: ShippingMethodCode;
  name: string;
  description: string;
  price: number;
  requiresTracking: boolean;
  freeOver?: number;
};

export type ProductColor = {
  name: string;
  value: string;
};

export type FixedPriceVariant = {
  label: string;
  quantity: number;
  size: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  productionDays: string;
  sizes: string[];
  colors: ProductColor[];
  printAreas: PrintSide[];
  minimumQuantity: number;
  mockupImage?: string;
  stickerVariants?: FixedPriceVariant[];
  businessCardVariants?: FixedPriceVariant[];
};

export type ProductPricingVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  currency: string;
  inventory_quantity: number;
  active: boolean;
  options: Record<string, string>;
};

export type ProductPricing = {
  price: number;
  currency: string;
  variants?: ProductPricingVariant[];
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  size: string;
  color: ProductColor;
  quantity: number;
  frontLayers: DesignLayer[];
  backLayers: DesignLayer[];
  mockupPreview?: string | null;
  frontPreview?: string | null;
  backPreview?: string | null;
  mockupPreviewKey?: string | null;
  frontPreviewKey?: string | null;
  backPreviewKey?: string | null;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  notes: string;
};

export type Order = {
  id: string;
  customer: Customer;
  items: CartItem[];
  discountCode?: string;
  discountAmount?: number;
  shippingDiscount?: number;
  shippingMethod?: ShippingMethodCode;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "New" | "Proofing" | "In production" | "Ready" | "Completed";
  paymentMode: "manual" | "stripe";
  createdAt: string;
};

export const shopProducts: Product[] = [
  {
    id: "classic-tee",
    name: "Classic Tee",
    category: "Apparel",
    description: "Everyday cotton tee for merch drops, crews, and events.",
    basePrice: 24,
    productionDays: "3-5 days",
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    colors: [
      { name: "Black", value: "#111111" },
      { name: "White", value: "#f7f3ea" },
      { name: "Cobalt", value: "#2454d6" },
      { name: "Clay", value: "#b64b38" },
    ],
    printAreas: ["front", "back"],
    minimumQuantity: 1,
    mockupImage: "/mockups/newclassic-tee.png",
  },
  {
  id: "die-cut-stickers",
  name: "Die Cut Stickers",
  category: "Stickers",
  description:
    "Weather-resistant premium vinyl stickers with vibrant full-color printing.",
  basePrice: 0,

  stickerVariants: [
    { label: '25 Stickers - 2"', quantity: 25, size: '2"', price: 7.74 },
    { label: '50 Stickers - 2"', quantity: 50, size: '2"', price: 10.06 },
    { label: '100 Stickers - 2"', quantity: 100, size: '2"', price: 18.05 },
    { label: '25 Stickers - 3"', quantity: 25, size: '3"', price: 7.73 },
    { label: '50 Stickers - 3"', quantity: 50, size: '3"', price: 15.47 },
    { label: '100 Stickers - 3"', quantity: 100, size: '3"', price: 25.79 },
  ],

  colors: [
    {
      name: "Glossy",
      value: "#ffffff",
    },
    {
      name: "Matte",
      value: "#f7f3ea",
    },
  ],

  sizes: ['2"', '3"'],

  minimumQuantity: 25,

  printAreas: ["front"],

  mockupImage: "/mockups/stickers.png",

  productionDays: "2-4 Business Days",
},
  {
    id: "business-cards",
    name: "Business Cards",
    category: "Business Cards",
    description: "Premium custom business cards with front and back design support.",
    basePrice: 23.86,
    productionDays: "3-5 days",
    sizes: ["Sample", "50", "100", "250"],
    colors: [
      { name: "Matte", value: "#f7f3ea" },
      { name: "Gloss", value: "#ffffff" },
    ],
    printAreas: ["front", "back"],
    minimumQuantity: 1,
    mockupImage: "/mockups/business-cards.png",
    businessCardVariants: [
      { label: "Sample Non Custom", quantity: 1, size: "Sample", price: 2.57 },
      { label: "50 Business Cards", quantity: 50, size: "Standard", price: 23.86 },
      { label: "100 Business Cards", quantity: 100, size: "Standard", price: 33.53 },
      { label: "250 Business Cards", quantity: 250, size: "Standard", price: 44.5 },
    ],
  },
];

export const CART_STORAGE_KEY = "prntd_cart";
export const ORDERS_STORAGE_KEY = "prntd_orders";
export const SAVED_DESIGN_STORAGE_KEY = "prntd_saved_design";

export const SHIPPING_RATE = 8.95;
export const TAX_RATE = 0.0825;

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    code: "lettermail",
    name: "Lettermail",
    description: "Economy shipping for business cards and stickers.",
    price: 2.95,
    requiresTracking: false,
    freeOver: 75,
  },
  {
    code: "tracked",
    name: "Tracked Shipping",
    description: "Tracked parcel shipping for apparel and mixed carts.",
    price: 10.95,
    requiresTracking: true,
    freeOver: 125,
  },
  {
    code: "local_pickup",
    name: "Local Pickup",
    description: "Pick up locally when your order is ready.",
    price: 0,
    requiresTracking: false,
  },
];

export function getProduct(productId: string) {
  return shopProducts.find((product) => product.id === productId) ?? shopProducts[0];
}

export function priceDesign(
  product: Product,
  quantity: number,
  frontLayers: DesignLayer[],
  backLayers: DesignLayer[],
) {
  const sidesUsed = [
    frontLayers.length > 0,
    backLayers.length > 0,
  ].filter(Boolean).length;

  const setupFee =
  product.id ===
  "die-cut-stickers"
    ? 0
    : sidesUsed * 5;

const detailFee =
  product.id ===
  "die-cut-stickers"
    ? 0
    : (frontLayers.length +
        backLayers.length) *
      1.5;

  /**
   * BUSINESS CARDS
   * Tier pricing
   */
  if (
    product.id ===
    "business-cards"
  ) {
    const tiers = product.businessCardVariants ?? [];

    const matchedTier =
      tiers.find(
        (tier) =>
          tier.quantity ===
          quantity,
      ) ??
      tiers.find((tier) => tier.quantity === 50) ??
      tiers[0] ?? {
        quantity,
        price: product.basePrice,
      };

    const total =
      matchedTier.price;

    return {
      unitPrice:
        roundMoney(
          total /
            matchedTier.quantity,
        ),

      lineTotal:
        roundMoney(total),

      printType:
        sidesUsed > 1
          ? "Double-sided custom"
          : sidesUsed > 0
            ? "Single-sided custom"
            : "Non-custom",
    };
  }

  if (product.id === "die-cut-stickers") {
    const matchedVariant =
      product.stickerVariants?.find((variant) => variant.quantity === quantity) ??
      product.stickerVariants?.[0];

    const total = matchedVariant?.price ?? product.basePrice;

    return {
      unitPrice: roundMoney(total / (matchedVariant?.quantity ?? quantity)),
      lineTotal: roundMoney(total),
      printType: matchedVariant?.label ?? "Sticker pack",
    };
  }

  /**
   * DEFAULT PRODUCTS
   * Shirts/stickers/etc
   */
  const bulkDiscount =
    quantity >= 25
      ? 0.82
      : quantity >= 12
        ? 0.9
        : quantity >= 6
          ? 0.95
          : 1;

  const unitPrice =
    (product.basePrice +
      setupFee +
      detailFee) *
    bulkDiscount;

  return {
    unitPrice:
      roundMoney(
        unitPrice,
      ),

    lineTotal:
      roundMoney(
        unitPrice *
          quantity,
      ),

    printType:
      quantity >= 25
        ? "Bulk Production"
        : "Standard Production",
  };
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

export function getVariantOption(variant: ProductPricingVariant, optionName: string) {
  const normalizedOptionName = optionName.trim().toLowerCase();
  const match = Object.entries(variant.options).find(([name]) => name.trim().toLowerCase() === normalizedOptionName);

  return match?.[1] ?? "";
}

export function findPricingVariant(pricing: ProductPricing | undefined, optionName: string, optionValue: string) {
  const normalizedOptionValue = optionValue.trim().toLowerCase();

  return pricing?.variants?.find((variant) => variant.active && getVariantOption(variant, optionName).trim().toLowerCase() === normalizedOptionValue);
}

function normalizedVariantText(variant: ProductPricingVariant) {
  return [
    variant.title,
    variant.sku,
    ...Object.entries(variant.options).flatMap(([name, value]) => [name, value]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function variantLabel(variant: ProductPricingVariant) {
  if (variant.title && variant.title !== "Default Title") {
    return variant.title;
  }

  return (
    getVariantOption(variant, "Quantity") ||
    getVariantOption(variant, "Pack") ||
    getVariantOption(variant, "Size") ||
    getVariantOption(variant, "Cards") ||
    getVariantOption(variant, "Credits") ||
    "Default Title"
  );
}

function parseQuantityFromLabel(label: string) {
  if (label.toLowerCase().includes("sample")) return 1;

  const match = label.match(/\b(\d{1,5})\b/);

  return match ? Number(match[1]) : 1;
}

function parseSizeFromLabel(label: string) {
  const match = label.match(/\b(\d+(?:\.\d+)?)\s*"/);

  return match ? `${match[1]}"` : label;
}

export function fixedPriceVariantsFromPricing(
  productId: string,
  pricing: ProductPricing | undefined,
  fallback: FixedPriceVariant[] = [],
) {
  const variants = pricing?.variants
    ?.filter((variant) => variant.active && variant.price > 0)
    .filter((variant) => !normalizedVariantText(variant).includes("design fee"))
    .map((variant) => {
      const label = variantLabel(variant);

      return {
        label,
        quantity: parseQuantityFromLabel(label),
        size: productId === "die-cut-stickers" ? parseSizeFromLabel(label) : label,
        price: variant.price,
      };
    });

  return variants?.length ? variants : fallback;
}

export function displayPriceFromPricing(product: Product, pricing: ProductPricing | undefined) {
  const variantPrice = fixedPriceVariantsFromPricing(
    product.id,
    pricing,
    product.id === "die-cut-stickers" ? product.stickerVariants : product.businessCardVariants,
  )
    .filter((variant) => variant.price > 0)
    .sort((a, b) => a.price - b.price)[0]?.price;

  return variantPrice ?? pricing?.price ?? product.basePrice;
}

export function getAvailableShippingMethods(items: CartItem[]) {
  if (!items.length) return [];

  const hasApparel = items.some((item) => item.productId === "classic-tee");
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const allowed = SHIPPING_METHODS.filter((method) => {
    if (method.code === "lettermail" && hasApparel) return false;
    return true;
  });

  return allowed.map((method) => ({
    ...method,
    price: method.freeOver && subtotal >= method.freeOver ? 0 : method.price,
  }));
}

export function createOrderId() {
  return `PRNTD-${Date.now().toString(36).toUpperCase()}`;
}
