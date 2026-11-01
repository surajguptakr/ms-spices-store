import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { getStoreCategories, getStoreProducts } from "@/lib/storefront";

export default async function HomePage() {
  const [products, categories] = await Promise.all([getStoreProducts(), getStoreCategories()]);
  return (
    <main>
      <section className="hero-home">
        <div className="hero-copy">
          <span className="eyebrow-light">From our home to yours</span>
          <h1>Good food<br />begins with<br />something <i>real.</i></h1>
          <p>Honest Indian spices, gathered from the places that grow them and packed fresh in small batches.</p>
          <Link className="button" href="/shop">Explore the collection <ArrowRight size={16} /></Link>
          <div className="hero-note"><span>01 / 06</span><span>Rooted in Jagiraha</span></div>
        </div>
        <div className="hero-photo" style={{ backgroundImage: "url('/images/spices/hero-spices.svg'), url('/images/spices/placeholder.svg')" }} role="img" aria-label="Illustrative overhead scene of turmeric, red chilli, cumin and coriander"><div className="hero-stamp">A pantry<br />of colour<br /><span>✳</span></div></div>
        <a className="hero-scroll" href="#collection"><ArrowDownRight size={16} /> Scroll to discover</a>
      </section>

      <section className="home-intro section-shell" id="collection">
        <div><span className="eyebrow-light">A little more meaning</span><h2 className="section-title">The difference is<br />in the <i>details.</i></h2></div>
        <div className="intro-copy"><p>We believe the best spices do not need a long story. Just good soil, thoughtful hands, and the time to do things properly.</p><Link className="text-link" href="/about">Get to know us <ArrowUpRight size={15} /></Link></div>
      </section>

      <section className="home-products section-shell">
        <div className="section-head"><div><span className="eyebrow-light">The pantry edit</span><h2 className="section-title">A few good things.</h2></div><Link className="text-link" href="/shop">Shop all spices <ArrowRight size={15} /></Link></div>
        <div className="product-grid">{products.slice(0, 3).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
      </section>

      <section className="category-strip section-shell">
        <span className="eyebrow-light">Find your flavour</span>
        <div className="category-links">{categories.map((category, index) => <Link href={`/shop?category=${category.slug}`} className="category-link" key={category.id}><span>0{index + 1}</span><strong>{category.name}</strong><ArrowUpRight size={20} /></Link>)}</div>
      </section>

      <section className="origin-feature">
        <div className="origin-image" role="img" aria-label="Sun-dried spices at a small Indian farm" />
        <div className="origin-copy"><span className="eyebrow-light">Good things take their time</span><h2>Closer to the<br />hands that <i>grow it.</i></h2><p>We work with growers and makers who know their land and their craft. Every spice has a place it comes from, and a person behind it.</p><Link className="button button-light" href="/about">Our way of doing things <ArrowRight size={16} /></Link><span className="origin-index">M.S. / 01</span></div>
      </section>

      <section className="home-products section-shell home-second-grid">
        <div className="section-head"><div><span className="eyebrow-light">For everyday cooking</span><h2 className="section-title">Your kitchen, elevated.</h2></div><span className="muted">Freshly milled. Ready when you are.</span></div>
        <div className="product-grid">{products.slice(3).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
      </section>

      <section className="promise-band"><span className="eyebrow-light">A promise from our family</span><blockquote>“Keep it honest.<br />Let the spice speak.”</blockquote><span className="promise-signature">The M.S. family · Jagiraha</span></section>

      <section className="home-cta section-shell"><div><span className="eyebrow-light">The good stuff is right here</span><h2 className="section-title">Make room for<br /><i>better flavour.</i></h2></div><Link className="button" href="/shop">Shop the collection <ArrowRight size={16} /></Link></section>
    </main>
  );
}