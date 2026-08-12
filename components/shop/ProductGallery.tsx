"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Media } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";

/**
 * PRODUCT GALLERY
 *
 * Desktop: a vertical thumbnail rail beside a large frame. Clicking the frame
 * opens a full-screen viewer; on a fine pointer the frame also does a
 * pointer-tracked zoom, which is the behaviour customers expect on a fashion
 * site when checking a fabric.
 *
 * Mobile: a native scroll-snap carousel with dots — no JS slider, so it moves
 * exactly as fast as the finger.
 */
export function ProductGallery({ media, name }: { media: Media[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  const active = media[index] ?? media[0];

  useEffect(() => {
    if (!full) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % media.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + media.length) % media.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [full, media.length]);

  return (
    <>
      <div className="km-gallery">
        <div className="km-gallery__thumbs" role="tablist" aria-label={`${name} images`}>
          {media.map((m, i) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`View image ${i + 1} of ${media.length}`}
              className="km-gallery__thumb"
              data-selected={i === index}
              onClick={() => setIndex(i)}
            >
              <Figure media={m} seed={m.id} ratio="portrait" sizes="80px" alt="" />
            </button>
          ))}
        </div>

        <div className="km-gallery__main">
          <button
            type="button"
            className="km-gallery__frame"
            onClick={() => setFull(true)}
            onPointerMove={(e) => {
              if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onPointerLeave={() => setZoom(null)}
            aria-label={`Open ${name} images full screen`}
          >
            <div
              className="km-gallery__zoomer"
              style={
                zoom
                  ? { scale: "1.6", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            >
              {active && (
                <Figure
                  media={active}
                  seed={active.id}
                  ratio="portrait"
                  sizes="(max-width: 1199px) 100vw, 46vw"
                  priority
                  alt={active.alt}
                />
              )}
            </div>
            <span className="km-gallery__zoomhint" aria-hidden="true">
              <Icon name="zoom" size={16} />
            </span>
          </button>

          {/* Mobile carousel — same images, native scrolling */}
          <div className="km-gallery__scroller" aria-hidden="true">
            {media.map((m) => (
              <div key={m.id} className="km-gallery__slide">
                <Figure media={m} seed={m.id} ratio="portrait" sizes="100vw" alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {full && (
          <motion.div
            className="km-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${name} images`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <button
              type="button"
              className="km-iconbtn km-lightbox__close"
              onClick={() => setFull(false)}
              aria-label="Close images"
            >
              <Icon name="close" />
            </button>

            <button
              type="button"
              className="km-lightbox__nav km-lightbox__nav--prev"
              onClick={() => setIndex((i) => (i - 1 + media.length) % media.length)}
              aria-label="Previous image"
            >
              <Icon name="chevron-left" size={26} />
            </button>

            <div className="km-lightbox__stage">
              {active && <Figure media={active} seed={`full-${active.id}`} ratio="portrait" sizes="90vw" alt={active.alt} />}
            </div>

            <button
              type="button"
              className="km-lightbox__nav km-lightbox__nav--next"
              onClick={() => setIndex((i) => (i + 1) % media.length)}
              aria-label="Next image"
            >
              <Icon name="chevron-right" size={26} />
            </button>

            <p className="km-lightbox__count" data-numeric>
              {index + 1} / {media.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
