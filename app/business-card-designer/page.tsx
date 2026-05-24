<main className="min-h-screen overflow-hidden bg-[#020617] text-white">
  {/* BG */}
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

    <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
  </div>

  <div className="relative z-10">
    <ShopHeader />

    <section className="mx-auto w-full max-w-7xl px-[22px] py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] max-[860px]:grid-cols-1">
        {/* DESIGN AREA */}
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0f172a]/80 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {/* GLOW */}
          <div className="absolute right-[-10%] top-[-10%] h-[260px] w-[260px] rounded-full bg-[#6366f1]/15 blur-[90px]" />

          <div className="relative z-10">
            {/* HEADER */}
            <div className="mb-7">
              <p className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c7d2fe]">
                Business Card Designer
              </p>

              <h1 className="mt-5 text-[clamp(40px,5vw,72px)] font-black leading-[0.92] tracking-[-0.06em]">
                Create
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Premium Cards
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#cbd5e1]">
                Upload artwork, add text,
                generate QR codes, and
                create premium business
                card layouts directly in
                your browser.
              </p>
            </div>

            {/* SIDE BUTTONS */}
            <div className="mb-6 flex gap-3">
              {sides.map((cardSide) => (
                <button
                  key={cardSide}
                  type="button"
                  onClick={() => {
                    setSide(cardSide);
                    setSelectedId(null);
                  }}
                  className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                    side === cardSide
                      ? "bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
                      : "border border-white/10 bg-white/[0.04] text-[#cbd5e1]"
                  }`}
                >
                  {cardSide}
                </button>
              ))}
            </div>

            {/* CANVAS */}
            <div className="grid min-h-[520px] place-items-center rounded-[30px] border border-white/10 bg-[#020617] p-5">
              <div
                ref={stageWrapRef}
                className="relative aspect-[1.75/1] w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <Stage
                  width={stageWidth}
                  height={stageHeight}
                  className="!absolute inset-0 z-10"
                  onMouseDown={(event) => {
                    if (
                      event.target ===
                      event.target.getStage()
                    ) {
                      setSelectedId(null);
                    }
                  }}
                  onTouchStart={(event) => {
                    if (
                      event.target ===
                      event.target.getStage()
                    ) {
                      setSelectedId(null);
                    }
                  }}
                >
                  <Layer>
                    <Group>
                      {layers.map((layer) =>
                        layer.type ===
                        "image" ? (
                          <URLImage
                            key={layer.id}
                            layer={layer}
                            isSelected={
                              selectedId ===
                              layer.id
                            }
                            onSelect={() =>
                              setSelectedId(
                                layer.id,
                              )
                            }
                            updateLayer={
                              updateLayerWithHistory
                            }
                          />
                        ) : (
                          <URLText
                            key={layer.id}
                            layer={layer}
                            isSelected={
                              selectedId ===
                              layer.id
                            }
                            onSelect={() =>
                              setSelectedId(
                                layer.id,
                              )
                            }
                            updateLayer={
                              updateLayerWithHistory
                            }
                            onEdit={
                              editTextLayer
                            }
                          />
                        ),
                      )}
                    </Group>
                  </Layer>
                </Stage>

                <div className="pointer-events-none absolute inset-5 z-20 rounded-[22px] border-2 border-dashed border-[#6366f1]/60" />
              </div>
            </div>

            {/* NOTICE */}
            <p className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[#cbd5e1]">
              {notice}
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="flex flex-col gap-5 rounded-[34px] border border-white/10 bg-[#0f172a]/80 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
              Customizer
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
              Controls
            </h2>
          </div>

          {/* UPLOAD */}
          <div>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Upload Artwork
            </label>

            <input
              className="mt-3 w-full rounded-[22px] border border-dashed border-[#6366f1]/25 bg-[#020617] p-5 text-sm text-[#cbd5e1]"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleUpload}
            />
          </div>

          {/* BUTTONS */}
          <button
            type="button"
            onClick={addText}
            className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)]"
          >
            Add Text
          </button>

          {/* QR */}
          <div className="rounded-[24px] border border-white/10 bg-[#020617] p-5">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Free QR Code
            </label>

            <div className="mt-4 grid gap-3">
              <input
                value={qrValue}
                onChange={(event) =>
                  setQrValue(
                    event.target.value,
                  )
                }
                className="h-[54px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                placeholder="https://example.com"
              />

              <button
                type="button"
                onClick={addFreeQrCode}
                className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1]"
              >
                Add QR Code
              </button>
            </div>
          </div>

          {/* FONT */}
          <div>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Font
            </label>

            <select
              value={fontFamily}
              onChange={(event) =>
                setFontFamily(
                  event.target.value,
                )
              }
              className="mt-3 h-[56px] w-full rounded-[18px] border border-white/10 bg-[#020617] px-4 text-sm text-white"
            >
              {fonts.map((font) => (
                <option key={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* COLOR */}
          <div>
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Text Color
            </label>

            <input
              type="color"
              value={textColor}
              onChange={(event) =>
                setTextColor(
                  event.target.value,
                )
              }
              className="mt-3 h-[54px] w-full rounded-[18px] border border-white/10 bg-[#020617] p-2"
            />
          </div>

          {/* PRICE */}
          <div className="rounded-[28px] border border-white/10 bg-[#020617] p-6">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Estimated Total
            </p>

            <p className="mt-3 text-[42px] font-black leading-none text-white">
              {formatMoney(
                price.lineTotal,
              )}
            </p>

            <p className="mt-4 rounded-[16px] bg-[#0f172a] px-4 py-3 text-sm text-[#cbd5e1]">
              {sideHasContent(
                frontLayers,
              ) &&
              sideHasContent(
                backLayers,
              )
                ? "Double-sided card design"
                : "Single-sided card design"}
            </p>
          </div>

          {/* ACTIONS */}
          <button
            type="button"
            onClick={addToCart}
            className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)]"
          >
            Add To Cart
          </button>

          <Link
            href="/products/business-cards"
            className="rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1] no-underline"
          >
            Back To Product
          </Link>
        </aside>
      </div>
    </section>
  </div>
</main>