import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/catalog";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const lowestPriceVariant = product.variants.reduce((lowest, variant) => variant.price < lowest.price ? variant : lowest, product.variants[0]);
  return (
    <article className="product-card" style={{ animationDelay: `${index * 80}ms` }}>
      <Link href={`/product/${product.slug}`} className="product-image" style={{ backgroundImage: `url("${product.imageUrl}"), url("/images/spices/placeholder.svg")` }} aria-label={`View ${product.name}`}>
        <span className="product-category">{product.category}</span>
        <span className="product-image-note">{product.galleryImages?.length ? "Product photos" : "Illustration"}</span>
        <span className="product-arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="product-card-info">
        <div><Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link><p>{product.origin}</p></div>
        <span className="product-price">From {formatINR(lowestPriceVariant.price)} {lowestPriceVariant.mrp && <del>{formatINR(lowestPriceVariant.mrp)}</del>}</span>
      </div>
    </article>
  );
}