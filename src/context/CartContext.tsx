"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products, type Product, type ProductVariant } from "@/lib/catalog";

export type CartLine = { product: Product; variant: ProductVariant; quantity: number };
type StoredLine = { variantId: string; quantity: number; product?: Product };
type VerifiedVariant = { price: number; stock: number };
type CartContextValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  addItem: (product: Product, variant: ProductVariant) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ms-spices-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [verifiedVariants, setVerifiedVariants] = useState<Record<string, VerifiedVariant>>({});
  const [shippingFee, setShippingFee] = useState(80);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLines(JSON.parse(stored) as StoredLine[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  useEffect(() => {
    if (!ready || !lines.length) return;
    let cancelled = false;
    fetch("/api/cart/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lines.map(({ variantId, quantity }) => ({ variantId, quantity })) }),
    }).then(async (response) => {
      if (!response.ok) return;
      const result = await response.json();
      if (cancelled) return;
      setVerifiedVariants(Object.fromEntries(result.items.filter((item: { price?: number; stock?: number }) => typeof item.price === "number" && typeof item.stock === "number").map((item: { variantId: string; price: number; stock: number }) => [item.variantId, { price: item.price, stock: item.stock }])));
      if (result.settings) {
        setShippingFee(Number(result.settings.shippingFee) || 80);
        setFreeShippingThreshold(Number(result.settings.freeShippingThreshold) || 999);
      }
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [lines, ready]);

  const items = useMemo(() => lines.flatMap((line) => {
    const product = line.product ?? products.find((item) => item.variants.some((variant) => variant.id === line.variantId));
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product || !variant) return [];
    return [{ product, variant: { ...variant, ...verifiedVariants[line.variantId] }, quantity: line.quantity }];
  }), [lines, verifiedVariants]);

  const value: CartContextValue = {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0),
    shippingFee,
    freeShippingThreshold,
    addItem: (product, variant) => setLines((current) => {
      const existing = current.find((line) => line.variantId === variant.id);
      if (existing) return current.map((line) => line.variantId === variant.id ? { ...line, product, quantity: Math.min(20, line.quantity + 1) } : line);
      return [...current, { variantId: variant.id, quantity: 1, product }];
    }),
    updateQuantity: (variantId, quantity) => setLines((current) => quantity < 1 ? current.filter((line) => line.variantId !== variantId) : current.map((line) => line.variantId === variantId ? { ...line, quantity: Math.min(20, quantity) } : line)),
    removeItem: (variantId) => setLines((current) => current.filter((line) => line.variantId !== variantId)),
    clearCart: () => setLines([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}