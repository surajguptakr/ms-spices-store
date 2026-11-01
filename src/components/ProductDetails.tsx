"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Plus, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { formatINR, formatWeight } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export function ProductDetails({ product }: { product: Product }) {
  const [selected, setSelected] = useState(product.variants[0]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  return <section className="product-detail-copy">
    <Link className="back-link" href="/shop"><ArrowLeft size={15} /> All spices</Link>
    <span className="eyebrow-light">{product.category} · {product.origin}</span>
    <h1 className="page-heading">{product.name}</h1>
    <p className="detail-description">{product.description}</p>
    <div className="detail-price">{formatINR(selected.price)} {selected.mrp && <del className="detail-mrp">MRP {formatINR(selected.mrp)}</del>}<span>incl. of all taxes</span></div>
    <fieldset className="pack-selector"><legend>Choose a pack</legend><div>{product.variants.map((variant) => <button key={variant.id} type="button" className={`pack-option ${selected.id === variant.id ? "selected" : ""}`} onClick={() => { setSelected(variant); setAdded(false); }}><span>{formatWeight(variant.weightGrams)}</span><strong>{formatINR(variant.price)}</strong>{variant.mrp && <del>{formatINR(variant.mrp)}</del>}</button>)}</div></fieldset>
    <button className="button add-button" onClick={() => { addItem(product, selected); setAdded(true); }}>{added ? <><Check size={17} /> Added to your bag</> : <>Add to bag <Plus size={17} /></>}</button>
    <p className="stock-line">{selected.stock > 0 ? "In stock, ready to travel" : "Currently out of stock"}</p>
    <div className="detail-promise"><ShieldCheck size={17} /><span>Freshly packed in small batches · Cash on delivery available</span></div>
    <div className="detail-facts"><div><span className="eyebrow-light">From</span><p>{product.origin}</p></div><div><span className="eyebrow-light">Ingredients</span><p>{product.ingredients.join(", ")}</p></div></div>
  </section>;
}