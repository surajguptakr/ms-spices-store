import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/format";

type PageProps = { params: Promise<{ orderNumber: string }> };

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = await params;
  let order;
  try { order = await prisma.order.findUnique({ where: { orderNumber }, include: { items: true } }); } catch { notFound(); }
  if (!order) notFound();
  return <main className="confirmation-page"><div className="confirmation-check"><Check size={24} /></div><span className="eyebrow-light">Order received</span><h1>Thank you, {order.customerName.split(" ")[0]}.</h1><p>Your order is in good hands. We will reach you on <strong>{order.phone}</strong> to confirm delivery details.</p><div className="confirmation-box"><span>Order number</span><br /><strong>{order.orderNumber}</strong><p>{order.items.map((item) => `${item.productName} · ${item.variantLabel} × ${item.quantity}`).join(" / ")}</p><strong>{formatINR(order.total)} · Cash on delivery</strong></div><p>We have sent the order details to {order.email}.</p><a className="button" href="/shop">Back to the pantry</a></main>;
}