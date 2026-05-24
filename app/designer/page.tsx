return (
  <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
    {/* BACKGROUND */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />

      <div className="absolute bottom-[-10%] right-[-10%] h-[520px] w-[520px] rounded-full bg-[#2563eb]/15 blur-[140px]" />
    </div>

    <div className="relative z-10">
      <ShopHeader />

      <section className="mx-auto w-full max-w-7xl px-[22px] py-10">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] max-[860px]:grid-cols-1">
          {/* LEFT */}
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0f172a]/80 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="absolute right-[-10%] top-[-10%] h-[260px] w-[260px] rounded-full bg-[#6366f1]/15 blur-[90px]" />

            <div className="relative z-10">
              {/* TOP BAR */}
              <div className="mb-6 flex flex-wrap gap-3">
                {(["front", "back"] as ShirtSide[]).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setSide(side)}
                    className={`rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition ${
                      currentView === side
                        ? "bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)]"
                        : "border border-white/10 bg-white/[0.04] text-[#cbd5e1]"
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>

              {/* IMPORTANT */}
              <div className="mb-5 rounded-[22px] border border-orange-500/15 bg-orange-500/10 px-5 py-4 text-sm font-semibold text-orange-100">
                <span className="font-black">
                  Important:
                </span>{" "}
                Keep everything inside the blue-lined print area.
                Prints exactly as shown.
              </div>

              {/* STAGE */}
              <div
                ref={stageWrapRef}
                className="relative mx-auto aspect-[1/1.2] w-full overflow-hidden rounded-[30px] border border-white/10 bg-[#020617]"
              >
                <Image
                  src={color.images[currentView]}
                  alt={`${color.name} shirt ${currentView}`}
                  fill
                  priority
                  sizes="(max-width: 860px) calc(100vw - 80px), 760px"
                  className="pointer-events-none select-none object-contain"
                />

                <Stage
                  width={stageWidth}
                  height={stageHeight}
                  className="!absolute inset-0 z-20"
                  onMouseDown={(event) => {
                    if (event.target === event.target.getStage()) {
                      setSelectedId(null);
                    }
                  }}
                  onTouchStart={(event) => {
                    if (event.target === event.target.getStage()) {
                      setSelectedId(null);
                    }
                  }}
                >
                  <Layer
                    clipX={printArea.x}
                    clipY={printArea.y}
                    clipWidth={printArea.width}
                    clipHeight={printArea.height}
                  >
                    <Group>
                      {layers.map((layer) =>
                        layer.type === "image" ? (
                          <URLImage
                            key={layer.id}
                            layer={layer}
                            isSelected={selectedId === layer.id}
                            onSelect={() => setSelectedId(layer.id)}
                            updateLayer={updateLayer}
                            onResetSize={resetImageSize}
                          />
                        ) : (
                          <URLText
                            key={layer.id}
                            layer={layer}
                            isSelected={selectedId === layer.id}
                            onSelect={() => setSelectedId(layer.id)}
                            updateLayer={updateLayer}
                            onEdit={editTextLayer}
                          />
                        )
                      )}
                    </Group>
                  </Layer>
                </Stage>

                {/* PRINT AREA */}
                <div
                  className="pointer-events-none absolute z-30 box-border rounded-[18px] border-2 border-dashed border-[#60a5fa]/80"
                  style={{
                    left: "50.5%",
                    top: "51%",
                    width: "30%",
                    height: "39%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>

              {/* NOTICE */}
              <p className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-semibold text-[#cbd5e1]">
                {notice}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <aside className="flex flex-col gap-5 rounded-[34px] border border-white/10 bg-[#0f172a]/80 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            {/* HEADER */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#94a3b8]">
                T-Shirt Designer
              </p>

              <h1 className="mt-3 text-[48px] font-black leading-[0.92] tracking-[-0.05em] text-white">
                Customize
                <span className="block bg-[linear-gradient(135deg,#60a5fa_0%,#818cf8_45%,#a855f7_100%)] bg-clip-text text-transparent">
                  Premium Shirts
                </span>
              </h1>
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-white/10" />

            {/* UPLOAD */}
            <div>
              <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#94a3b8]">
                Upload Design(s)
              </label>

              <input
                className="mt-3 w-full rounded-[22px] border-2 border-dashed border-[#6366f1]/25 bg-[#020617] p-[18px] text-base text-[#cbd5e1]"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleUpload}
              />
            </div>

            {/* TEXT */}
            <button
              type="button"
              onClick={addText}
              className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)]"
            >
              Add Text
            </button>

            {/* QR */}
            <div className="rounded-[24px] border border-white/10 bg-[#020617] p-5">
              <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#94a3b8]">
                Free Static QR Code
              </label>

              <div className="mt-3 grid gap-2">
                <input
                  value={qrValue}
                  onChange={(event) => setQrValue(event.target.value)}
                  className="h-[54px] rounded-[18px] border border-white/10 bg-[#0f172a] px-4 text-sm text-white"
                  placeholder="https://example.com or plain text"
                />

                <button
                  type="button"
                  onClick={addFreeQrCode}
                  className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1]"
                >
                  Add Free QR Code
                </button>
              </div>
            </div>

            {/* FONT */}
            <div>
              <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#94a3b8]">
                Font
              </label>

              <select
                value={fontFamily}
                onChange={(event) => {
                  setFontFamily(event.target.value);

                  if (selectedTextLayer) {
                    updateLayer(selectedTextLayer.id, {
                      fontFamily: event.target.value,
                    });
                  }
                }}
                className="mt-3 h-[58px] w-full rounded-[18px] border border-white/10 bg-[#020617] px-4 text-base text-white"
              >
                {fontFamilies.map((font) => (
                  <option
                    key={font}
                    value={font}
                  >
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* COLOR */}
            <div>
              <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#94a3b8]">
                Text Color
              </label>

              <input
                type="color"
                value={textColor}
                onChange={(event) => {
                  setTextColor(event.target.value);

                  if (selectedTextLayer) {
                    updateLayer(selectedTextLayer.id, {
                      fill: event.target.value,
                    });
                  }
                }}
                className="mt-3 h-[52px] w-full rounded-[18px] border border-white/10 bg-[#020617] p-1.5"
              />
            </div>

            {/* SELECTED TEXT */}
            {selectedTextLayer && (
              <>
                <label className="text-[13px] font-bold uppercase tracking-[0.05em] text-[#94a3b8]">
                  Selected Text
                </label>

                <input
                  value={selectedTextLayer.text ?? ""}
                  onChange={(event) =>
                    updateLayer(selectedTextLayer.id, {
                      text: event.target.value,
                    })
                  }
                  className="h-[58px] w-full rounded-[18px] border border-white/10 bg-[#020617] px-4 text-base text-white"
                />
              </>
            )}

            {/* UNDO/REDO */}
            <div className="grid grid-cols-2 gap-3 max-[860px]:grid-cols-1">
              <button
                type="button"
                onClick={undo}
                disabled={!undoStack.length}
                className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1] disabled:opacity-40"
              >
                Undo
              </button>

              <button
                type="button"
                onClick={redo}
                disabled={!redoStack.length}
                className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#cbd5e1] disabled:opacity-40"
              >
                Redo
              </button>
            </div>

            {/* DELETE */}
            <button
              type="button"
              onClick={deleteSelectedLayer}
              className="rounded-[18px] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm font-black text-red-300"
            >
              Delete Selected Design
            </button>

            {/* CREATE NEW */}
            <Link
              href="/designer"
              className="relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(135deg,#8b5cf6_0%,#6366f1_45%,#3b82f6_100%)] px-4 py-3 text-center text-[15px] font-extrabold tracking-[0.02em] text-white no-underline shadow-[0_14px_34px_rgba(99,102,241,0.24)] transition hover:-translate-y-0.5"
            >
              Create New Design
            </Link>

            {/* REMOVE BG */}
            <button
              type="button"
              disabled={isRemovingBg}
              onClick={removeBackground}
              className="rounded-[20px] bg-[linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_40px_rgba(99,102,241,0.35)] disabled:opacity-70"
            >
              {isRemovingBg ? "Removing Background..." : "Remove Image Background - 2 Credits"}
            </button>