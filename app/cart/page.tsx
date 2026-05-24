return (
  <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
    <ShopHeader />

    {/* BACKGROUND */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />
      <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
    </div>

    <section className="relative z-10 mx-auto grid w-full max-w-[1700px] gap-6 px-5 py-8 pb-20 xl:grid-cols-[minmax(0,1fr)_460px]">
      {/* CART */}
      <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        {/* HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#818cf8]">
              Secure Checkout
            </p>

            <h1 className="mt-3 text-[clamp(42px,5vw,72px)] font-black leading-[0.95] tracking-[-0.05em]">
              Finalize
              <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                Your Order
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-8 text-[#cbd5e1]">
              Review premium print products, artwork previews,
              shipping options, and secure Stripe checkout.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-black text-white no-underline transition hover:bg-white/[0.08]"
          >
            Add More Products
          </Link>
        </div>

        {/* EMPTY */}
        {items.length === 0 ? (
          <div className="mt-8 grid min-h-[400px] place-items-center rounded-[32px] border border-dashed border-[#6366f1]/30 bg-[#0f172a]/60 p-10 text-center">
            <div>
              <h2 className="text-3xl font-black">
                Your Cart Is Empty
              </h2>

              <p className="mt-4 text-[#94a3b8]">
                Add products before checkout.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-4 text-sm font-black text-white no-underline shadow-[0_15px_50px_rgba(99,102,241,0.35)]"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {items.map((item) => {
              const product = getProduct(item.productId);

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-5 transition duration-300 hover:border-[#6366f1]/30 hover:shadow-[0_25px_70px_rgba(99,102,241,0.12)]"
                >
                  <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white">
                      {item.mockupPreview ? (
                        <img
                          src={item.mockupPreview}
                          alt={`${item.productName} preview`}
                          className="aspect-square w-full object-contain p-4"
                        />
                      ) : (
                        <ProductMockup
                          product={product}
                          color={item.color.value}
                          label={
                            item.frontLayers[0]?.text ??
                            item.productName
                          }
                        />
                      )}
                    </div>

                    <div className="flex flex-col justify-between gap-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
                            {product.category}
                          </p>

                          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em]">
                            {item.productName}
                          </h2>

                          <p className="mt-4 text-sm leading-7 text-[#cbd5e1]">
                            {item.size} • {item.color.name} •{" "}
                            {item.frontLayers.length} front layers •{" "}
                            {item.backLayers.length} back layers
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[36px] font-black leading-none">
                            {formatMoney(item.lineTotal)}
                          </p>

                          <p className="mt-2 text-sm text-[#94a3b8]">
                            {formatMoney(item.unitPrice)} each
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black">
                          Qty

                          <input
                            type="number"
                            min={product.minimumQuantity}
                            value={item.quantity}
                            onChange={(event) =>
                              updateQuantity(
                                item.id,
                                Number(event.target.value),
                              )
                            }
                            className="w-24 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-white"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/20"
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
        )}
      </div>

      {/* SIDEBAR */}
      <form
        onSubmit={handleCheckout}
        className="sticky top-24 h-fit overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#111827_0%,#1e1b4b_100%)] p-7 shadow-[0_35px_120px_rgba(0,0,0,0.45)]"
      >
        {/* TOP */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
            Secure Stripe Checkout
          </p>

          <h2 className="mt-4 text-[44px] font-black leading-[0.95] tracking-[-0.04em]">
            Order
            <span className="block text-[#a5b4fc]">
              Summary
            </span>
          </h2>

          <p className="mt-5 text-[15px] leading-8 text-[#cbd5e1]">
            Complete your purchase securely using
            Stripe-powered checkout.
          </p>
        </div>

        {/* ACCOUNT */}
        <div className="mt-7 rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
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
          <input
            value={customer.name}
            onChange={(event) =>
              updateCustomer("name", event.target.value)
            }
            placeholder="Full Name"
            className="h-[58px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white placeholder:text-[#64748b]"
          />

          {!email && (
            <input
              value={customer.email}
              onChange={(event) =>
                updateCustomer("email", event.target.value)
              }
              type="email"
              placeholder="Email Address"
              className="h-[58px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white placeholder:text-[#64748b]"
            />
          )}

          <input
            value={customer.phone}
            onChange={(event) =>
              updateCustomer("phone", event.target.value)
            }
            placeholder="Phone Number"
            className="h-[58px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white placeholder:text-[#64748b]"
          />

          <input
            value={customer.address}
            onChange={(event) =>
              updateCustomer("address", event.target.value)
            }
            placeholder="Shipping Address"
            className="h-[58px] rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white placeholder:text-[#64748b]"
          />

          <textarea
            value={customer.notes}
            onChange={(event) =>
              updateCustomer("notes", event.target.value)
            }
            rows={4}
            placeholder="Order Notes"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white placeholder:text-[#64748b]"
          />
        </div>

        {/* TOTALS */}
        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94a3b8]">
                Subtotal
              </span>

              <strong>
                {formatMoney(totals.subtotal)}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-[#94a3b8]">
                Shipping
              </span>

              <strong>
                {formatMoney(totals.shipping)}
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
                {formatMoney(totals.total)}
              </strong>
            </div>
          </div>
        </div>

        {/* STATUS */}
        {status && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[#cbd5e1]">
            {status}
          </div>
        )}

        {/* CTA */}
        <button
          type="submit"
          disabled={isCheckingOut}
          className="mt-7 w-full rounded-[24px] bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-7 py-5 text-lg font-black text-white shadow-[0_20px_60px_rgba(99,102,241,0.35)] transition hover:-translate-y-1 disabled:opacity-50"
        >
          {isCheckingOut
            ? "Opening Stripe..."
            : "Checkout Securely"}
        </button>
      </form>
    </section>
  </main>
);