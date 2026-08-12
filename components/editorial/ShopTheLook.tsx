"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/shop/Price";
import { useStore } from "@/components/shop/StoreProvider";
import { Reveal, MaskLine, Portal } from "@/components/motion/Reveal";
import { allSizes, availableSizes, findVariant } from "@/lib/commerce/stock";

/**
 * SHOP THE LOOK — a lookbook with real commerce behind it.
 *
 * Hotspots sit on the outfit; selecting one highlights the matching item in
 * the panel beside it (and the reverse). "Add the full look" is deliberately
 * NOT one blind button: each garment still needs its own size, because a
 * 4-year-old's dress and her sandals are not the same size, and pretending
 * otherwise generates returns.
 *
 * Mobile: the panel moves below the image and hotspots stay tappable at 44px.
 */

interface Hotspot {
  product: Product;
  /** Percentage position on the image */
  x: number;
  y: number;
}

export function ShopTheLook({ products }: { products: Product[] }) {
  const { addLine } = useStore();
  const items = products.slice(0, 4);

  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const [sizes, setSizes] = useState<Record<string, string>>({});

  if (items.length === 0) return null;

  const spots: Hotspot[] = items.map((product, i) => ({
    product,
    x: [46, 62, 38, 55][i] ?? 50,
    y: [26, 52, 68, 86][i] ?? 50,
  }));

  const addOne = (product: Product) => {
    const size = sizes[product.id];
    const color = product.colors[0];
    if (!size || !color) return false;
    const variant = findVariant(product, color.id, size);
    if (!variant) return false;

    addLine({
      key: `${product.id}:${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      colorId: color.id,
      colorName: color.name,
      size,
      qty: 1,
      unitUsd: product.priceUsd,
      compareAtUsd: product.compareAtUsd,
      plate: product.media[0]?.plate,
      src: product.media[0]?.src ?? null,
    });
    return true;
  };

  const allChosen = items.every((p) => sizes[p.id]);
  const total = items.reduce((sum, p) => sum + p.priceUsd, 0);

  return (
    <section className="km-section km-shell-wide" data-world="girls" aria-labelledby="km-look-title">
      <div className="km-head">
        <Reveal className="km-head__text">
          <p className="km-eyebrow">Shop the look</p>
          <h2 id="km-look-title" className="km-section-type km-head__title">
            <MaskLine>The whole outfit</MaskLine>
          </h2>
          <p className="km-head__copy">
            Tap a point on the photograph to see the piece. Choose each size —
            they are rarely the same.
          </p>
        </Reveal>
      </div>

      <div className="km-look">
        <Reveal className="km-look__stage">
          <Portal className="km-arch-soft">
            <Figure
              seed="look-hero"
              plate="campaign"
              ratio="editorial"
              sizes="(max-width: 1199px) 100vw, 55vw"
              alt="A child wearing a complete Kids Moda outfit"
            />
          </Portal>

          {spots.map((s) => (
            <button
              key={s.product.id}
              type="button"
              className="km-look__hotspot"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              aria-expanded={active === s.product.id}
              aria-controls={`km-look-item-${s.product.id}`}
              onClick={() => setActive(s.product.id)}
            >
              <Icon name={active === s.product.id ? "check" : "plus"} size={16} />
              <span className="km-sr">Show {s.product.name}</span>
            </button>
          ))}
        </Reveal>

        <Reveal className="km-look__panel" delay={120}>
          {items.map((p) => {
            const inStock = availableSizes(p, p.colors[0]?.id ?? "");
            const every = allSizes(p);
            return (
              <div
                key={p.id}
                id={`km-look-item-${p.id}`}
                className="km-look__item"
                data-active={active === p.id}
                onMouseEnter={() => setActive(p.id)}
              >
                <Figure
                  media={p.media[0]}
                  seed={`look-${p.id}`}
                  ratio="portrait"
                  sizes="72px"
                  alt=""
                />
                <div>
                  <Link href={`/product/${p.slug}`} className="km-look__item-name">
                    {p.name}
                  </Link>
                  <Price usd={p.priceUsd} compareAt={p.compareAtUsd} size="sm" />

                  <div className="km-look__sizes">
                    {every.slice(0, 6).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="km-chip km-chip--sm"
                        disabled={!inStock.includes(s)}
                        aria-pressed={sizes[p.id] === s}
                        onClick={() => setSizes((prev) => ({ ...prev, [p.id]: s }))}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="km-btn km-btn--sm"
                  disabled={!sizes[p.id]}
                  onClick={() => addOne(p)}
                  aria-label={sizes[p.id] ? `Add ${p.name} in size ${sizes[p.id]}` : `Choose a size for ${p.name} first`}
                >
                  Add
                </button>
              </div>
            );
          })}

          <div className="km-look__foot">
            <div>
              <p className="km-eyebrow">Complete look</p>
              <Price usd={total} compareAt={null} size="lg" />
            </div>
            <button
              type="button"
              className="km-btn"
              disabled={!allChosen}
              onClick={() => items.forEach(addOne)}
            >
              {allChosen ? "Add the full look" : "Choose every size"}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
