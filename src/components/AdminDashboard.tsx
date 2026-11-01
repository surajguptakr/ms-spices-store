"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, PackagePlus, Save } from "lucide-react";
import { formatDate, formatINR } from "@/lib/format";

type OrderRow = { id: string; orderNumber: string; status: string; total: number; customerName: string; phone: string; createdAt: string | Date; items: Array<{ productName: string; variantLabel: string; quantity: number }> };
type VariantRow = { id: string; size: string; weightGrams: number; price: number; stock: number; sku: string };
type ProductRow = { id: string; name: string; slug: string; active: boolean; variants: VariantRow[]; category?: { name: string } };
type CategoryRow = { id: string; name: string };
type SettingValues = Record<string, string>;
const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function AdminDashboard({ email, initialOrders, initialProducts, categories, initialSettings, databaseAvailable }: {
  email: string; initialOrders: OrderRow[]; initialProducts: ProductRow[]; categories: CategoryRow[]; initialSettings: SettingValues; databaseAvailable: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("Orders");
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function updateOrder(id: string, status: string) {
    const response = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json();
    setError(!response.ok);
    setMessage(response.ok ? "Order status updated." : result.error);
    if (response.ok) setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const result = await response.json();
    setError(!response.ok);
    setMessage(response.ok ? "Store settings saved." : result.error);
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const slug = String(form.get("slug"));
    const basePrice = Number(form.get("price"));
    const stock = Number(form.get("stock"));
    const payload = {
      name, slug, description: String(form.get("description")), origin: String(form.get("origin")),
      ingredients: String(form.get("ingredients")).split(",").map((item) => item.trim()).filter(Boolean),
      categoryId: String(form.get("categoryId")), imageUrl: String(form.get("imageUrl")), featured: false, active: true,
      variants: [
        { size: "50 g", weightGrams: 50, price: basePrice, stock, sku: `MS-${slug.toUpperCase()}-050` },
        { size: "100 g", weightGrams: 100, price: basePrice * 2 - 20, stock, sku: `MS-${slug.toUpperCase()}-100` },
        { size: "250 g", weightGrams: 250, price: basePrice * 5 - 90, stock, sku: `MS-${slug.toUpperCase()}-250` },
      ],
    };
    const response = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    setError(!response.ok);
    setMessage(response.ok ? "Product added. Refresh the dashboard to see it in the storefront." : result.error);
    if (response.ok) { event.currentTarget.reset(); router.refresh(); }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return <>
    <header className="admin-topbar"><a className="wordmark" href="/"><span className="wordmark-mark">M.S.</span><span className="wordmark-name">SPICES</span></a><div><span>{email}</span><button className="admin-logout" onClick={logout}><LogOut size={15} /> Sign out</button></div></header>
    <div className="admin-content"><div className="admin-title-row"><div><span className="eyebrow-light">Store administration</span><h1>Good morning.</h1></div><a className="button button-outline" href="/api/admin/orders/export"><Download size={15} /> Export orders</a></div>
      {!databaseAvailable && <p className="notice error-notice">Database is unavailable. Configure DATABASE_URL and run the Prisma setup to load store data.</p>}
      {message && <p className={`notice ${error ? "error-notice" : ""}`} role="status">{message}</p>}
      <div className="admin-stats"><div><span>Orders</span><strong>{orders.length}</strong></div><div><span>Awaiting fulfilment</span><strong>{orders.filter((order) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)).length}</strong></div><div><span>Products</span><strong>{products.filter((product) => product.active).length}</strong></div><div><span>Revenue on record</span><strong>{formatINR(orders.reduce((sum, order) => sum + order.total, 0))}</strong></div></div>
      <nav className="admin-tabs" aria-label="Dashboard sections">{["Orders", "Products", "Settings"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</nav>
      {tab === "Orders" && <section className="admin-panel"><div className="admin-panel-heading"><h2>Recent orders</h2><span>{orders.length} shown</span></div>{orders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Placed</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong><small>{order.phone}</small></td><td>{order.customerName}</td><td>{order.items.map((item) => `${item.productName} ${item.variantLabel} ×${item.quantity}`).join(", ")}</td><td>{formatINR(order.total)}</td><td>{formatDate(order.createdAt)}</td><td><select value={order.status} aria-label={`Status for ${order.orderNumber}`} onChange={(event) => updateOrder(order.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div> : <p className="admin-empty">Orders will appear here once customers check out.</p>}</section>}
      {tab === "Products" && <section className="admin-panel"><div className="admin-panel-heading"><h2>Products</h2><span>{products.length} items</span></div><div className="admin-product-list">{products.map((product) => <div className="admin-product-row" key={product.id}><div><strong>{product.name}</strong><small>{product.category?.name ?? "Uncategorised"} · /{product.slug}</small></div><span>{product.variants.length} pack sizes</span><span>{product.variants.reduce((sum, variant) => sum + variant.stock, 0)} units</span><span>{product.active ? "Active" : "Hidden"}</span></div>)}</div><details className="admin-add-product"><summary><PackagePlus size={16} /> Add a product</summary><form className="admin-product-form" onSubmit={addProduct}><div className="form-row"><label className="form-field">Name<input name="name" required minLength={2} /></label><label className="form-field">URL slug<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label></div><div className="form-row"><label className="form-field">Origin<input name="origin" required /></label><label className="form-field">Category<select name="categoryId" required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label></div><label className="form-field">Description<textarea name="description" required minLength={20} /></label><label className="form-field">Ingredients, comma separated<input name="ingredients" required /></label><div className="form-row"><label className="form-field">Spice illustration<select name="imageUrl" defaultValue="/images/spices/jeera-powder.svg"><option value="/images/spices/jeera-powder.svg">Jeera Powder</option><option value="/images/spices/garam-masala.svg">Garam Masala</option><option value="/images/spices/dhaniya-powder.svg">Dhaniya Powder</option><option value="/images/spices/mix-masala.svg">Mix Masala</option><option value="/images/spices/haldi-powder.svg">Haldi Powder</option><option value="/images/spices/mirchi-powder.svg">Mirchi Powder</option></select></label><label className="form-field">50 g price (₹)<input name="price" type="number" min="1" required /></label><label className="form-field">Starting stock<input name="stock" type="number" min="0" required /></label></div><button className="button"><PackagePlus size={15} /> Create product</button></form></details></section>}
      {tab === "Settings" && <section className="admin-panel"><div className="admin-panel-heading"><h2>Store settings</h2><span>Changes take effect immediately</span></div><form className="settings-form" onSubmit={saveSettings}><label className="form-field">Announcement bar<input value={settings.announcement ?? ""} onChange={(event) => setSettings({ ...settings, announcement: event.target.value })} /></label><div className="form-row"><label className="form-field">Shipping fee (₹)<input type="number" min="0" value={settings.shippingFee ?? "80"} onChange={(event) => setSettings({ ...settings, shippingFee: event.target.value })} /></label><label className="form-field">Free shipping threshold (₹)<input type="number" min="0" value={settings.freeShippingThreshold ?? "999"} onChange={(event) => setSettings({ ...settings, freeShippingThreshold: event.target.value })} /></label></div><label className="admin-toggle"><input type="checkbox" checked={settings.codEnabled !== "false"} onChange={(event) => setSettings({ ...settings, codEnabled: String(event.target.checked) })} /> Accept cash-on-delivery orders</label><div className="form-row"><label className="form-field">Contact email<input type="email" value={settings.contactEmail ?? ""} onChange={(event) => setSettings({ ...settings, contactEmail: event.target.value })} /></label><label className="form-field">Contact phone<input value={settings.contactPhone ?? ""} onChange={(event) => setSettings({ ...settings, contactPhone: event.target.value })} /></label></div><label className="form-field">Business address<textarea value={settings.address ?? ""} onChange={(event) => setSettings({ ...settings, address: event.target.value })} /></label>{["shippingPolicy", "returnsPolicy", "privacyPolicy", "termsPolicy"].map((key) => <label className="form-field" key={key}>{key.replace("Policy", " policy").replace(/^./, (letter) => letter.toUpperCase())}<textarea value={settings[key] ?? ""} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} /></label>)}<button className="button"><Save size={15} /> Save settings</button></form></section>}
    </div>
  </>;
}