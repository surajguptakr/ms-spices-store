import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  let orders: Prisma.OrderGetPayload<{ include: { items: true } }>[] = [];
  let products: Prisma.ProductGetPayload<{ include: { variants: true; category: true } }>[] = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let settings: Record<string, string> = {};
  let databaseAvailable = true;
  try {
    const [orderRows, productRows, categoryRows, settingRows] = await Promise.all([
      prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.product.findMany({ include: { variants: true, category: true }, orderBy: { name: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.setting.findMany(),
    ]);
    orders = orderRows;
    products = productRows;
    categories = categoryRows;
    settings = Object.fromEntries(settingRows.map(({ key, value }) => [key, value]));
  } catch {
    databaseAvailable = false;
  }
  return <main className="admin-page"><AdminDashboard email={session.email} initialOrders={orders} initialProducts={products} categories={categories} initialSettings={settings} databaseAvailable={databaseAvailable} /></main>;
}