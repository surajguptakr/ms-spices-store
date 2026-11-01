import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 });
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Could not load orders." }, { status: 503 });
  }
}