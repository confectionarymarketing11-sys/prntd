export type { DesignLayer as Layer } from "@/data/shop";

export function updateLayerList<T extends { id: string }>(
  layers: T[],
  id: string,
  updates: Partial<T>
) {
  return layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer));
}
