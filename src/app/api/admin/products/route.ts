import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { productSchema } from "@/lib/validations";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const products = await prisma.orm.public.Product
      .include("category")
      .include("variants")
      .orderBy((product) => product.name.asc())
      .all();
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
    const created = await prisma.transaction(async (tx) => {
      const savedProduct = await tx.orm.public.Product.create({
        ...product,
        imageUrl: product.imageUrl || null,
      });
      await tx.orm.public.ProductVariant.createAll(
        variants.map(({ id: _id, ...variant }) => ({
          ...variant,
          productId: savedProduct.id,
        })),
      );
      return tx.orm.public.Product
        .where({ id: savedProduct.id })
        .include("category")
        .include("variants")
        .first();
    });
    if (!created) throw new Error("Created product could not be loaded.");
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
    const product = await prisma.transaction(async (tx) => {
      const savedProduct = await tx.orm.public.Product
        .where({ id })
        .update({ ...data, imageUrl: data.imageUrl || null });
      if (!savedProduct) throw new Error("Product not found.");
      for (const { id: variantId, ...variant } of variants) {
        if (variantId) {
          const updatedVariant = await tx.orm.public.ProductVariant
            .where({ id: variantId })
            .update(variant);
          if (!updatedVariant) throw new Error("Product variant not found.");
        } else {
          await tx.orm.public.ProductVariant.upsert({
            create: { ...variant, productId: id },
            update: variant,
            conflictOn: { sku: variant.sku },
          });
        }
      }
      return tx.orm.public.Product
        .where({ id })
        .include("category")
        .include("variants")
        .first();
    });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Could not update product. Check its slug and SKU values." }, { status: 409 });
  }
}