import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { productSchema } from "@/lib/validations";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const products = await prisma.product.findMany({ include: { category: true, variants: true }, orderBy: { name: "asc" } });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Could not load products." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Product details are invalid.", details: parsed.error.flatten() }, { status: 400 });
  try {
    const { variants, ...product } = parsed.data;
    const created = await prisma.product.create({ data: { ...product, imageUrl: product.imageUrl || null, variants: { create: variants.map(({ id: _id, ...variant }) => variant) } } });
    return NextResponse.json({ product: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create product. Check the slug, SKU, and category." }, { status: 409 });
  }
}

const updateSchema = productSchema.extend({ id: z.string().min(1) });

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Product details are invalid." }, { status: 400 });
  try {
    const { id, variants, ...data } = parsed.data;
    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data: { ...data, imageUrl: data.imageUrl || null } });
      for (const { id: variantId, ...variant } of variants) {
        if (variantId) await tx.productVariant.update({ where: { id: variantId }, data: variant });
        else await tx.productVariant.upsert({ where: { sku: variant.sku }, update: variant, create: { ...variant, productId: id } });
      }
      return tx.product.findUnique({ where: { id }, include: { category: true, variants: true } });
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Could not update product. Check its slug and SKU values." }, { status: 409 });
  }
}