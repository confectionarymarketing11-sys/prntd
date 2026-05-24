"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ProductMockup from "@/components/ProductMockup";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";
import { trackStorefrontEvent } from "@/lib/storefront-analytics";
import {
  CART_STORAGE_KEY,
  CartItem,
  Customer,
  Order,
  SHIPPING_RATE,
  createOrderId,
  formatMoney,
  getAvailableShippingMethods,
  getProduct,
  priceDesign,
  roundMoney,
} from "@/data/shop";

const emptyCustomer: Customer = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  city: "",
  region: "",
  postal: "",
  notes: "",
};

export default function CartPage() {
  const { email, status: accountStatus } = usePrntdAccount();
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [status, setStatus] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPreview, setDiscountPreview] = useState<{
    code: string | null;
    title: string | null;
    discountAmount: number;
    shippingDiscount: number;
    message?: string | null;
  } | null>(null);
  const shippingMethods = useMemo(() => getAvailableShippingMethods(items), [items]);
  const [shippingMethod, setShippingMethod] = useState("tracked");
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [adminPricing, setAdminPricing] = useState<Record<string, { price?: number }>>({});

  const baseTotals = useMemo(() => {
    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const selectedShipping = shippingMethods.find((method) => method.code === shippingMethod) ?? shippingMethods[0];
    const shipping = items.length > 0 ? selectedShipping?.price ?? SHIPPING_RATE : 0;

    return {
      subtotal,
      shipping,
    };
  }, [items, shippingMethod, shippingMethods]);

  const totals = useMemo(() => {
    const discountAmount = roundMoney(discountPreview?.discountAmount ?? 0);
    const shippingDiscount = roundMoney(discountPreview?.shippingDiscount ?? 0);
    const discountedSubtotal = Math.max(baseTotals.subtotal - discountAmount, 0);
    const discountedShipping = Math.max(baseTotals.shipping - shippingDiscount, 0);

    return {
      subtotal: baseTotals.subtotal,
      shipping: discountedShipping,
      tax: 0,
      discountAmount,
      shippingDiscount,
      total: roundMoney(discountedSubtotal + discountedShipping),
    };
  }, [baseTotals, discountPreview]);

  useEffect(() => {
    if (!shippingMethods.length) return;
    if (!shippingMethods.some((method) => method.code === shippingMethod)) {
      const timer = window.setTimeout(() => {
        setShippingMethod(shippingMethods[0].code);
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [shippingMethod, shippingMethods]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!items.length) return;

    trackStorefrontEvent("reached_checkout", {
      item_count: items.length,
      subtotal: baseTotals.subtotal,
    });
  }, [items.length, baseTotals.subtotal]);

  useEffect(() => {
    let active = true;

    fetch("/api/products/pricing")
      .then((response) => response.json())
      .then((pricing: Record<string, { price?: number }>) => {
        if (active) setAdminPricing(pricing);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/site-settings")
      .then((response) => response.json())
      .then((settings: { test_mode_enabled?: boolean }) => {
        if (active) setTestModeEnabled(Boolean(settings.test_mode_enabled));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!email) return;
    const timer = window.setTimeout(() => {
      setCustomer((current) => ({ ...current, email }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [email]);

  function updateCustomer(field: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function updateQuantity(itemId: string, nextQuantity: number) {
    setItems((current) => {
      const updated = current.map((item) => {
        if (item.id !== itemId) return item;

        const product = getProduct(item.productId);
        const quantity = Math.max(product.minimumQuantity, nextQuantity);
        const adminBasePrice = adminPricing[item.productId]?.price;
        const pricedProduct = typeof adminBasePrice === "number" && adminBasePrice > 0 ? { ...product, basePrice: adminBasePrice } : product;
        const frontHasArt = item.frontLayers.some((layer) => layer.type === "image" || Boolean(layer.text?.trim()));
        const backHasArt = item.backLayers.some((layer) => layer.type === "image" || Boolean(layer.text?.trim()));
        const price =
          item.productId === "classic-tee"
            ? (() => {
                const basePrice = (adminBasePrice ?? item.unitPrice) + (frontHasArt && backHasArt ? 10 : 0);
                const discount = quantity >= 6 ? 20 : quantity >= 2 ? 11 : 0;
                const unitPrice = Math.max(basePrice - discount, 0);
                return { unitPrice, lineTotal: roundMoney(unitPrice * quantity) };
              })()
            : priceDesign(pricedProduct, quantity, item.frontLayers, item.backLayers);

        return {
          ...item,
          quantity,
          unitPrice: price.unitPrice,
          lineTotal: price.lineTotal,
        };
      });

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function removeItem(itemId: string) {
    setItems((current) => {
      const updated = current.filter((item) => item.id !== itemId);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  async function applyDiscount() {
    if (!items.length) {
      setStatus("Add an item before applying a discount.");
      return;
    }

    setStatus("Checking discount...");

    try {
      const response = await fetch("/api/discounts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode,
          customerEmail: email,
          subtotal: baseTotals.subtotal,
          shipping: baseTotals.shipping,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        }),
      });
      const data = (await response.json()) as {
        code: string | null;
        title: string | null;
        discountAmount: number;
        shippingDiscount: number;
        message?: string | null;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? "Discount failed");

      setDiscountPreview(data);
      setStatus(data.message ?? (data.title ? `${data.title} applied.` : "No eligible discount found."));
    } catch (error) {
      setDiscountPreview(null);
      setStatus(error instanceof Error ? error.message : "Discount failed");
    }
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setStatus("Add a custom product before checking out.");
      return;
    }

    const checkoutEmail = email || customer.email;

    if (!customer.name || !checkoutEmail || !customer.address) {
      setStatus("Name, email, and shipping address are required.");
      return;
    }

    const order: Order = {
      id: createOrderId(),
      customer: {
        ...customer,
        email: checkoutEmail,
      },
      items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      discountCode: discountCode || undefined,
      discountAmount: totals.discountAmount,
      shippingDiscount: totals.shippingDiscount,
      shippingMethod: shippingMethod as Order["shippingMethod"],
      status: "New",
      paymentMode: "stripe",
      createdAt: new Date().toISOString(),
    };
    setIsCheckingOut(true);
    setStatus(testModeEnabled ? "Creating a no-payment test order..." : "Creating secure Stripe checkout...");
    trackStorefrontEvent("reached_checkout", {
      checkout_submit: true,
      item_count: items.length,
      total: totals.total,
      test_mode: testModeEnabled,
    });

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
      const data = (await response.json()) as { url?: string; mode?: "manual" | "stripe" | "test"; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }

      localStorage.setItem("prntd_pending_cart", JSON.stringify(order));
      localStorage.setItem("prntd_last_order", JSON.stringify(order));
      localStorage.removeItem(CART_STORAGE_KEY);
      window.location.href = data.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed");
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <ShopHeader />

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 pb-20 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[30px] border border-white/70 bg-white p-5 shadow-[0_12px_38px_rgba(0,0,0,0.06)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[clamp(34px,4vw,54px)] font-black leading-none tracking-normal">Checkout</h1>
              <p className="mt-2 text-sm text-[#6b7280]">Review artwork mockups, quantities, and Stripe-ready pricing.</p>
            </div>
            <Link href="/products" className="portal-action text-center">
              Add another item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-[#c7d2fe] bg-[#f8faff] p-8 text-center">
              <p className="font-bold">Your cart is empty.</p>
              <Link href="/products" className="design-main-btn mx-auto max-w-xs">
                Choose a product
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {items.map((item) => {
                const product = getProduct(item.productId);

                return (
                  <article key={item.id} className="grid gap-4 rounded-[24px] border border-[#e7eaf3] bg-[#fbfcff] p-4 md:grid-cols-[190px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-[20px] border border-white/80 bg-white">
                      {item.mockupPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.mockupPreview} alt={`${item.productName} customizer mockup`} className="aspect-square w-full object-contain p-4" />
                      ) : (
                        <ProductMockup product={product} color={item.color.value} label={item.frontLayers[0]?.text ?? item.productName} />
                      )}
                    </div>
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4f46e5]">{product.category}</p>
                          <h2 className="text-xl font-black">{item.productName}</h2>
                          <p className="mt-1 text-sm text-[#6b7280]">
                            {item.size} / {item.color.name} / {item.frontLayers.length} front layers / {item.backLayers.length} back layers
                          </p>
                        </div>
                        <p className="text-lg font-black">{formatMoney(item.lineTotal)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm font-bold">
                          Qty
                          <input
                            type="number"
                            min={product.minimumQuantity}
                            value={item.quantity}
                            onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                            className="w-24 rounded-[14px] border border-[#dbe0ea] px-3 py-2"
                          />
                        </label>
                        <span className="text-sm text-[#6b7280]">{formatMoney(item.unitPrice)} each</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-[14px] border border-red-500/15 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      {testModeEnabled && (item.frontPreview || item.backPreview) && (
                        <div className="rounded-[18px] border border-dashed border-blue-400 bg-white p-3">
                          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-blue-700">
                            Test Mode Print Files
                          </p>
                          <p className="mt-1 text-xs text-[#6b7280]">
                            These clipped mask previews are uploaded to the uploads bucket when checkout runs.
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {item.frontPreview && (
                              <div className="rounded-[14px] border border-blue-200 bg-[#f8faff] p-2">
                                <span className="mb-2 block text-xs font-bold text-blue-700">Front clipped area</span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.frontPreview} alt="Front clipped print file" className="aspect-video w-full rounded-[10px] border border-dashed border-blue-300 object-contain p-2" />
                              </div>
                            )}
                            {item.backPreview && (
                              <div className="rounded-[14px] border border-blue-200 bg-[#f8faff] p-2">
                                <span className="mb-2 block text-xs font-bold text-blue-700">Back clipped area</span>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.backPreview} alt="Back clipped print file" className="aspect-video w-full rounded-[10px] border border-dashed border-blue-300 object-contain p-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleCheckout} className="h-fit rounded-[30px] border border-white/70 bg-white p-5 shadow-[0_12px_38px_rgba(0,0,0,0.06)] sm:p-6 lg:sticky lg:top-5">
          <h2 className="text-2xl font-black">Secure Stripe Checkout</h2>
          <p className="mt-1 text-sm leading-6 text-[#6b7280]">
            {testModeEnabled
              ? "Test mode is on. This creates a paid test order with no money collected."
              : "Your order is finalized only after Stripe confirms payment."}
          </p>
          {testModeEnabled && (
            <div className="mt-4 rounded-[18px] border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900">
              Internal test checkout is active. Use it to verify clipped artwork, packing, and shipping before launch.
            </div>
          )}
          <div className="mt-4 rounded-[20px] bg-[#eef2ff] p-4 text-sm font-semibold text-[#4338ca]">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em]">Customer Account</p>
            <p className="mt-1 break-all">{email ? email : `Guest checkout (${accountStatus})`}</p>
          </div>

          <div className="mt-5 grid gap-3">
            <input
              value={customer.name}
              onChange={(event) => updateCustomer("name", event.target.value)}
              placeholder="Customer name"
              className="portal-field"
            />
            {!email && (
              <input
                value={customer.email}
                onChange={(event) => updateCustomer("email", event.target.value)}
                placeholder="Email for order confirmation"
                type="email"
                className="portal-field"
              />
            )}
            <input
              value={customer.phone}
              onChange={(event) => updateCustomer("phone", event.target.value)}
              placeholder="Phone"
              className="portal-field"
            />
            <input
              value={customer.company}
              onChange={(event) => updateCustomer("company", event.target.value)}
              placeholder="Company"
              className="portal-field"
            />
            <input
              value={customer.address}
              onChange={(event) => updateCustomer("address", event.target.value)}
              placeholder="Shipping address"
              className="portal-field"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={customer.city}
                onChange={(event) => updateCustomer("city", event.target.value)}
                placeholder="City"
                className="portal-field min-w-0"
              />
              <input
                value={customer.region}
                onChange={(event) => updateCustomer("region", event.target.value)}
                placeholder="State"
                className="portal-field min-w-0"
              />
            </div>
            <input
              value={customer.postal}
              onChange={(event) => updateCustomer("postal", event.target.value)}
              placeholder="ZIP / postal"
              className="portal-field"
            />
            <textarea
              value={customer.notes}
              onChange={(event) => updateCustomer("notes", event.target.value)}
              placeholder="Order notes"
              rows={4}
              className="portal-field"
            />
          </div>

          <div className="mt-5 grid gap-2 border-t border-[#e7eaf3] pt-5 text-sm">
            <div className="grid gap-2 rounded-[18px] bg-[#f8faff] p-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#4f46e5]">Shipping method</p>
              {shippingMethods.map((method) => (
                <label key={method.code} className="flex cursor-pointer items-start justify-between gap-3 rounded-[14px] border border-[#e7eaf3] bg-white p-3">
                  <span className="flex gap-2">
                    <input
                      type="radio"
                      checked={shippingMethod === method.code}
                      onChange={() => setShippingMethod(method.code)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-black">{method.name}</span>
                      <span className="block text-xs leading-5 text-[#6b7280]">{method.description}</span>
                    </span>
                  </span>
                  <strong>{formatMoney(method.price)}</strong>
                </label>
              ))}
            </div>
            <div className="grid gap-2 rounded-[18px] bg-[#f8faff] p-3">
              <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#4f46e5]">Discount code</label>
              <div className="flex gap-2">
                <input
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  placeholder="SAVE10"
                  className="portal-field min-w-0 flex-1"
                />
                <button type="button" onClick={applyDiscount} className="rounded-[16px] bg-[#111827] px-4 text-sm font-bold text-white">
                  Apply
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatMoney(totals.subtotal)}</strong>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <strong>-{formatMoney(totals.discountAmount)}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <strong>{formatMoney(totals.shipping)}</strong>
            </div>
            {totals.shippingDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Shipping discount</span>
                <strong>-{formatMoney(totals.shippingDiscount)}</strong>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <strong>Calculated by Stripe</strong>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#e7eaf3] pt-4 text-xl">
              <span className="font-black">Total</span>
              <strong>{formatMoney(totals.total)}</strong>
            </div>
          </div>

          {status && <p className="mt-4 rounded-[16px] bg-[#f8faff] px-4 py-3 text-sm font-semibold text-[#4338ca]">{status}</p>}

          <button
            type="submit"
            disabled={isCheckingOut}
            className="design-main-btn disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckingOut ? (testModeEnabled ? "Creating Test Order..." : "Opening Stripe...") : testModeEnabled ? "Place Test Order" : "Checkout With Stripe"}
          </button>
        </form>
      </section>
    </main>
  );
}
