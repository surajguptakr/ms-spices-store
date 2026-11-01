import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { products } from "@/lib/catalog";

const requestSchema = z.object({ items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).max(30) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  if (!process.env.DATABASE_URL) {
    const rows = parsed.data.items.map((item) => {
      const product = products.find((entry) => entry.variants.some((variant) => variant.id === item.variantId));
      const variant = product?.variants.find((entry) => entry.id === item.variantId);
      return variant && product ? { variantId: variant.id, productName: product.name, size: variant.size, price: variant.price, stock: variant.stock, requested: item.quantity, available: variant.stock >= item.quantity } : { variantId: item.variantId, available: false, stock: 0 };
    });
    return NextResponse.json({ items: rows, settings: { shippingFee: "80", freeShippingThreshold: "999" }, valid: rows.every((item) => item.available) });
  }
  try {
    const ids = [...new Set(parsed.data.items.map((item) => item.variantId))];
    const variants = await prisma.orm.public.ProductVariant
      .where((variant) => variant.id.in(ids))
      .include("product")
      .all();
    const activeVariants = variants.filter((variant) => variant.product.active);
    const settingRows = await prisma.orm.public.Setting
      .where((setting) => setting.key.in(["shippingFee", "freeShippingThreshold"]))
      .all();
    const settings = Object.fromEntries(settingRows.map((setting) => [setting.key, setting.value]));
    const rows = parsed.data.items.map((item) => {
      const variant = activeVariants.find((entry) => entry.id === item.variantId);
      return variant ? { variantId: variant.id, productName: variant.product.name, size: variant.size, price: variant.price, stock: variant.stock, requested: item.quantity, available: variant.stock >= item.quantity } : { variantId: item.variantId, available: false, stock: 0 };
    });
    return NextResponse.json({ items: rows, settings, valid: rows.every((item) => item.available) });
  } catch {
    return NextResponse.json({ error: "Live stock checks are temporarily unavailable." }, { status: 503 });
  }
}