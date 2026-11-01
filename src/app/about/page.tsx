import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Our story" };

export default function AboutPage() {
  return <main className="about-page">
    <section className="about-hero"><div><span className="eyebrow-light">A family pantry, shared</span><h1>From Jagiraha,<br />with <i>care.</i></h1><p>M.S. Spices is built around a simple belief: when the ingredients are honest, the food takes care of the rest.</p></div><div className="about-hero-image" role="img" aria-label="Traditional spices and ingredients" /></section>
    <section className="about-story section-shell"><div className="about-story-label"><span className="eyebrow-light">The way we see it</span><span className="about-number">01 / OUR STORY</span></div><div><h2>Good spice is not a shortcut.<br />It is a <i>starting point.</i></h2><p>We come from Jagiraha, where food is how a family gathers and a kitchen is never far from a conversation. The spices we grew up with were whole, fragrant, and bought from people who knew where they came from.</p><p>That is what we want to bring to your home. Carefully sourced Indian spices, handled in small batches and packed fresh. No fuss. No long ingredient lists. Just the flavour you came for.</p><Link className="text-link" href="/shop">Bring home the good stuff <ArrowRight size={15} /></Link></div></section>
    <section className="about-values"><div><span className="eyebrow-light">What matters to us</span><h2>Simple things,<br /><i>done properly.</i></h2></div><div className="value-list"><article><span>01</span><div><h3>Know the source</h3><p>We choose spices from the regions and growers known for them, with provenance that matters.</p></div></article><article><span>02</span><div><h3>Keep it fresh</h3><p>Small batches and thoughtful packing help preserve the aroma and colour your kitchen deserves.</p></div></article><article><span>03</span><div><h3>Say what is inside</h3><p>Clear ingredient labels. No unnecessary additions. The spice should speak for itself.</p></div></article></div></section>
    <section className="about-end"><span className="eyebrow-light">From our home to yours</span><h2>Make something<br /><i>memorable.</i></h2><Link className="button" href="/shop">Explore our spices <ArrowRight size={16} /></Link></section>
  </main>;
}