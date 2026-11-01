import Link from "next/link";
import { Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand"><Link className="wordmark wordmark-light" href="/"><span className="wordmark-mark">M.S.</span><span className="wordmark-name">SPICES</span></Link><p>Good food begins with<br />something real.</p></div>
        <div className="footer-column"><span className="eyebrow">Explore</span><Link href="/shop">Shop all spices</Link><Link href="/about">Our story</Link><Link href="/contact">Get in touch</Link></div>
        <div className="footer-column"><span className="eyebrow">The details</span><Link href="/policies/shipping">Shipping</Link><Link href="/policies/returns">Returns</Link><Link href="/policies/privacy">Privacy</Link></div>
        <div className="footer-column footer-address"><span className="eyebrow">Find us</span><p>M.S. Spices<br />Jagiraha, Bijbani<br />East Champaran, Bihar, 845303<br />India</p><a href="mailto:msspices.ms@gmail.com"><Mail size={15} /> msspices.ms@gmail.com</a><a href="tel:+919942385636">+91 9942386536</a><a href="https://www.instagram.com/m.sspices?exln=MXMxd3kzNGZ3anFlcQ==" target="_blank" rel="noreferrer"><Instagram size={15} /> @m.sspices</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} M.S. Spices</span><span>Rooted in Jagiraha. Made for your kitchen.</span></div>
    </footer>
  );
}