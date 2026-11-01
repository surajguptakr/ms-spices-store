export type ProductVariant = {
  id: string;
  size: string;
  weightGrams: number;
  price: number;
  mrp?: number;
  stock: number;
  sku: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  origin: string;
  ingredients: string[];
  imageUrl: string;
  galleryImages?: string[];
  featured: boolean;
  variants: ProductVariant[];
};

const createVariants = (slug: string, basePrice: number): ProductVariant[] => [
  { id: `variant-${slug}-50g`, size: "50 g", weightGrams: 50, price: basePrice, stock: 48, sku: `MS-${slug.toUpperCase()}-050` },
  { id: `variant-${slug}-100g`, size: "100 g", weightGrams: 100, price: basePrice * 2 - 20, stock: 35, sku: `MS-${slug.toUpperCase()}-100` },
  { id: `variant-${slug}-250g`, size: "250 g", weightGrams: 250, price: basePrice * 5 - 90, stock: 18, sku: `MS-${slug.toUpperCase()}-250` },
];

const createPricedVariants = (slug: string, prices: Array<{ weightGrams: number; price: number; mrp: number }>): ProductVariant[] =>
  prices.map(({ weightGrams, price, mrp }) => ({
    id: `variant-${slug}-${weightGrams}g`,
    size: `${weightGrams} g`,
    weightGrams,
    price,
    mrp,
    stock: weightGrams === 250 ? 18 : 10,
    sku: `MS-${slug.toUpperCase()}-${String(weightGrams).padStart(3, "0")}`,
  }));

export const products: Product[] = [
  {
    id: "product-jeera-powder", name: "Jeera Powder", slug: "jeera-powder", category: "Ground Spices", categorySlug: "ground-spices",
    description: "A familiar kitchen staple with a warm, earthy aroma. Add to dals, vegetables, marinades and everyday family recipes.", origin: "M.S. Traders collection", ingredients: ["Cumin (jeera)"],
    imageUrl: "/images/spices/M.S%20Jeera%20Powder%20Rustic%20Product%20Collage.png",
    galleryImages: [
      "/images/spices/M.S%20Jeera%20Powder%20Rustic%20Product%20Collage.png",
      "/images/spices/M.S%20Jeera%20Powder%20Rustic%20Product%20Collage%20(1).png",
      "/images/spices/M.S%20Jeera%20Powder%20Rustic%20Product%20Collage%20(2).png",
    ],
    featured: true, variants: createVariants("jeera", 129),
  },
  {
    id: "product-garam-masala", name: "Garam Masala", slug: "garam-masala", category: "Masala Blends", categorySlug: "blends",
    description: "A fragrant everyday masala for curries, dals and roasted vegetables. Add during cooking or finish a dish with a pinch.", origin: "M.S. Traders collection", ingredients: ["Spice blend"],
    imageUrl: "/images/spices/M.S%20Garam%20Masala%20Spice%20Packaging%20Still%20Life.png",
    galleryImages: [
      "/images/spices/M.S%20Garam%20Masala%20Spice%20Packaging%20Still%20Life.png",
      "/images/spices/M.S%20Garam%20Masala%20Spice%20Packaging%20Still%20Life%20(1).png",
    ],
    featured: true, variants: createVariants("garam-masala", 159),
  },
  {
    id: "product-dhaniya-powder", name: "Dhaniya Powder", slug: "dhaniya-powder", category: "Ground Spices", categorySlug: "ground-spices",
    description: "A versatile coriander spice for everyday cooking. Works well in sabzis, gravies, marinades and home-style masala mixes.", origin: "M.S. Traders collection", ingredients: ["Coriander (dhaniya)"],
    imageUrl: "/images/spices/M.S%20Dhaniya%20Powder%20Product%20Showcase.png",
    galleryImages: [
      "/images/spices/M.S%20Dhaniya%20Powder%20Product%20Showcase.png",
      "/images/spices/M.S%20Dhaniya%20Powder%20Product%20Showcase%20(1).png",
      "/images/spices/M.S%20Dhaniya%20Powder%20Product%20Showcase%20(2).png",
    ],
    featured: true, variants: createPricedVariants("dhaniya", [
      { weightGrams: 250, price: 90, mrp: 120 },
      { weightGrams: 500, price: 160, mrp: 230 },
    ]),
  },
  {
    id: "product-mix-masala", name: "Mix Masala", slug: "mix-masala", category: "Masala Blends", categorySlug: "blends",
    description: "An all-purpose masala blend for adding depth to home-cooked dishes. Use in curries, vegetables, snacks or your own kitchen creations.", origin: "M.S. Traders collection", ingredients: ["Spice blend"],
    imageUrl: "/images/spices/Mix%20masala.png",
    galleryImages: [
      "/images/spices/Mix%20masala.png",
      "/images/spices/mix%20masala%201.png",
    ],
    featured: true, variants: createPricedVariants("mix-masala", [
      { weightGrams: 250, price: 100, mrp: 130 },
      { weightGrams: 500, price: 180, mrp: 235 },
    ]),
  },
  {
    id: "product-haldi-powder", name: "Haldi Powder", slug: "haldi-powder", category: "Ground Spices", categorySlug: "ground-spices",
    description: "A golden everyday spice for dals, vegetables and curries. Stir into warm oil at the start of cooking to bring it into your recipes.", origin: "M.S. Traders collection", ingredients: ["Turmeric (haldi)"],
    imageUrl: "/images/spices/M.S%20Haldi%20Powder%20Rustic%20Product%20Collage.png",
    galleryImages: [
      "/images/spices/M.S%20Haldi%20Powder%20Rustic%20Product%20Collage.png",
      "/images/spices/M.S%20Haldi%20Powder%20Rustic%20Product%20Collage%20(1).png",
      "/images/spices/M.S%20Haldi%20Powder%20Rustic%20Product%20Collage%20(2).png",
    ],
    featured: true, variants: createPricedVariants("haldi", [
      { weightGrams: 250, price: 95, mrp: 125 },
      { weightGrams: 500, price: 170, mrp: 220 },
    ]),
  },
  {
    id: "product-mirchi-powder", name: "Mirchi Powder", slug: "mirchi-powder", category: "Ground Spices", categorySlug: "ground-spices",
    description: "A bright red chilli spice for bringing warmth to curries, marinades and everyday cooking. Adjust the amount to suit your dish.", origin: "M.S. Traders collection", ingredients: ["Red chilli (mirchi)"],
    imageUrl: "/images/spices/M.S%20Mirchi%20Powder%20Product%20Showcase%20(1).png",
    galleryImages: [
      "/images/spices/M.S%20Mirchi%20Powder%20Product%20Showcase%20(1).png",
      "/images/spices/M.S%20Mirchi%20Powder%20Product%20Showcase%20(2).png",
      "/images/spices/M.S%20Mirchi%20Powder%20Product%20Showcase%20(3).png",
    ],
    featured: true, variants: createPricedVariants("mirchi", [
      { weightGrams: 250, price: 110, mrp: 145 },
      { weightGrams: 500, price: 210, mrp: 265 },
    ]),
  },
].sort((first, second) => {
  const displayOrder = ["mirchi-powder", "haldi-powder", "mix-masala", "dhaniya-powder", "garam-masala", "jeera-powder"];
  return displayOrder.indexOf(first.slug) - displayOrder.indexOf(second.slug);
});

export const categories = [
  { id: "category-ground-spices", name: "Ground Spices", slug: "ground-spices", description: "Freshly milled essentials" },
  { id: "category-blends", name: "Masala Blends", slug: "blends", description: "Everyday masala blends" },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}