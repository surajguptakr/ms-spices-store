import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { calculatePricing } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { lookupDeliveryPin } from "@/lib/shipping";

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your delivery details and cart." }, { status: 400 });
  const data = parsed.data;
  try {
    if (!(await lookupDeliveryPin(data.pinCode))) return NextResponse.json({ error: "Cash on delivery is not available for this PIN code." }, { status: 422 });
  } catch {
    return NextResponse.json({ error: "PIN code lookup is temporarily unavailable. Please try again." }, { status: 503 });
  }
  const quantities = new Map<string, number>();
  for (const item of data.items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  try {
    const order = await prisma.transaction(async (tx) => {
      const ids = [...quantities.keys()];
      const variants = await tx.orm.public.ProductVariant
        .where((variant) => variant.id.in(ids))
        .include("product")
        .all();
      const activeVariants = variants.filter((variant) => variant.product.active);
      if (activeVariants.length !== ids.length) throw new Error("One or more products are no longer available. Please refresh your bag.");
      for (const variant of activeVariants) {
        const quantity = quantities.get(variant.id)!;
        if (variant.stock < quantity) throw new Error(`${variant.product.name} has only ${variant.stock} left in stock.`);
      }
      const settingRows = await tx.orm.public.Setting
        .where((setting) => setting.key.in(["shippingFee", "freeShippingThreshold", "codEnabled"]))
        .all();
      const settings = Object.fromEntries(settingRows.map((setting) => [setting.key, setting.value]));
      if (settings.codEnabled === "false") throw new Error("Cash on delivery is temporarily unavailable.");
      const lines = activeVariants.map((variant) => ({ variant, quantity: quantities.get(variant.id)! }));
      const pricing = calculatePricing(lines.map(({ variant, quantity }) => ({ unitPrice: variant.price, quantity })), {
        shippingFee: Number(settings.shippingFee) || 80,
        freeShippingThreshold: Number(settings.freeShippingThreshold) || 999,
      });
      for (const { variant, quantity } of lines) {
        const stockUpdate = tx.raw.sql`
          UPDATE "ProductVariant"
          SET "stock" = "stock" - ${quantity}
          WHERE "id" = ${variant.id} AND "stock" >= ${quantity}
        `.affectedCount().build();
        const { affectedRows } = await tx.execute(stockUpdate);
        if (affectedRows !== 1) throw new Error(`${variant.product.name} stock changed. Please try again.`);
      }
      const orderNumber = `MS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const order = await tx.orm.public.Order.create({
        orderNumber,
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        total: pricing.total,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        notes: data.notes,
      });
      await tx.orm.public.OrderItem.createAll(
        lines.map(({ variant, quantity }) => ({
          orderId: order.id,
          productName: variant.product.name,
          variantLabel: variant.size,
          sku: variant.sku,
          unitPrice: variant.price,
          quantity,
        })),
      );
      return order;
    });
    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order service is temporarily unavailable.";
    const status = message.includes("stock") || message.includes("available") || message.includes("delivery") ? 409 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}