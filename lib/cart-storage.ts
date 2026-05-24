"use client";

import { CART_STORAGE_KEY, CartItem, DesignLayer } from "@/data/shop";

const DB_NAME = "prntd-cart-assets";
const STORE_NAME = "assets";
const DB_VERSION = 1;

function isBrowser() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function isLargeAsset(value?: string | null) {
  return Boolean(value && (value.startsWith("data:image/") || value.startsWith("blob:")));
}

function openCartDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!isBrowser()) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open cart storage."));
  });
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read cart asset."));
    reader.readAsDataURL(blob);
  });
}

async function normalizeAsset(value: string) {
  if (value.startsWith("data:image/")) return value;

  if (value.startsWith("blob:")) {
    const response = await fetch(value);
    return blobToDataUrl(await response.blob());
  }

  return value;
}

async function putAsset(value?: string | null, existingKey?: string | null) {
  if (!isLargeAsset(value)) {
    return {
      value: value ?? null,
      key: existingKey ?? null,
    };
  }

  const db = await openCartDb();
  const key = existingKey || `cart-asset-${crypto.randomUUID()}`;
  const normalizedValue = await normalizeAsset(value ?? "");

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.put(normalizedValue, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save cart asset."));
  });

  db.close();

  return {
    value: null,
    key,
  };
}

async function getAsset(key?: string | null) {
  if (!key) return null;

  const db = await openCartDb();

  const value = await new Promise<string | null>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Could not load cart asset."));
  });

  db.close();

  return value;
}

async function stripLayerAssets(layer: DesignLayer): Promise<DesignLayer> {
  if (layer.type !== "image") return layer;

  const preview = await putAsset(layer.preview, layer.previewKey);
  const originalPreview = await putAsset(layer.originalPreview, layer.originalPreviewKey);

  return {
    ...layer,
    preview: preview.value ?? undefined,
    originalPreview: originalPreview.value ?? undefined,
    previewKey: preview.key ?? undefined,
    originalPreviewKey: originalPreview.key ?? undefined,
  };
}

async function hydrateLayerAssets(layer: DesignLayer): Promise<DesignLayer> {
  if (layer.type !== "image") return layer;

  return {
    ...layer,
    preview: layer.preview ?? (await getAsset(layer.previewKey)) ?? undefined,
    originalPreview: layer.originalPreview ?? (await getAsset(layer.originalPreviewKey)) ?? undefined,
  };
}

async function stripCartItemAssets(item: CartItem): Promise<CartItem> {
  const [mockupPreview, frontPreview, backPreview, frontLayers, backLayers] = await Promise.all([
    putAsset(item.mockupPreview, item.mockupPreviewKey),
    putAsset(item.frontPreview, item.frontPreviewKey),
    putAsset(item.backPreview, item.backPreviewKey),
    Promise.all(item.frontLayers.map(stripLayerAssets)),
    Promise.all(item.backLayers.map(stripLayerAssets)),
  ]);

  return {
    ...item,
    frontLayers,
    backLayers,
    mockupPreview: mockupPreview.value,
    frontPreview: frontPreview.value,
    backPreview: backPreview.value,
    mockupPreviewKey: mockupPreview.key,
    frontPreviewKey: frontPreview.key,
    backPreviewKey: backPreview.key,
  };
}

async function hydrateCartItemAssets(item: CartItem): Promise<CartItem> {
  const [mockupPreview, frontPreview, backPreview, frontLayers, backLayers] = await Promise.all([
    item.mockupPreview ?? getAsset(item.mockupPreviewKey),
    item.frontPreview ?? getAsset(item.frontPreviewKey),
    item.backPreview ?? getAsset(item.backPreviewKey),
    Promise.all(item.frontLayers.map(hydrateLayerAssets)),
    Promise.all(item.backLayers.map(hydrateLayerAssets)),
  ]);

  return {
    ...item,
    frontLayers,
    backLayers,
    mockupPreview,
    frontPreview,
    backPreview,
  };
}

function parseStoredCart() {
  if (!isBrowser()) return [];

  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export async function loadCartItems() {
  const storedItems = parseStoredCart();

  try {
    return await Promise.all(storedItems.map(hydrateCartItemAssets));
  } catch {
    return storedItems;
  }
}

export async function saveCartItems(items: CartItem[]) {
  if (!isBrowser()) return;

  const storageItems = await Promise.all(items.map(stripCartItemAssets));

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storageItems));
}

export async function addCartItem(item: CartItem) {
  const currentItems = await loadCartItems();
  const nextItems = [...currentItems, item];

  await saveCartItems(nextItems);

  return nextItems;
}
