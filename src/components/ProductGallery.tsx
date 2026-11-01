"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const showPrevious = () => setActiveIndex((index) => (index - 1 + images.length) % images.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % images.length);

  return (
    <figure className="product-visual product-gallery">
      <div className="product-gallery-main">
        <Image
          key={images[activeIndex]}
          src={images[activeIndex]}
          alt={`${name} product view ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 760px) 90vw, 45vw"
          className="product-gallery-image"
        />
        <button type="button" className="product-gallery-nav previous" onClick={showPrevious} aria-label="Show previous product image" title="Previous image">
          <ChevronLeft size={20} />
        </button>
        <button type="button" className="product-gallery-nav next" onClick={showNext} aria-label="Show next product image" title="Next image">
          <ChevronRight size={20} />
        </button>
        <span className="product-gallery-count" aria-live="polite">{activeIndex + 1} / {images.length}</span>
      </div>
      <div className="product-gallery-thumbnails" role="group" aria-label={`${name} images`}>
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className={`product-gallery-thumbnail${index === activeIndex ? " active" : ""}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show product image ${index + 1}`}
            aria-pressed={index === activeIndex}
          >
            <Image src={image} alt="" fill sizes="80px" />
          </button>
        ))}
      </div>
    </figure>
  );
}