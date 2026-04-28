"use client";

import { createContext, useContext, useCallback, useMemo, useSyncExternalStore } from "react";

export interface CartItem {
  productId: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  colorId: string;
  colorName: string;
  quantity: number;
  unitPrice: number | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sizeId: string, colorId: string) => void;
  updateQuantity: (sizeId: string, colorId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "swing-b2b-cart";

// Module-level subscribers for the cart store. Components subscribe via
// useSyncExternalStore so the cart hydrates from localStorage on the client
// without setState-in-effect.
const subscribers = new Set<() => void>();

function emit() {
  for (const cb of subscribers) cb();
}

function subscribe(cb: () => void) {
  subscribers.add(cb);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", cb);
  }
  return () => {
    subscribers.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", cb);
    }
  };
}

let cachedSnapshot: CartItem[] = [];
let cachedSnapshotKey: string | null = null;

function getSnapshot(): CartItem[] {
  if (typeof window === "undefined") return cachedSnapshot;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedSnapshot;
  }
  if (raw === cachedSnapshotKey) return cachedSnapshot;
  try {
    cachedSnapshot = raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    cachedSnapshot = [];
  }
  cachedSnapshotKey = raw;
  return cachedSnapshot;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function writeCart(items: CartItem[]) {
  try {
    const json = JSON.stringify(items);
    window.localStorage.setItem(STORAGE_KEY, json);
    cachedSnapshot = items;
    cachedSnapshotKey = json;
  } catch {
    // storage full or unavailable
  }
  emit();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: CartItem) => {
    const prev = getSnapshot();
    const idx = prev.findIndex(
      (i) => i.sizeId === item.sizeId && i.colorId === item.colorId
    );
    let next: CartItem[];
    if (idx >= 0) {
      next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
    } else {
      next = [...prev, item];
    }
    writeCart(next);
  }, []);

  const removeItem = useCallback((sizeId: string, colorId: string) => {
    const next = getSnapshot().filter(
      (i) => !(i.sizeId === sizeId && i.colorId === colorId)
    );
    writeCart(next);
  }, []);

  const updateQuantity = useCallback(
    (sizeId: string, colorId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(sizeId, colorId);
        return;
      }
      const next = getSnapshot().map((i) =>
        i.sizeId === sizeId && i.colorId === colorId ? { ...i, quantity } : i
      );
      writeCart(next);
    },
    [removeItem]
  );

  const clearCart = useCallback(() => writeCart([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const contextValue = useMemo(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, itemCount }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
