import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-api";
import { orderStatusSchema } from "@/lib/validations";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = orderStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  const { id } = await params;
  try {
    const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
}