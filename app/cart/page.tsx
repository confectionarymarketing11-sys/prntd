"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ProductMockup from "@/components/ProductMockup";
import ShopHeader from "@/components/ShopHeader";
import {
  CART_STORAGE_KEY,
  CartItem,
  Customer,
  ORDERS_STORAGE_KEY,
  Order,
  SHIPPING_RATE,
  TAX_RATE,
  createOrderId,
  formatMoney,
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [status, setStatus] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totals = useMemo(() => {
    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const shipping = items.length > 0 ? SHIPPING_RATE : 0;
    const tax = roundMoney(subtotal * TAX_RATE);

    return {
      subtotal,
      shipping,
      tax,
      total: roundMoney(subtotal + shipping + tax),
    };
  }, [items]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[]);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateCustomer(field: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [field]: value }));
  }

  function updateQuantity(itemId: string, nextQuantity: number) {
    setItems((current) => {
      const updated = current.map((item) => {
        if (item.id !== itemId) return item;

        const product = getProduct(item.productId);
        const quantity = Math.max(product.minimumQuantity, nextQuantity);
        const price = priceDesign(product, quantity, item.frontLayers, item.backLayers);

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

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setStatus("Add a custom product before checking out.");
      return;
    }

    if (!customer.name || !customer.email || !customer.address) {
      setStatus("Name, email, and address are required.");
      return;
    }

    const order: Order = {
      id: createOrderId(),
      customer,
      items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      status: "New",
      paymentMode: "manual",
      createdAt: new Date().toISOString(),
    };

    const currentOrders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? "[]") as Order[];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...currentOrders]));
    localStorage.setItem("prntd_last_order", JSON.stringify(order));
    setIsCheckingOut(true);
    setStatus("Creating checkout...");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
      const data = (await response.json()) as { url?: string; mode?: "manual" | "stripe"; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }

      localStorage.removeItem(CART_STORAGE_KEY);
      window.location.href = data.url;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed");
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <ShopHeader />

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8">
        <div className="rounded border border-stone-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Cart</h1>
              <p className="text-sm text-stone-600">Review artwork, quantities, and print-ready pricing.</p>
            </div>
            <Link href="/designer" className="rounded border border-stone-300 px-4 py-2 text-center text-sm font-bold">
              Add another item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="mt-6 border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
              <p className="font-bold">Your cart is empty.</p>
              <Link href="/designer" className="mt-4 inline-block rounded bg-stone-950 px-5 py-3 text-sm font-bold text-white">
                Build a custom product
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {items.map((item) => {
                const product = getProduct(item.productId);

                return (
                  <article key={item.id} className="grid gap-4 rounded border border-stone-200 p-4 md:grid-cols-[190px_minmax(0,1fr)]">
                    <ProductMockup product={product} color={item.color.value} label={item.frontLayers[0]?.text ?? item.productName} />
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">{product.category}</p>
                          <h2 className="text-xl font-black">{item.productName}</h2>
                          <p className="mt-1 text-sm text-stone-600">
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
                            className="w-24 rounded border border-stone-300 px-3 py-2"
                          />
                        </label>
                        <span className="text-sm text-stone-600">{formatMoney(item.unitPrice)} each</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded border border-stone-300 px-3 py-2 text-sm font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleCheckout} className="rounded border border-stone-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-black">Checkout</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Orders are saved to the built-in order desk. Add a Stripe secret key later for hosted card payment.
          </p>

          <div className="mt-5 grid gap-3">
            <input
              value={customer.name}
              onChange={(event) => updateCustomer("name", event.target.value)}
              placeholder="Customer name"
              className="rounded border border-stone-300 px-3 py-2"
            />
            <input
              value={customer.email}
              onChange={(event) => updateCustomer("email", event.target.value)}
              placeholder="Email"
              type="email"
              className="rounded border border-stone-300 px-3 py-2"
            />
            <input
              value={customer.phone}
              onChange={(event) => updateCustomer("phone", event.target.value)}
              placeholder="Phone"
              className="rounded border border-stone-300 px-3 py-2"
            />
            <input
              value={customer.company}
              onChange={(event) => updateCustomer("company", event.target.value)}
              placeholder="Company"
              className="rounded border border-stone-300 px-3 py-2"
            />
            <input
              value={customer.address}
              onChange={(event) => updateCustomer("address", event.target.value)}
              placeholder="Shipping address"
              className="rounded border border-stone-300 px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={customer.city}
                onChange={(event) => updateCustomer("city", event.target.value)}
                placeholder="City"
                className="min-w-0 rounded border border-stone-300 px-3 py-2"
              />
              <input
                value={customer.region}
                onChange={(event) => updateCustomer("region", event.target.value)}
                placeholder="State"
                className="min-w-0 rounded border border-stone-300 px-3 py-2"
              />
            </div>
            <input
              value={customer.postal}
              onChange={(event) => updateCustomer("postal", event.target.value)}
              placeholder="ZIP / postal"
              className="rounded border border-stone-300 px-3 py-2"
            />
            <textarea
              value={customer.notes}
              onChange={(event) => updateCustomer("notes", event.target.value)}
              placeholder="Order notes"
              rows={4}
              className="rounded border border-stone-300 px-3 py-2"
            />
          </div>

          <div className="mt-5 grid gap-2 border-t border-stone-200 pt-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatMoney(totals.subtotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <strong>{formatMoney(totals.shipping)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Estimated tax</span>
              <strong>{formatMoney(totals.tax)}</strong>
            </div>
            <div className="mt-2 flex justify-between border-t border-stone-200 pt-4 text-xl">
              <span className="font-black">Total</span>
              <strong>{formatMoney(totals.total)}</strong>
            </div>
          </div>

          {status && <p className="mt-4 text-sm font-semibold text-cyan-800">{status}</p>}

          <button
            type="submit"
            disabled={isCheckingOut}
            className="mt-5 w-full rounded bg-cyan-700 px-5 py-3 text-sm font-black text-white transition hover:bg-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckingOut ? "Processing..." : "Place order"}
          </button>
        </form>
      </section>
    </main>
  );
}
