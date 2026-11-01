import type { Metadata } from "next";
import { ShopBrowser } from "@/components/ShopBrowser";
import { getStoreCategories, getStoreProducts } from "@/lib/storefront";

export const metadata: Metadata = { title: "Shop all spices" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category = "all" } = await searchParams;
  const [products, categories] = await Promise.all([getStoreProducts(), getStoreCategories()]);
  return <main className="shop-page section-shell page-top"><div className="shop-heading"><div><span className="eyebrow-light">The M.S. pantry</span><h1 className="page-heading">A good place to start.</h1><p className="muted">Small-batch Indian spices, sourced with care and packed fresh.</p></div><span className="shop-count">{products.length} carefully chosen staples</span></div><ShopBrowser initialCategory={category} products={products} categories={categories} /></main>;
}