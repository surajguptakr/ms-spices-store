"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";

export function CheckoutForm() {
  const { items, subtotal, shippingFee, freeShippingThreshold, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinCode, setPinCode] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  if (!items.length) return <div className="empty-cart"><p>Your bag is empty.</p><Link className="button" href="/shop">Browse the pantry</Link></div>;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;

  async function checkPinCode() {
    setPinBusy(true);
    setPinMessage("");
    const response = await fetch("/api/shipping/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinCode }) });
    const result = await response.json();
    setPinBusy(false);
    if (!response.ok) { setPinMessage(result.error ?? "Could not check this PIN code."); return; }
    setPinMessage(`Delivery available in ${result.location.city}, ${result.location.state}.`);
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, items: items.map(({ variant, quantity }) => ({ variantId: variant.id, quantity })) }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) { setError(result.error ?? "We could not place your order. Please check your details and try again."); return; }
    clearCart();
    router.push(`/order-confirmation/${result.orderNumber}`);
  }

  return <div className="checkout-layout"><form className="checkout-form" onSubmit={submitOrder}>
    <h2>Contact and delivery</h2>
    <label className="form-field">Full name<input name="customerName" autoComplete="name" required minLength={2} /></label>
    <div className="form-row"><label className="form-field">Email address<input type="email" name="email" autoComplete="email" required /></label><label className="form-field">Mobile number<input name="phone" inputMode="numeric" autoComplete="tel" pattern="[6-9][0-9]{9}" title="Enter a 10-digit Indian mobile number" required /></label></div>
    <label className="form-field">Street address<textarea name="address" autoComplete="street-address" required minLength={8} /></label>
    <div className="form-row form-row-three"><label className="form-field">City<input name="city" autoComplete="address-level2" required /></label><label className="form-field">State<input name="state" autoComplete="address-level1" required /></label><label className="form-field">PIN code<input name="pinCode" inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" title="Enter a valid 6-digit PIN code" value={pinCode} onChange={(event) => { setPinCode(event.target.value); setPinMessage(""); }} required /></label></div>
    <div className="pin-check-row"><button className="text-link" type="button" disabled={pinBusy || pinCode.length !== 6} onClick={checkPinCode}>{pinBusy ? "Checking..." : "Check PIN code delivery"}</button>{pinMessage && <span className={pinMessage.startsWith("Delivery available") ? "pin-success" : "pin-error"} role="status">{pinMessage}</span>}</div>
    <label className="form-field">Order note <span className="muted">(optional)</span><textarea name="notes" maxLength={500} /></label>
    <div className="cod-note"><strong>Cash on delivery</strong><span>Pay in cash when your spices arrive.</span></div>
    {error && <p className="notice error-notice" role="alert">{error}</p>}
    <button className="button checkout-button" disabled={busy}>{busy ? "Placing your order..." : `Place COD order · ${formatINR(subtotal + shipping)}`}</button>
  </form><aside className="order-summary"><h2>Your order</h2>{items.map(({ product, variant, quantity }) => <div className="summary-product" key={variant.id}><span>{product.name} · {variant.size} × {quantity}</span><span>{formatINR(variant.price * quantity)}</span></div>)}<div><span>Subtotal</span><span>{formatINR(subtotal)}</span></div><div><span>Delivery</span><span>{shipping ? formatINR(shipping) : "Complimentary"}</span></div><div className="summary-total"><strong>Total</strong><strong>{formatINR(subtotal + shipping)}</strong></div></aside></div>;
}