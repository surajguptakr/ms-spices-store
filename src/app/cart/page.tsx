import type { Metadata } from "next";
import { CartContents } from "@/components/CartContents";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return <main className="cart-page section-shell page-top"><span className="eyebrow-light">Your M.S. pantry</span><h1 className="page-heading">Your bag.</h1><CartContents /></main>;
}