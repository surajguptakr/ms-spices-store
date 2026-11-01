import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { calculatePricing, isCodServiceable } from "../src/lib/pricing";
import { products } from "../src/lib/catalog";

describe("calculatePricing", () => {
  it("adds standard shipping below the free-shipping threshold", () => {
    expect(calculatePricing([{ unitPrice: 420, quantity: 1 }])).toEqual({ subtotal: 420, shipping: 80, total: 500 });
  });

  it("waives shipping at the threshold", () => {
    expect(calculatePricing([{ unitPrice: 999, quantity: 1 }])).toEqual({ subtotal: 999, shipping: 0, total: 999 });
  });

  it("returns zero totals for an empty cart", () => {
    expect(calculatePricing([])).toEqual({ subtotal: 0, shipping: 0, total: 0 });
  });
});

describe("isCodServiceable", () => {
  it("accepts valid Indian PIN codes", () => expect(isCodServiceable("560001")).toBe(true));
  it("rejects invalid PIN codes", () => expect(isCodServiceable("012345")).toBe(false));
});

describe("product imagery", () => {
  it("includes the six M.S. Traders products", () => {
    expect(products.map((product) => product.name)).toEqual([
      "Mirchi Powder",
      "Haldi Powder",
      "Mix Masala",
      "Dhaniya Powder",
      "Garam Masala",
      "Jeera Powder",
    ]);
  });

  it("points every product to an existing local image", () => {
    for (const product of products) {
      const imagePaths = [product.imageUrl, ...(product.galleryImages ?? [])];
      for (const imagePath of imagePaths) {
        expect(imagePath).toMatch(/^\/images\/spices\/.+\.(svg|png)$/);
        expect(existsSync(join(process.cwd(), "public", decodeURIComponent(imagePath.slice(1))))).toBe(true);
      }
    }
  });

  it("uses the supplied 250 g and 500 g prices and MRPs", () => {
    const expectedPrices: Record<string, Array<{ weightGrams: number; price: number; mrp: number }>> = {
      "mirchi-powder": [{ weightGrams: 250, price: 110, mrp: 145 }, { weightGrams: 500, price: 210, mrp: 265 }],
      "haldi-powder": [{ weightGrams: 250, price: 95, mrp: 125 }, { weightGrams: 500, price: 170, mrp: 220 }],
      "dhaniya-powder": [{ weightGrams: 250, price: 90, mrp: 120 }, { weightGrams: 500, price: 160, mrp: 230 }],
      "mix-masala": [{ weightGrams: 250, price: 100, mrp: 130 }, { weightGrams: 500, price: 180, mrp: 235 }],
    };

    for (const [slug, prices] of Object.entries(expectedPrices)) {
      const product = products.find((item) => item.slug === slug);
      expect(product?.variants.map(({ weightGrams, price, mrp }) => ({ weightGrams, price, mrp }))).toEqual(prices);
    }
  });
});