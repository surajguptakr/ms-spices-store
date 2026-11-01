import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetails } from "@/components/ProductDetails";
import { getStoreProduct } from "@/lib/storefront";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  return { title: product?.name ?? "Spice" };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  if (!product) notFound();
  return <main className="product-detail section-shell">{product.galleryImages?.length ? <ProductGallery name={product.name} images={product.galleryImages} /> : <figure className="product-visual"><div className="product-detail-image" style={{ backgroundImage: `url("${product.imageUrl}"), url("/images/spices/placeholder.svg")` }} role="img" aria-label={`${product.name} illustrative spice artwork`} /><figcaption>Illustrative spice artwork. Replace with an actual M.S. Traders product photo before publication.</figcaption></figure>}<ProductDetails product={product} /></main>;
}