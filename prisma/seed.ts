import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { categories, products } from "../src/lib/catalog";

const prisma = new PrismaClient();
const productsWithFixedPacks = new Set(["mirchi-powder", "haldi-powder", "dhaniya-powder", "mix-masala"]);

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@msspices.in";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password === "change-this-before-deploying") {
    throw new Error("Set a unique ADMIN_PASSWORD in the environment before seeding the admin account.");
  }

  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }

  for (const product of products) {
    const category = categories.find((item) => item.slug === product.categorySlug)!;
    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        origin: product.origin,
        ingredients: product.ingredients,
        imageUrl: product.imageUrl,
        featured: product.featured,
        categoryId: category.id,
      },
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
    });
    if (productsWithFixedPacks.has(product.slug)) {
      await prisma.productVariant.deleteMany({
        where: { productId: savedProduct.id, sku: { notIn: product.variants.map((variant) => variant.sku) } },
      });
    }
    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: { price: variant.price, mrp: variant.mrp ?? null, size: variant.size, weightGrams: variant.weightGrams },
        create: { ...variant, productId: savedProduct.id },
      });
    }
  }
  await prisma.product.updateMany({ where: { slug: { notIn: products.map((product) => product.slug) } }, data: { active: false, featured: false } });

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
    await prisma.setting.upsert({ where: { key }, update: contactSettingKeys.has(key) ? { value } : {}, create: { key, value } });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({ where: { email }, update: {}, create: { email, passwordHash } });
  console.info(`Seeded ${products.length} products and ${categories.length} categories. Admin: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());