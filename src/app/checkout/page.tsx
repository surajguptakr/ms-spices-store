import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <main className="checkout-page section-shell page-top"><span className="eyebrow-light">Almost there</span><h1 className="page-heading">Delivery details.</h1><CheckoutForm /></main>;
}