import { categories, products, type Product } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

function findStoreProductRows() {
  return prisma.orm.public.Product
    .where({ active: true })
    .include("category")
    .include("variants")
    .orderBy((product) => product.name.asc())
    .all();
}

type ProductRow = Awaited<ReturnType<typeof findStoreProductRows>>[number];
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
    ingredients: row.ingredients.filter((ingredient): ingredient is string => ingredient !== null),
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
    const rows = await findStoreProductRows();
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
    const rows = await prisma.orm.public.Category
      .orderBy((category) => category.name.asc())
      .all();
    return rows.length ? rows.map(({ id, name, slug, description }) => ({ id, name, slug, description: description ?? "" })) : categories;
  } catch {
    return categories;
  }
}