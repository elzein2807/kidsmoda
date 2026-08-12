"use client";

import Link from "next/link";
import { useState } from "react";

import type { Product } from "@/types/catalog";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/shop/Price";
import { useStore } from "@/components/shop/StoreProvider";
import {
  allSizes,
  availableSizes,
  findVariant,
  isOnSale,
  productAvailability,
  variantStock,
} from "@/lib/commerce/stock";
import { cx } from "@/lib/utils";

/**
 * PRODUCT CARD
 *
 * No box, no border, no shadow — the image and the type do the work, which is
 * what keeps a grid of these from reading as a template.
 *
 * States covered: default · hover (second image + quick add) · new · sale ·
 * bestseller · low stock · sold out · unavailable size · multiple colours ·
 * wishlist active. Every badge carries a word, never colour alone.
 */
export function ProductCard({
  product,
  priority = false,
  sizes = "(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 25vw",
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  const { addLine, toggleWish, isWished } = useStore();
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");

  const availability = productAvailability(product);
  const soldOut = availability === "sold-out";
  const onSale = isOnSale(product);
  const wished = isWished(product.id);

  const inStockSizes = availableSizes(product, colorId);
  const everySize = allSizes(product);
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];

  const quickAdd = (size: string) => {
    if (!color) return;
    const variant = findVariant(product, color.id, size);
    if (!variant || variantStock(variant).available === 0) return;

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
  };

  return (
    <article className={cx("km-card", soldOut && "km-card--soldout")} data-world={product.gender}>
      <div className="km-card__media">
        <div className="km-card__badges">
          {product.isNew && !soldOut && <span className="km-badge km-badge--new">New</span>}
          {onSale && !soldOut && <span className="km-badge km-badge--sale">Sale</span>}
          {product.isBestseller && !onSale && !product.isNew && !soldOut && (
            <span className="km-badge km-badge--best">Bestseller</span>
          )}
          {availability === "low-stock" && <span className="km-badge km-badge--low">Only a few left</span>}
          {soldOut && <span className="km-badge km-badge--soldout">Sold out</span>}
        </div>

        <button
          type="button"
          className="km-iconbtn km-card__wish"
          onClick={() => toggleWish(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          data-active={wished}
        >
          <Icon name={wished ? "heart-filled" : "heart"} size={19} />
        </button>

        {/* The image is not its own link. The product name below is the single
            accessible link, and its ::before overlay makes the whole card
            clickable — one link per product, one name, no duplicate stop for
            a screen reader or a keyboard user. */}
        <Figure
          media={product.media[0]}
          seed={`${product.id}-${colorId}`}
          ratio="portrait"
          sizes={sizes}
          priority={priority}
          zoom
          alt=""
        />
        {/* Second image cross-fades on hover — the standard fashion behaviour */}
        {product.media[1] && (
          <div className="km-card__alt" aria-hidden="true">
            <Figure media={product.media[1]} seed={`${product.id}-alt`} ratio="portrait" sizes={sizes} alt="" />
          </div>
        )}

        {!soldOut && (
          <div className="km-card__quick">
            <div className="km-quick" role="group" aria-label={`Quick add ${product.name}`}>
              {everySize.slice(0, 7).map((size) => {
                const can = inStockSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    className="km-quick__size"
                    disabled={!can}
                    onClick={() => quickAdd(size)}
                    aria-label={can ? `Add size ${size} to bag` : `Size ${size} is sold out`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="km-card__body">
        <p className="km-card__brand">{product.brand}</p>
        <h3 className="km-card__name">
          <Link href={`/product/${product.slug}`} className="km-card__link">
            {product.name}
          </Link>
        </h3>

        <Price usd={product.priceUsd} compareAt={product.compareAtUsd} />

        {product.colors.length > 1 && (
          <div className="km-swatches" role="group" aria-label="Colours">
            {product.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                className="km-swatch"
                style={{
                  background: c.hexSecondary
                    ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hexSecondary} 50%)`
                    : c.hex,
                }}
                data-selected={c.id === colorId}
                onClick={() => setColorId(c.id)}
                aria-label={`Show ${c.name}`}
                aria-pressed={c.id === colorId}
              />
            ))}
            <span className="km-sr">{product.colors.length} colours available</span>
          </div>
        )}
      </div>
    </article>
  );
}

/** Loading placeholder that matches the card's exact rhythm. */
export function ProductCardSkeleton() {
  return (
    <div className="km-card" aria-hidden="true">
      <div className="km-skeleton" style={{ aspectRatio: "3 / 4" }} />
      <div className="km-card__body">
        <div className="km-skeleton" style={{ height: 10, width: "35%" }} />
        <div className="km-skeleton" style={{ height: 16, width: "80%" }} />
        <div className="km-skeleton" style={{ height: 16, width: "45%" }} />
      </div>
    </div>
  );
}
