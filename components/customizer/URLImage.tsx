"use client";

import {
  Image as KonvaImage,
  Transformer,
} from "react-konva";

import type Konva from "konva";
import useImage from "use-image";
import { DesignLayer } from "@/data/shop";

import {
  useEffect,
  useRef,
} from "react";

type URLImageProps = {
  layer: DesignLayer;
  isSelected: boolean;
  onSelect: () => void;
  updateLayer: (id: string, updates: Partial<DesignLayer>) => void;
  onResetSize?: (layer: DesignLayer, image: HTMLImageElement) => void;
};

export default function URLImage({
  layer,
  isSelected,
  onSelect,
  updateLayer,
  onResetSize,
}: URLImageProps) {

  /*
  ========================================
  IMAGE
  ========================================
  */

  const [image] =
    useImage(
      layer?.preview || ""
    );

  /*
  ========================================
  REFS
  ========================================
  */

  const shapeRef =
    useRef<Konva.Image | null>(null);

  const trRef =
    useRef<Konva.Transformer | null>(null);

  /*
  ========================================
  TRANSFORMER
  ========================================
  */

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      const frame = requestAnimationFrame(() => {
        const transformer = trRef.current;
        const shape = shapeRef.current;

        if (!transformer || !shape) return;

        transformer.nodes([shape]);
        transformer.forceUpdate();

        transformer
          .getLayer()
          ?.batchDraw();
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [image, isSelected, layer.height, layer.rotation, layer.width, layer.x, layer.y]);

  /*
  ========================================
  SAFETY
  ========================================
  */

  if (!layer?.preview)
    return null;

  if (!image)
    return null;

  return (
    <>

      <KonvaImage
        ref={shapeRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rotation={layer.rotation}
        draggable

        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => image && onResetSize?.(layer, image)}
        onDblTap={() => image && onResetSize?.(layer, image)}

        /*
        ========================================
        DRAGGING
        ========================================
        */

        onDragEnd={(e) => {

          updateLayer(layer.id, {

            x: e.target.x(),
            y: e.target.y(),

          });
        }}

        /*
        ========================================
        RESIZE / ROTATE
        ========================================
        */

        onTransformEnd={() => {

          const node =
            shapeRef.current;

          if (!node) return;

          const scaleX =
            node.scaleX();

          const scaleY =
            node.scaleY();

          const width =
            Math.max(
              20,
              node.width() *
              scaleX
            );

          const height =
            Math.max(
              20,
              node.height() *
              scaleY
            );

          node.scaleX(1);
          node.scaleY(1);

          updateLayer(layer.id, {

            x: node.x(),
            y: node.y(),

            rotation:
              node.rotation(),

            width,
            height,
          });
        }}
      />

      {isSelected && (

        <Transformer
          ref={trRef}
          rotateEnabled
          anchorSize={10}
          borderStroke="#7c3aed"
          anchorStroke="#7c3aed"
          anchorFill="#ffffff"
        />

      )}

    </>
  );
}
