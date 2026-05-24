<main className="min-h-screen overflow-hidden bg-[#020617] text-white">
  <ShopHeader />

  {/* BACKGROUND FX */}
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/20 blur-[140px]" />

    <div className="absolute bottom-[-15%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/20 blur-[160px]" />
  </div>

  <section className="relative z-10 mx-auto w-full max-w-[1700px] px-5 py-8">
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      {/* LEFT DESIGN AREA */}
      <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
        {/* TOP TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#818cf8]">
              PRNTD Design Studio
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.04em]">
              Business Card Designer
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {sides.map((cardSide) => (
              <button
                key={cardSide}
                type="button"
                onClick={() => {
                  setSide(cardSide);
                  setSelectedId(null);
                }}
                className={`rounded-2xl px-5 py-3 text-sm font-black capitalize transition ${
                  side === cardSide
                    ? "bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
                    : "border border-white/10 bg-white/[0.04] text-[#cbd5e1] hover:bg-white/[0.08]"
                }`}
              >
                {cardSide}
              </button>
            ))}
          </div>
        </div>

        {/* CANVAS AREA */}
        <div className="relative p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_35%)]" />

          <div className="relative grid min-h-[760px] place-items-center rounded-[32px] border border-white/10 bg-[#0f172a]/80 p-8">
            <div
              ref={stageWrapRef}
              className="relative aspect-[1.75/1] w-full max-w-[950px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_35px_120px_rgba(0,0,0,0.35)]"
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
                      layer.type === "image" ? (
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

              {/* SAFE AREA */}
              <div className="pointer-events-none absolute inset-5 z-20 rounded-[20px] border-2 border-dashed border-[#6366f1]/70" />
            </div>
          </div>

          {/* BOTTOM STATUS */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-sm font-semibold text-[#cbd5e1]">
              {notice}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={undo}
                disabled={!undoStack.length}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:opacity-40"
              >
                Undo
              </button>

              <button
                type="button"
                onClick={redo}
                disabled={!redoStack.length}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:opacity-40"
              >
                Redo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="sticky top-24 flex flex-col gap-5">
        {/* TOOLS */}
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.35)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
            Design Tools
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                Upload Artwork
              </span>

              <input
                className="rounded-2xl border-2 border-dashed border-[#6366f1]/30 bg-white/[0.03] p-5 text-sm"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleUpload}
              />
            </label>

            <button
              type="button"
              onClick={addText}
              className="rounded-2xl bg-[linear-gradient(135deg,#3b82f6_0%,#6366f1_45%,#8b5cf6_100%)] px-5 py-4 text-sm font-black text-white shadow-[0_15px_50px_rgba(99,102,241,0.35)] transition hover:-translate-y-1"
            >
              Add Text
            </button>

            <div className="rounded-[24px] border border-white/10 bg-[#0f172a]/80 p-4">
              <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                QR Code
              </label>

              <div className="mt-3 grid gap-3">
                <input
                  value={qrValue}
                  onChange={(event) =>
                    setQrValue(
                      event.target.value,
                    )
                  }
                  className="h-[54px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white"
                  placeholder="https://example.com"
                />

                <button
                  type="button"
                  onClick={addFreeQrCode}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]"
                >
                  Generate QR
                </button>
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                Font Family
              </span>

              <select
                value={fontFamily}
                onChange={(event) =>
                  setFontFamily(
                    event.target.value,
                  )
                }
                className="h-[56px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
              >
                {fonts.map((font) => (
                  <option
                    key={font}
                    value={font}
                  >
                    {font}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
                Text Color
              </span>

              <input
                type="color"
                value={textColor}
                onChange={(event) =>
                  setTextColor(
                    event.target.value,
                  )
                }
                className="h-[56px] rounded-2xl border border-white/10 bg-white/[0.04] p-2"
              />
            </label>

            {selectedTextLayer && (
              <input
                value={
                  selectedTextLayer.text ??
                  ""
                }
                onChange={(event) =>
                  updateLayer(
                    selectedTextLayer.id,
                    {
                      text:
                        event.target.value,
                      fontFamily,
                      fill: textColor,
                    },
                  )
                }
                className="h-[56px] rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
              />
            )}
          </div>
        </div>

        {/* LAYER EDITOR */}
        {selectedLayer && (
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#818cf8]">
              Layer Controls
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white"
                type="number"
                value={Math.round(
                  selectedLayer.x,
                )}
                onChange={(event) =>
                  updateLayer(
                    selectedLayer.id,
                    {
                      x: Number(
                        event.target.value,
                      ),
                    },
                  )
                }
                placeholder="X"
              />

              <input
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white"
                type="number"
                value={Math.round(
                  selectedLayer.y,
                )}
                onChange={(event) =>
                  updateLayer(
                    selectedLayer.id,
                    {
                      y: Number(
                        event.target.value,
                      ),
                    },
                  )
                }
                placeholder="Y"
              />

              {selectedImageLayer && (
                <>
                  <input
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white"
                    type="number"
                    value={Math.round(
                      selectedImageLayer.width ??
                        180,
                    )}
                    onChange={(
                      event,
                    ) =>
                      updateLayer(
                        selectedImageLayer.id,
                        {
                          width: Number(
                            event.target
                              .value,
                          ),
                        },
                      )
                    }
                  />

                  <input
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-white"
                    type="number"
                    value={Math.round(
                      selectedImageLayer.height ??
                        110,
                    )}
                    onChange={(
                      event,
                    ) =>
                      updateLayer(
                        selectedImageLayer.id,
                        {
                          height: Number(
                            event.target
                              .value,
                          ),
                        },
                      )
                    }
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={deleteSelectedLayer}
              className="mt-5 w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-black text-red-300"
            >
              Delete Layer
            </button>
          </div>
        )}

        {/* CHECKOUT */}
        <div className="overflow-hidden rounded-[34px] border border-[#6366f1]/20 bg-[linear-gradient(135deg,#111827_0%,#312e81_100%)] p-7 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c7d2fe]">
            Estimated Total
          </p>

          <p className="mt-4 text-[56px] font-black leading-none">
            {formatMoney(price.lineTotal)}
          </p>

          <p className="mt-3 text-sm text-[#cbd5e1]">
            {sideHasContent(
              frontLayers,
            ) &&
            sideHasContent(backLayers)
              ? "Double-sided premium print"
              : "Single-sided premium print"}
          </p>

          <div className="mt-6">
            <label className="text-xs font-black uppercase tracking-[0.12em] text-[#94a3b8]">
              Quantity
            </label>

            <input
              className="mt-2 h-[56px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white"
              type="number"
              min={product.minimumQuantity}
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  Math.max(
                    product.minimumQuantity,
                    Number(
                      event.target.value,
                    ) ||
                      product.minimumQuantity,
                  ),
                )
              }
            />
          </div>

          <div className="mt-7 grid gap-3">
            <button
              type="button"
              onClick={addToCart}
              className="rounded-2xl bg-white px-5 py-4 text-sm font-black text-[#111827] transition hover:scale-[1.02]"
            >
              Add To Cart
            </button>

            <Link
              href="/products/business-cards"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center text-sm font-black text-white no-underline transition hover:bg-white/[0.08]"
            >
              Back To Product
            </Link>
          </div>
        </div>
      </aside>
    </div>
  </section>
</main>