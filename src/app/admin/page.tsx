import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

function findAdminOrders() {
  return prisma.orm.public.Order
    .include("items")
    .orderBy((order) => order.createdAt.desc())
    .limit(200)
    .all();
}

function findAdminProducts() {
  return prisma.orm.public.Product
    .include("variants")
    .include("category")
    .orderBy((product) => product.name.asc())
    .all();
}

function findAdminCategories() {
  return prisma.orm.public.Category
    .orderBy((category) => category.name.asc())
    .all();
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  let orders: Awaited<ReturnType<typeof findAdminOrders>> = [];
  let products: Awaited<ReturnType<typeof findAdminProducts>> = [];
  let categories: Awaited<ReturnType<typeof findAdminCategories>> = [];
  let settings: Record<string, string> = {};
  let databaseAvailable = true;
  try {
    const [orderRows, productRows, categoryRows, settingRows] = await Promise.all([
      findAdminOrders(),
      findAdminProducts(),
      findAdminCategories(),
      prisma.orm.public.Setting.all(),
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