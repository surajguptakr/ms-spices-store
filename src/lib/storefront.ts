import type { Prisma } from "@prisma/client";
import { categories, products, type Product } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true; variants: true } }>;
const productOrder = new Map(products.map((product, index) => [product.slug, index]));

function mapProduct(row: ProductRow): Product {
  const galleryImages = products.find((product) => product.slug === row.slug)?.galleryImages;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category.name,
    categorySlug: row.category.slug,
    description: row.description,
    origin: row.origin,
    ingredients: row.ingredients,
    imageUrl: galleryImages?.[0] ?? (row.imageUrl?.startsWith("/images/spices/") ? row.imageUrl : "/images/spices/placeholder.svg"),
    galleryImages,
    featured: row.featured,
    variants: row.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      weightGrams: variant.weightGrams,
      price: variant.price,
      mrp: variant.mrp ?? undefined,
      stock: variant.stock,
      sku: variant.sku,
    })),
  };
}

export async function getStoreProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return products;
  try {
    const rows = await prisma.product.findMany({ where: { active: true }, include: { category: true, variants: true }, orderBy: { name: "asc" } });
    return rows.length
      ? rows.map(mapProduct).sort((first, second) => (productOrder.get(first.slug) ?? Number.MAX_SAFE_INTEGER) - (productOrder.get(second.slug) ?? Number.MAX_SAFE_INTEGER))
      : products;
  } catch {
    return products;
  }
}

export async function getStoreProduct(slug: string): Promise<Product | undefined> {
  return (await getStoreProducts()).find((product) => product.slug === slug);
}

export async function getStoreCategories() {
  if (!process.env.DATABASE_URL) return categories;
  try {
    const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return rows.length ? rows.map(({ id, name, slug, description }) => ({ id, name, slug, description: description ?? "" })) : categories;
  } catch {
    return categories;
  }
}