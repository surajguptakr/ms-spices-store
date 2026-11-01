import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
    const header = ["Order", "Date", "Status", "Customer", "Email", "Phone", "Address", "PIN", "Items", "Subtotal", "Shipping", "Total"];
    const rows = orders.map((order) => [order.orderNumber, order.createdAt.toISOString(), order.status, order.customerName, order.email, order.phone, `${order.address}, ${order.city}, ${order.state}`, order.pinCode, order.items.map((item) => `${item.productName} ${item.variantLabel} x${item.quantity}`).join("; "), order.subtotal, order.shipping, order.total]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=ms-spices-orders.csv", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not export orders." }, { status: 503 });
  }
}