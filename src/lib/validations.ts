import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: z.string().trim().min(8).max(300),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pinCode: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(20),
  origin: z.string().trim().min(2).max(100),
  ingredients: z.array(z.string().trim().min(1)).min(1),
  categoryId: z.string().min(1),
  imageUrl: z.string().regex(/^\/images\/spices\/[a-z0-9-]+\.svg$/, "Choose a local spice image").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.string().trim().min(1),
    weightGrams: z.number().int().positive(),
    price: z.number().int().positive(),
    stock: z.number().int().min(0),
    sku: z.string().trim().min(2),
  })).min(1),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(100),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});