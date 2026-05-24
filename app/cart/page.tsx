"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Truck,
} from "lucide-react";

import ProductMockup from "@/components/ProductMockup";
import ShopHeader from "@/components/ShopHeader";
import { usePrntdAccount } from "@/hooks/usePrntdAccount";
import {
  loadCartItems,
  saveCartItems,
} from "@/lib/cart-storage";

import { trackStorefrontEvent } from "@/lib/storefront-analytics";

import {
  CART_STORAGE_KEY,
  CartItem,
  Customer,
  Order,
  ProductPricing,
  findPricingVariant,
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
  const { email, status: accountStatus } =
    usePrntdAccount();

  const [items, setItems] = useState<
    CartItem[]
  >([]);

  const [customer, setCustomer] =
    useState<Customer>(emptyCustomer);

  const [status, setStatus] =
    useState("");

  const [isCheckingOut, setIsCheckingOut] =
    useState(false);

  const [discountCode, setDiscountCode] =
    useState("");

  const [discountPreview, setDiscountPreview] =
    useState<{
      code: string | null;
      title: string | null;
      discountAmount: number;
      shippingDiscount: number;
      message?: string | null;
    } | null>(null);

  const shippingMethods = useMemo(
    () => getAvailableShippingMethods(items),
    [items],
  );

  const [shippingMethod, setShippingMethod] =
    useState("tracked");

  const [testModeEnabled, setTestModeEnabled] =
    useState(false);

  const [adminPricing, setAdminPricing] =
    useState<
      Record<string, ProductPricing>
    >({});

  const baseTotals = useMemo(() => {
    const subtotal = roundMoney(
      items.reduce(
        (sum, item) => sum + item.lineTotal,
        0,
      ),
    );

    const selectedShipping =
      shippingMethods.find(
        (method) =>
          method.code === shippingMethod,
      ) ?? shippingMethods[0];

    const shipping =
      items.length > 0
        ? selectedShipping?.price ??
          SHIPPING_RATE
        : 0;

    return {
      subtotal,
      shipping,
    };
  }, [items, shippingMethod, shippingMethods]);

  const totals = useMemo(() => {
    const discountAmount = roundMoney(
      discountPreview?.discountAmount ?? 0,
    );

    const shippingDiscount = roundMoney(
      discountPreview?.shippingDiscount ??
        0,
    );

    const discountedSubtotal = Math.max(
      baseTotals.subtotal -
        discountAmount,
      0,
    );

    const discountedShipping = Math.max(
      baseTotals.shipping -
        shippingDiscount,
      0,
    );

    return {
      subtotal: baseTotals.subtotal,
      shipping: discountedShipping,
      tax: 0,
      discountAmount,
      shippingDiscount,
      total: roundMoney(
        discountedSubtotal +
          discountedShipping,
      ),
    };
  }, [baseTotals, discountPreview]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCartItems()
        .then(setItems)
        .catch(() =>
          setItems(
            JSON.parse(
              localStorage.getItem(
                CART_STORAGE_KEY,
              ) ?? "[]",
            ) as CartItem[],
          ),
        );
    }, 0);

    return () =>
      window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!items.length) return;

    trackStorefrontEvent(
      "reached_checkout",
      {
        item_count: items.length,
        subtotal: baseTotals.subtotal,
      },
    );
  }, [items.length, baseTotals.subtotal]);

  useEffect(() => {
    fetch("/api/products/pricing")
      .then((response) =>
        response.json(),
      )
      .then(
        (
          pricing: Record<
            string,
            ProductPricing
          >,
        ) => {
          setAdminPricing(pricing);
        },
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((response) =>
        response.json(),
      )
      .then(
        (
          settings: {
            test_mode_enabled?: boolean;
          },
        ) => {
          setTestModeEnabled(
            Boolean(
              settings.test_mode_enabled,
            ),
          );
        },
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!email) return;

    setCustomer((current) => ({
      ...current,
      email,
    }));
  }, [email]);

  function updateCustomer(
    field: keyof Customer,
    value: string,
  ) {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateQuantity(
    itemId: string,
    nextQuantity: number,
  ) {
    setItems((current) => {
      const updated = current.map(
        (item) => {
          if (item.id !== itemId)
            return item;

          const product = getProduct(
            item.productId,
          );

          const quantity = Math.max(
            product.minimumQuantity,
            nextQuantity,
          );

          const adminBasePrice =
            adminPricing[item.productId]
              ?.price;

          const pricedProduct =
            typeof adminBasePrice ===
              "number" &&
            adminBasePrice > 0
              ? {
                  ...product,
                  basePrice:
                    adminBasePrice,
                }
              : product;

          const price = priceDesign(
            pricedProduct,
            quantity,
            item.frontLayers,
            item.backLayers,
          );

          return {
            ...item,
            quantity,
            unitPrice: price.unitPrice,
            lineTotal: price.lineTotal,
          };
        },
      );

      void saveCartItems(updated);

      return updated;
    });
  }

  function removeItem(itemId: string) {
    setItems((current) => {
      const updated = current.filter(
        (item) => item.id !== itemId,
      );

      void saveCartItems(updated);

      return updated;
    });
  }

  async function applyDiscount() {
    if (!items.length) return;

    try {
      const response = await fetch(
        "/api/discounts/preview",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            code: discountCode,
            customerEmail: email,
            subtotal:
              baseTotals.subtotal,
            shipping:
              baseTotals.shipping,
            items: items.map(
              (item) => ({
                productId:
                  item.productId,
                quantity:
                  item.quantity,
                lineTotal:
                  item.lineTotal,
              }),
            ),
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Discount failed",
        );
      }

      setDiscountPreview(data);

      setStatus(
        data.message ??
          "Discount applied.",
      );
    } catch (error) {
      setDiscountPreview(null);

      setStatus(
        error instanceof Error
          ? error.message
          : "Discount failed",
      );
    }
  }

  async function handleCheckout(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!items.length) {
      setStatus(
        "Add a product before checkout.",
      );

      return;
    }

    const checkoutEmail =
      email || customer.email;

    if (
      !customer.name ||
      !checkoutEmail ||
      !customer.address
    ) {
      setStatus(
        "Name, email, and shipping address are required.",
      );

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
      discountCode:
        discountCode || undefined,
      discountAmount:
        totals.discountAmount,
      shippingDiscount:
        totals.shippingDiscount,
      shippingMethod:
        shippingMethod as Order["shippingMethod"],
      status: "New",
      paymentMode: "stripe",
      createdAt:
        new Date().toISOString(),
    };

    setIsCheckingOut(true);

    try {
      const response = await fetch(
        "/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(order),
        },
      );

      const data =
        await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ??
            "Checkout failed",
        );
      }

      localStorage.removeItem(
        CART_STORAGE_KEY,
      );

      window.location.href =
        data.url;
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Checkout failed",
      );

      setIsCheckingOut(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

        <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
      </div>

      <div className="relative z-10">
        <ShopHeader />

        <section className="mx-auto grid w-full max-w-[1700px] gap-6 px-5 py-8 pb-20 xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* LEFT */}
          <div className="rounded-[38px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#312e81_100%)] p-8">
              <div className="absolute right-[-5%] top-[-5%] h-[240px] w-[240px] rounded-full bg-[#8b5cf6]/20 blur-[100px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Checkout
                </div>

                <h1 className="mt-7 text-[clamp(52px,6vw,92px)] font-black leading-[0.92] tracking-[-0.06em]">
                  Finalize
                  <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                    Your Order
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-9 text-[#cbd5e1]">
                  Review premium products,
                  artwork previews,
                  shipping options, and
                  Stripe-secured checkout.
                </p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="mt-6 grid gap-5">
              {items.map((item) => {
                const product = getProduct(
                  item.productId,
                );

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition duration-300 hover:border-[#6366f1]/30 hover:shadow-[0_25px_70px_rgba(99,102,241,0.12)]"
                  >
                    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white">
                        {item.mockupPreview ? (
                          <img
                            src={
                              item.mockupPreview
                            }
                            alt={
                              item.productName
                            }
                            className="aspect-square w-full object-contain p-4"
                          />
                        ) : (
                          <ProductMockup
                            product={product}
                            color={
                              item.color.value
                            }
                            label={
                              item
                                .frontLayers[0]
                                ?.text ??
                              item.productName
                            }
                          />
                        )}
                      </div>

                      <div className="flex flex-col justify-between gap-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                              {
                                product.category
                              }
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">
                              {
                                item.productName
                              }
                            </h2>

                            <p className="mt-4 text-sm leading-7 text-[#cbd5e1]">
                              {
                                item.size
                              }{" "}
                              •{" "}
                              {
                                item.color
                                  .name
                              }
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[38px] font-black leading-none">
                              {formatMoney(
                                item.lineTotal,
                              )}
                            </p>

                            <p className="mt-2 text-sm text-[#94a3b8]">
                              {formatMoney(
                                item.unitPrice,
                              )}{" "}
                              each
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black">
                            Qty

                            <input
                              type="number"
                              min={
                                product.minimumQuantity
                              }
                              value={
                                item.quantity
                              }
                              onChange={(
                                event,
                              ) =>
                                updateQuantity(
                                  item.id,
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                              className="w-24 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-white"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id,
                              )
                            }
                            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <form
            onSubmit={handleCheckout}
            className="sticky top-5 h-fit overflow-hidden rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)] p-7 shadow-[0_35px_120px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
                  Stripe Protected
                </p>

                <h2 className="mt-3 text-[42px] font-black leading-[0.95] tracking-[-0.04em]">
                  Checkout
                </h2>
              </div>

              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] shadow-[0_15px_50px_rgba(99,102,241,0.45)]">
                <CreditCard className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-7 rounded-[26px] border border-white/10 bg-white/[0.05] p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                Customer Account
              </p>

              <p className="mt-3 break-all text-lg font-black">
                {email
                  ? email
                  : `Guest checkout (${accountStatus})`}
              </p>
            </div>

            {/* FORM */}
            <div className="mt-7 grid gap-4">
              {[
                [
                  "name",
                  "Full Name",
                ],
                [
                  "phone",
                  "Phone Number",
                ],
                [
                  "company",
                  "Company",
                ],
                [
                  "address",
                  "Shipping Address",
                ],
                ["city", "City"],
                [
                  "region",
                  "Province / State",
                ],
                [
                  "postal",
                  "Postal Code",
                ],
              ].map(
                ([
                  key,
                  placeholder,
                ]) => (
                  <input
                    key={key}
                    value={
                      customer[
                        key as keyof Customer
                      ] as string
                    }
                    onChange={(
                      event,
                    ) =>
                      updateCustomer(
                        key as keyof Customer,
                        event.target
                          .value,
                      )
                    }
                    placeholder={
                      placeholder
                    }
                    className="h-[58px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white placeholder:text-[#64748b]"
                  />
                ),
              )}

              {!email && (
                <input
                  value={
                    customer.email
                  }
                  onChange={(
                    event,
                  ) =>
                    updateCustomer(
                      "email",
                      event.target.value,
                    )
                  }
                  type="email"
                  placeholder="Email Address"
                  className="h-[58px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white placeholder:text-[#64748b]"
                />
              )}

              <textarea
                value={customer.notes}
                onChange={(event) =>
                  updateCustomer(
                    "notes",
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Order Notes"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white placeholder:text-[#64748b]"
              />
            </div>

            {/* SHIPPING */}
            <div className="mt-7">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#818cf8]" />

                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                  Shipping
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                {shippingMethods.map(
                  (method) => (
                    <label
                      key={method.code}
                      className={`cursor-pointer rounded-[22px] border p-5 transition ${
                        shippingMethod ===
                        method.code
                          ? "border-[#6366f1]/40 bg-[#312e81]/30"
                          : "border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <input
                            type="radio"
                            checked={
                              shippingMethod ===
                              method.code
                            }
                            onChange={() =>
                              setShippingMethod(
                                method.code,
                              )
                            }
                            className="mt-1"
                          />

                          <div>
                            <span className="block text-sm font-black">
                              {
                                method.name
                              }
                            </span>

                            <span className="mt-1 block text-xs leading-6 text-[#94a3b8]">
                              {
                                method.description
                              }
                            </span>
                          </div>
                        </div>

                        <strong className="text-sm">
                          {formatMoney(
                            method.price,
                          )}
                        </strong>
                      </div>
                    </label>
                  ),
                )}
              </div>
            </div>

            {/* DISCOUNT */}
            <div className="mt-7">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">
                Discount Code
              </p>

              <div className="mt-3 flex gap-3">
                <input
                  value={discountCode}
                  onChange={(event) =>
                    setDiscountCode(
                      event.target.value,
                    )
                  }
                  placeholder="SAVE10"
                  className="h-[56px] min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white placeholder:text-[#64748b]"
                />

                <button
                  type="button"
                  onClick={
                    applyDiscount
                  }
                  className="rounded-2xl bg-white px-5 text-sm font-black text-[#111827]"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* TOTALS */}
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <div className="grid gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">
                    Subtotal
                  </span>

                  <strong>
                    {formatMoney(
                      totals.subtotal,
                    )}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">
                    Shipping
                  </span>

                  <strong>
                    {formatMoney(
                      totals.shipping,
                    )}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">
                    Tax
                  </span>

                  <strong>
                    Calculated by Stripe
                  </strong>
                </div>

                <div className="mt-4 flex justify-between border-t border-white/10 pt-5 text-[28px] font-black">
                  <span>Total</span>

                  <strong>
                    {formatMoney(
                      totals.total,
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {status && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[#cbd5e1]">
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={isCheckingOut}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-[24px] bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-5 text-lg font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1 disabled:opacity-50"
            >
              {isCheckingOut
                ? "Opening Stripe..."
                : "Checkout Securely"}

              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}