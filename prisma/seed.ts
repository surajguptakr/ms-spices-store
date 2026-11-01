import { db as prisma } from "../src/prisma/db";
import bcrypt from "bcryptjs";
import { categories, products } from "../src/lib/catalog";

const productsWithFixedPacks = new Set(["mirchi-powder", "haldi-powder", "dhaniya-powder", "mix-masala"]);

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@msspices.in";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password === "change-this-before-deploying") {
    throw new Error("Set a unique ADMIN_PASSWORD in the environment before seeding the admin account.");
  }

  for (const category of categories) {
    await prisma.orm.public.Category.upsert({
      create: category,
      update: category,
      conflictOn: { slug: category.slug },
    });
  }

  for (const product of products) {
    const category = categories.find((item) => item.slug === product.categorySlug)!;
    const savedProduct = await prisma.orm.public.Product.upsert({
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        origin: product.origin,
        ingredients: product.ingredients,
        imageUrl: product.imageUrl,
        featured: product.featured,
        categoryId: category.id,
      },
      update: {
        name: product.name,
        description: product.description,
        origin: product.origin,
        ingredients: product.ingredients,
        imageUrl: product.imageUrl,
        featured: product.featured,
        categoryId: category.id,
      },
      conflictOn: { slug: product.slug },
    });
    if (productsWithFixedPacks.has(product.slug)) {
      await prisma.orm.public.ProductVariant
        .where({ productId: savedProduct.id })
        .where((variant) => variant.sku.notIn(product.variants.map((item) => item.sku)))
        .deleteAll();
    }
    for (const variant of product.variants) {
      await prisma.orm.public.ProductVariant.upsert({
        create: { ...variant, productId: savedProduct.id },
        update: { price: variant.price, mrp: variant.mrp ?? null, size: variant.size, weightGrams: variant.weightGrams },
        conflictOn: { sku: variant.sku },
      });
    }
  }
  await prisma.orm.public.Product
    .where((product) => product.slug.notIn(products.map((item) => item.slug)))
    .updateAll({ active: false, featured: false });

  const defaultSettings: Record<string, string> = {
    announcement: "Small-batch spices, sourced with care. Free delivery on orders over Rs. 999.",
    shippingFee: "80",
    freeShippingThreshold: "999",
    codEnabled: "true",
    contactEmail: "msspices.ms@gmail.com",
    contactPhone: "+91 9942386536",
    address: "M.S. Spices, Jagiraha, Bijbani, East Champaran, Bihar, 845303, India",
    shippingPolicy: "Orders are packed fresh and dispatched within 2-3 working days. Delivery usually takes 4-7 working days depending on your PIN code.",
    returnsPolicy: "For quality concerns, contact us within 48 hours of delivery with your order number and clear photos. We will work with you on a replacement or refund.",
    privacyPolicy: "We use your contact and delivery details only to process your order and provide customer support. We do not sell personal information.",
    termsPolicy: "Product availability and prices may change. Orders are confirmed after stock verification. Cash on delivery is available at eligible PIN codes.",
  };
  const contactSettingKeys = new Set(["contactEmail", "contactPhone", "address"]);
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.orm.public.Setting.upsert({
      create: { key, value },
      update: contactSettingKeys.has(key) ? { value } : {},
      conflictOn: { key },
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.orm.public.AdminUser.upsert({
    create: { email, passwordHash },
    update: {},
    conflictOn: { email },
  });
  console.info(`Seeded ${products.length} products and ${categories.length} categories. Admin: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.close());