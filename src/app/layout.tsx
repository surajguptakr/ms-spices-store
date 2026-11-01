import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "M.S. Spices | Good food begins with something real", template: "%s | M.S. Spices" },
  description: "Small-batch Indian spices, sourced with care from the places that grow them.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><CartProvider><div className="announcement">Small-batch spices, sourced with care <span>·</span> Free delivery over ₹999</div><Navbar />{children}<Footer /></CartProvider></body></html>;
}