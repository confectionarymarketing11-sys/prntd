"use client";

import {
  Text,
  Transformer,
} from "react-konva";

import type Konva from "konva";
import { DesignLayer } from "@/data/shop";

import {
  useEffect,
  useRef,
} from "react";

type URLTextProps = {
  layer: DesignLayer;
  isSelected: boolean;
  onSelect: () => void;
  updateLayer: (id: string, updates: Partial<DesignLayer>) => void;
  onEdit?: (layer: DesignLayer) => void;
};

export default function URLText({
  layer,
  isSelected,
  onSelect,
  updateLayer,
  onEdit,
}: URLTextProps) {

  const shapeRef =
    useRef<Konva.Text | null>(null);

  const trRef =
    useRef<Konva.Transformer | null>(null);

  useEffect(() => {

    if (
      isSelected &&
      trRef.current &&
      shapeRef.current
    ) {

      setTimeout(() => {
        const transformer = trRef.current;
        const shape = shapeRef.current;

        if (!transformer || !shape) return;

        transformer.nodes([shape]);

        transformer
          .getLayer()
          ?.batchDraw();

      }, 0);
    }

  }, [isSelected]);

  return (
    <>

      <Text
        ref={shapeRef}
        text={layer.text}
        x={layer.x}
        y={layer.y}
        fontSize={layer.fontSize}
        fontFamily={layer.fontFamily ?? "Arial"}
        fill={layer.fill}
        draggable
        rotation={layer.rotation}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={() => onEdit?.(layer)}
        onDblTap={() => onEdit?.(layer)}
        onDragEnd={(e) => {

          updateLayer(layer.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;

          if (!node) return;

          const scaleX = node.scaleX();

          node.scaleX(1);
          node.scaleY(1);

          updateLayer(layer.id, {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            fontSize: Math.max(12, Math.round((layer.fontSize ?? 32) * scaleX)),
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
