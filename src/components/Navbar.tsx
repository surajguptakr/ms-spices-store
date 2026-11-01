"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const links = [{ href: "/shop", label: "Shop" }, { href: "/about", label: "Our story" }, { href: "/contact", label: "Contact" }];

export function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <button className="icon-button menu-toggle" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link className="wordmark" href="/" aria-label="M.S. Spices home"><span className="wordmark-mark">M.S.</span><span className="wordmark-name">SPICES</span></Link>
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        </nav>
        <Link className="cart-link" href="/cart" aria-label={`Shopping bag, ${count} items`}><ShoppingBag size={19} /><span>Bag</span><span className="cart-count">{count}</span></Link>
      </div>
    </header>
  );
}