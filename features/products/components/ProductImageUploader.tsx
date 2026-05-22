"use client";

import { useMemo, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductFormImage } from "@/features/products/types/product";

function newImage(): ProductFormImage {
  return {
    url: "",
    alt_text: "",
    is_featured: false,
    position: 0,
  };
}

export default function ProductImageUploader({ images: initialImages }: { images: ProductFormImage[] }) {
  const [images, setImages] = useState<ProductFormImage[]>(initialImages.length ? initialImages : [newImage()]);
  const serialized = useMemo(
    () =>
      JSON.stringify(
        images
          .map((image, index) => ({
            ...image,
            position: index,
          }))
          .filter((image) => image.url.trim())
      ),
    [images]
  );

  function updateImage(index: number, patch: Partial<ProductFormImage>) {
    setImages((current) => current.map((image, imageIndex) => (imageIndex === index ? { ...image, ...patch } : image)));
  }

  function markFeatured(index: number) {
    setImages((current) => current.map((image, imageIndex) => ({ ...image, is_featured: imageIndex === index })));
  }

  function removeImage(index: number) {
    setImages((current) => {
      const next = current.filter((_, imageIndex) => imageIndex !== index);
      return next.length ? next : [newImage()];
    });
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name="images" value={serialized} />
      <div className="grid gap-3">
        {images.map((image, index) => (
          <div key={`${image.id ?? "new"}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[92px_minmax(0,1fr)_auto]">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
              {image.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <div className="grid gap-2">
              <Input value={image.url} onChange={(event) => updateImage(index, { url: event.target.value })} placeholder="Image URL or future uploaded file URL" />
              <Input value={image.alt_text ?? ""} onChange={(event) => updateImage(index, { alt_text: event.target.value })} placeholder="Alt text" />
              <p className="text-xs text-slate-500">Upload storage can be connected here later; URL-based images are supported now.</p>
            </div>
            <div className="flex gap-2 md:flex-col">
              <Button type="button" variant={image.is_featured ? "default" : "outline"} size="sm" onClick={() => markFeatured(index)}>
                <Star className="h-4 w-4" />
                Featured
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={() => setImages((current) => [...current, newImage()])}>
        <ImagePlus className="h-4 w-4" />
        Add Image
      </Button>
    </div>
  );
}
