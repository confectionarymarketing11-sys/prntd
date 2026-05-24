"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ShopHeader from "@/components/ShopHeader";
import { Order, formatMoney } from "@/data/shop";
import { trackStorefrontEvent } from "@/lib/storefront-analytics";

export default function SuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const rawOrder = localStorage.getItem("prntd_last_order");

      if (rawOrder) {
        const parsedOrder = JSON.parse(rawOrder) as Order;
        setOrder(parsedOrder);
        trackStorefrontEvent("checkout_completed", {
          order_id: parsedOrder.id,
          total: parsedOrder.total,
          item_count: parsedOrder.items.length,
        });
      } else {
        const params = new URLSearchParams(window.location.search);
        trackStorefrontEvent("checkout_completed", {
          order_id: params.get("order"),
          mode: params.get("mode"),
        });
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <ShopHeader />
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-700">Order received</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Your print order is in the queue.</h1>
          <p className="mt-3 max-w-2xl text-stone-600">
            A production proof can be prepared from the saved artwork and order notes. You can track it from the order desk.
          </p>

          {order ? (
            <div className="mt-6 grid gap-4 border-t border-stone-200 pt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-600">Order number</p>
                  <p className="text-xl font-black">{order.id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-stone-600">Total</p>
                  <p className="text-xl font-black">{formatMoney(order.total)}</p>
                </div>
              </div>
              <div className="grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 border-t border-stone-100 pt-3 text-sm">
                    <span>
                      {item.quantity} x {item.productName}
                    </span>
                    <strong>{formatMoney(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 border-t border-stone-200 pt-6 text-sm font-semibold text-stone-600">
              No recent order was found in this browser.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/admin" className="rounded bg-stone-950 px-5 py-3 text-sm font-bold text-white">
              Open order desk
            </Link>
            <Link href="/designer" className="rounded border border-stone-300 px-5 py-3 text-sm font-bold">
              Start another order
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
