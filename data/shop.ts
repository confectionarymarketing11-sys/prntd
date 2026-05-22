export type PrintSide = "front" | "back";

export type DesignLayer = {
  id: string;
  type: "image" | "text";
  preview?: string;
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

export type ProductColor = {
  name: string;
  value: string;
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
  },
  {
    id: "die-cut-stickers",
    name: "Die Cut Stickers",
    category: "Stickers",
    description: "Weather-resistant vinyl stickers for packaging and promos.",
    basePrice: 8,
    productionDays: "2-4 days",
    sizes: ['2"', '3"', '4"', '5"'],
    colors: [
      { name: "Matte", value: "#f5f1e8" },
      { name: "Gloss", value: "#ffffff" },
      { name: "Clear", value: "#d9edf7" },
    ],
    printAreas: ["front"],
    minimumQuantity: 10,
  },
  {
    id: "business-cards",
    name: "Business Cards",
    category: "Business Cards",
    description: "Premium custom business cards with front and back design support.",
    basePrice: 32,
    productionDays: "3-5 days",
    sizes: ["Standard", "Square", "Mini"],
    colors: [
      { name: "Matte", value: "#f7f3ea" },
      { name: "Gloss", value: "#ffffff" },
      { name: "Soft Touch", value: "#eef2ff" },
      { name: "Black", value: "#111827" },
    ],
    printAreas: ["front", "back"],
    minimumQuantity: 50,
  },
];

export const CART_STORAGE_KEY = "prntd_cart";
export const ORDERS_STORAGE_KEY = "prntd_orders";
export const SAVED_DESIGN_STORAGE_KEY = "prntd_saved_design";

export const SHIPPING_RATE = 8.95;
export const TAX_RATE = 0.0825;

export function getProduct(productId: string) {
  return shopProducts.find((product) => product.id === productId) ?? shopProducts[0];
}

export function priceDesign(product: Product, quantity: number, frontLayers: DesignLayer[], backLayers: DesignLayer[]) {
  const sidesUsed = [frontLayers.length > 0, backLayers.length > 0].filter(Boolean).length;
  const setupFee = sidesUsed * 5;
  const detailFee = (frontLayers.length + backLayers.length) * 1.5;
  const bulkDiscount = quantity >= 25 ? 0.82 : quantity >= 12 ? 0.9 : quantity >= 6 ? 0.95 : 1;
  const unitPrice = (product.basePrice + setupFee + detailFee) * bulkDiscount;

  return {
    unitPrice: roundMoney(unitPrice),
    lineTotal: roundMoney(unitPrice * quantity),
  };
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function createOrderId() {
  return `PRNTD-${Date.now().toString(36).toUpperCase()}`;
}
