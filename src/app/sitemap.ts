import type { MetadataRoute } from "next";
import { products } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://msspices.in";
  const pages = ["", "/shop", "/about", "/contact", "/policies/shipping", "/policies/returns", "/policies/privacy", "/policies/terms"];
  return [...pages.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() })), ...products.map((product) => ({ url: `${baseUrl}/product/${product.slug}`, lastModified: new Date() }))];
}