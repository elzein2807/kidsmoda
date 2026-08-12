"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types/catalog";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/shop/Price";
import { useStore } from "@/components/shop/StoreProvider";
import { allSizes, availableSizes, findVariant, variantStock } from "@/lib/commerce/stock";
import { SITE, DELIVERY } from "@/lib/config";
import { recordView } from "@/lib/recently-viewed";
import { whatsapp } from "@/lib/whatsapp";
import { cx } from "@/lib/utils";

/**
 * PRODUCT BUY BOX
 *
 * Rules that matter commercially:
 * · Sold-out sizes are shown and disabled, never hidden — a parent needs to
 *   know the size exists before they give up on it, and it powers the
 *   "ask on WhatsApp" route.
 * · Add to bag is disabled until a size is chosen, and says so in words.
 * · Stock messages come from real variant numbers, not a marketing rule.
 * · A sticky bar appears on mobile once the buy box scrolls away.
 */
export function ProductBuy({ product }: { product: Product }) {
  const { addLine, toggleWish, isWished } = useStore();

  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [chosenSize, setChosenSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stickyOn, setStickyOn] = useState(false);

  // A write to localStorage, not to application state — nothing in this render
  // depends on it, so it must not cause one.
  useEffect(() => {
    recordView(product.id);
  }, [product.id]);

  useEffect(() => {
    const box = document.getElementById("km-buybox");
    if (!box) return;
    const io = new IntersectionObserver(([entry]) => setStickyOn(!entry?.isIntersecting), { threshold: 0 });
    io.observe(box);
    return () => io.disconnect();
  }, []);

  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  const inStock = availableSizes(product, colorId);

  // Switching colour can invalidate the chosen size. Deriving it here rather
  // than clearing it in an effect means the UI is never briefly wrong, and
  // going back to the original colour restores the selection.
  const size = chosenSize && inStock.includes(chosenSize) ? chosenSize : null;

  const every = allSizes(product);
  const variant = color && size ? findVariant(product, color.id, size) : undefined;
  const stock = variant ? variantStock(variant) : null;
  const soldOutEverywhere = inStock.length === 0;

  const add = () => {
    if (!size) {
      setError("Choose a size first.");
      document.getElementById("km-sizes")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    if (!variant || !color || stock?.available === 0) {
      setError("That size has just sold out. Message us and we will check the stockroom.");
      return;
    }
    setError(null);
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

  const url = `${SITE.url}/product/${product.slug}`;
  const wished = isWished(product.id);

  return (
    <>
      <div className="km-buy" id="km-buybox">
        <p className="km-buy__brand">{product.brand}</p>
        <h1 className="km-buy__name">{product.name}</h1>

        <Price usd={product.priceUsd} compareAt={product.compareAtUsd} size="lg" className="km-buy__price" />

        <p className="km-buy__sku">
          SKU {variant?.sku ?? `KM-${product.slug.slice(0, 6).toUpperCase()}`}
        </p>

        {/* COLOUR */}
        {product.colors.length > 0 && (
          <fieldset className="km-buy__group">
            <legend className="km-buy__legend">
              Colour: <strong>{color?.name}</strong>
            </legend>
            <div className="km-buy__colors">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="km-swatch km-swatch--lg"
                  style={{
                    background: c.hexSecondary
                      ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hexSecondary} 50%)`
                      : c.hex,
                  }}
                  data-selected={c.id === colorId}
                  aria-pressed={c.id === colorId}
                  aria-label={c.name}
                  onClick={() => setColorId(c.id)}
                />
              ))}
            </div>
          </fieldset>
        )}

        {/* SIZE */}
        <fieldset className="km-buy__group" id="km-sizes">
          <legend className="km-buy__legend">
            Size
            <Link href="/size-guide" className="km-buy__guide">
              <Icon name="ruler" size={15} />
              Size guide
            </Link>
          </legend>

          <div className="km-buy__sizes">
            {every.map((s) => {
              const can = inStock.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  className="km-chip"
                  disabled={!can}
                  aria-pressed={size === s}
                  onClick={() => {
                    setChosenSize(s);
                    setError(null);
                  }}
                  aria-label={can ? `Size ${s}` : `Size ${s}, sold out`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {stock?.isLowStock && (
            <p className="km-buy__stock km-buy__stock--low" role="status">
              <Icon name="alert" size={15} />
              Only {stock.available} left in {size}
            </p>
          )}
          {size && stock?.isSoldOut && (
            <p className="km-buy__stock km-buy__stock--out" role="status">
              Size {size} is sold out
            </p>
          )}
          {error && (
            <p className="km-error" role="alert">
              {error}
            </p>
          )}
        </fieldset>

        {/* ACTIONS */}
        <div className="km-buy__actions">
          {soldOutEverywhere ? (
            <>
              <button type="button" className="km-btn km-btn--block" disabled>
                Sold out
              </button>
              <a
                href={whatsapp.stockCheck(product.name, size ?? "any size")}
                target="_blank"
                rel="noopener noreferrer"
                className="km-btn km-btn--outline km-btn--block"
              >
                <Icon name="whatsapp" size={18} />
                Ask when it is back
              </a>
            </>
          ) : (
            <>
              <button
                type="button"
                className={cx("km-btn km-btn--block")}
                onClick={add}
                aria-disabled={!size}
              >
                {size ? "Add to bag" : "Choose a size"}
              </button>
              <a
                href={whatsapp.product(product.name, url, size ?? undefined, color?.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="km-btn km-btn--outline km-btn--block"
              >
                <Icon name="whatsapp" size={18} />
                Ask about this piece
              </a>
            </>
          )}

          <button
            type="button"
            className="km-btn km-btn--ghost km-buy__wish"
            onClick={() => toggleWish(product.id)}
            aria-pressed={wished}
          >
            <Icon name={wished ? "heart-filled" : "heart"} size={18} />
            {wished ? "Saved" : "Save for later"}
          </button>
        </div>

        {/* SERVICE */}
        <ul className="km-buy__service">
          <li>
            <Icon name="truck" size={18} />
            Delivery all over Lebanon · {DELIVERY.etaDays}
          </li>
          <li>
            <Icon name="cash" size={18} />
            Cash on delivery · pay in USD or LBP
          </li>
          <li>
            <Icon name="exchange" size={18} />
            Exchange in store within {DELIVERY.exchangeWindowDays} days
          </li>
        </ul>
      </div>

      {/* STICKY MOBILE BAR */}
      <div className="km-stickybuy" data-on={stickyOn} aria-hidden={!stickyOn}>
        <div className="km-stickybuy__info">
          <p className="km-stickybuy__name">{product.name}</p>
          <Price usd={product.priceUsd} compareAt={product.compareAtUsd} size="sm" />
        </div>
        <button
          type="button"
          className="km-btn"
          onClick={() => {
            if (!size) {
              document.getElementById("km-sizes")?.scrollIntoView({ block: "center", behavior: "smooth" });
              setError("Choose a size first.");
              return;
            }
            add();
          }}
          disabled={soldOutEverywhere}
          tabIndex={stickyOn ? 0 : -1}
        >
          {soldOutEverywhere ? "Sold out" : size ? "Add to bag" : "Choose size"}
        </button>
      </div>
    </>
  );
}
