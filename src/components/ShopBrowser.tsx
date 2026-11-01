"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/catalog";

type Category = { id: string; name: string; slug: string };

export function ShopBrowser({ initialCategory, products, categories }: { initialCategory: string; products: Product[]; categories: Category[] }) {
  const [category, setCategory] = useState(initialCategory);
  const [size, setSize] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.origin} ${product.ingredients.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "all" || product.categorySlug === category) && (size === "all" || product.variants.some((variant) => variant.size === size && (!stockOnly || variant.stock > 0))) && (!stockOnly || product.variants.some((variant) => variant.stock > 0));
  }).sort((a, b) => sort === "price-low" ? a.variants[0].price - b.variants[0].price : sort === "price-high" ? b.variants[0].price - a.variants[0].price : Number(b.featured) - Number(a.featured)), [category, query, size, sort, stockOnly]);

  return <div className="shop-browser">
    <div className="shop-toolbar">
      <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search spices, origin..." aria-label="Search products" /></label>
      <label className="select-field"><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
      <label className="select-field"><select value={size} onChange={(event) => setSize(event.target.value)} aria-label="Filter by pack size"><option value="all">Any pack size</option><option>50 g</option><option>100 g</option><option>250 g</option></select></label>
      <label className="select-field"><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
      <label className="stock-filter"><input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} /> In stock</label>
    </div>
    <div className="shop-result-count">Showing {filtered.length} {filtered.length === 1 ? "spice" : "spices"}</div>
    {filtered.length ? <div className="product-grid shop-grid">{filtered.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div> : <div className="empty-results"><p>Nothing in the pantry by that name.</p><button className="text-link" onClick={() => { setCategory("all"); setSize("all"); setStockOnly(false); setQuery(""); }}>Clear filters</button></div>}
  </div>;
}