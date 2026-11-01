import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  return <main className="contact-page section-shell page-top"><div className="contact-heading"><span className="eyebrow-light">We are listening</span><h1 className="page-heading">Say hello.</h1><p className="muted">A question about an order, a spice, or anything else? Send us a note and we will get back to you.</p></div><div className="contact-layout"><ContactForm /><aside className="contact-details"><span className="eyebrow-light">M.S. Spices</span><h2>From Jagiraha<br />to your kitchen.</h2><p>M.S. Spices<br />Jagiraha, Bijbani<br />East Champaran, Bihar, 845303<br />India</p><a href="mailto:msspices.ms@gmail.com">msspices.ms@gmail.com</a><a href="tel:+919942385636">+91 9942385636</a><a href="https://www.instagram.com/m.sspices?exln=MXMxd3kzNGZ3anFlcQ==" target="_blank" rel="noreferrer">@m.sspices on Instagram</a><div className="contact-hours">Customer care<br />Monday to Saturday<br />10:00 am — 5:00 pm IST</div></aside></div></main>;
}