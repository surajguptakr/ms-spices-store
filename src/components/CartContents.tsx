"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartContents() {
  const { items, subtotal, shippingFee, freeShippingThreshold, updateQuantity, removeItem } = useCart();
  if (!items.length) return <div className="empty-cart"><p>Your bag is waiting for something good.</p><Link className="button" href="/shop">Browse the pantry</Link></div>;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const hasUnavailableItems = items.some(({ variant, quantity }) => variant.stock < quantity);
  return <div className="cart-layout"><section className="cart-lines" aria-label="Items in your bag">{items.map(({ product, variant, quantity }) => <article className="cart-line" key={variant.id}>
    <Link className="cart-thumb" href={`/product/${product.slug}`} style={{ backgroundImage: `url("${product.imageUrl}"), url("/images/spices/placeholder.svg")` }} aria-label={`View ${product.name} illustration`} />
    <div className="cart-item-copy"><Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link><p>{variant.size} · {variant.sku}</p>{variant.stock < quantity && <p className="stock-warning">Only {variant.stock} available. Update your quantity to continue.</p>}<div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => updateQuantity(variant.id, quantity - 1)}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(variant.id, quantity + 1)}><Plus size={14} /></button></div></div>
    <div className="cart-line-end"><strong>{formatINR(variant.price * quantity)}</strong><button className="remove-button" aria-label={`Remove ${product.name}`} onClick={() => removeItem(variant.id)}><Trash2 size={15} /></button></div>
  </article>)}</section>
  <aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><span>{formatINR(subtotal)}</span></div><div><span>Delivery</span><span>{shipping ? formatINR(shipping) : "Complimentary"}</span></div>{subtotal < freeShippingThreshold && <p className="summary-note">Add {formatINR(freeShippingThreshold - subtotal)} more for complimentary delivery.</p>}<div className="summary-total"><strong>Total</strong><strong>{formatINR(subtotal + shipping)}</strong></div>{hasUnavailableItems && <p className="notice error-notice">Please adjust unavailable quantities before checkout.</p>}{hasUnavailableItems ? <button className="button checkout-button" disabled>Continue to checkout</button> : <Link className="button checkout-button" href="/checkout">Continue to checkout</Link>}<Link className="continue-link" href="/shop">Continue shopping</Link></aside></div>;
}