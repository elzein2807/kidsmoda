"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/components/shop/StoreProvider";
import { Figure } from "@/components/ui/Figure";
import { Icon } from "@/components/ui/Icon";
import { Price } from "@/components/shop/Price";
import { MaskLine, Reveal } from "@/components/motion/Reveal";
import type { PlateShape } from "@/types/catalog";

interface Lite {
  id: string;
  slug: string;
  name: string;
  brand: string;
  gender: string;
  priceUsd: number;
  compareAtUsd: number | null;
  plate: PlateShape;
}

/**
 * WISHLIST — no account required.
 *
 * Ids live in localStorage; the products are fetched fresh so prices and
 * availability are never stale. When customer accounts arrive, the same ids
 * move server-side and this component does not change.
 */
export function WishlistView() {
  const { wishlist, toggleWish, ready } = useStore();
  const [items, setItems] = useState<Lite[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready || wishlist.length === 0) return;

    const controller = new AbortController();
    fetch(`/api/products?ids=${wishlist.join(",")}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("lookup failed"))))
      .then((d) => setItems(d.products ?? []))
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, [wishlist, ready]);

  // Derived during render rather than tracked in state: the wishlist is empty
  // when it is empty, and the skeleton shows until the lookup answers.
  const isEmpty = ready && wishlist.length === 0;
  const loading = !ready || (wishlist.length > 0 && items.length === 0 && !failed);

  return (
    <div data-world="girls">
      <header className="km-pagehead">
        <div className="km-pagehead__wash" aria-hidden="true" />
        <div className="km-shell-wide km-pagehead__inner">
          <Reveal className="km-pagehead__text">
            <nav className="km-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Wishlist</span>
            </nav>
            <h1 className="km-page-type">
              <MaskLine>Saved for later</MaskLine>
            </h1>
            <p className="km-pagehead__copy">
              Kept on this device. Send us the list on WhatsApp and we will hold
              the sizes for you.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="km-shell-wide km-section-tight">
        {loading ? (
          <div className="km-products" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <div className="km-skeleton" style={{ aspectRatio: "3 / 4" }} />
                <div className="km-skeleton" style={{ height: 14, marginTop: 12, width: "70%" }} />
              </div>
            ))}
          </div>
        ) : isEmpty || items.length === 0 ? (
          <div className="km-empty">
            <Icon name="heart" size={34} className="km-empty__icon" />
            <h2 className="km-empty__title">Nothing saved yet</h2>
            <p className="km-empty__copy">
              Tap the heart on anything you like and it will wait for you here.
            </p>
            <div className="km-empty__actions">
              <Link href="/girls" className="km-btn km-btn--sm">Shop Girls</Link>
              <Link href="/boys" className="km-btn km-btn--sm">Shop Boys</Link>
              <Link href="/new-in" className="km-btn km-btn--outline km-btn--sm">New In</Link>
            </div>
          </div>
        ) : (
          <div className="km-products">
            {items.map((p) => (
              <article key={p.id} className="km-card" data-world={p.gender}>
                <div className="km-card__media">
                  <button
                    type="button"
                    className="km-iconbtn km-card__wish"
                    data-active
                    onClick={() => toggleWish(p.id)}
                    aria-label={`Remove ${p.name} from wishlist`}
                  >
                    <Icon name="heart-filled" size={19} />
                  </button>
                  <Figure seed={p.id} plate={p.plate} ratio="portrait" sizes="(max-width: 767px) 50vw, 25vw" alt="" zoom />
                </div>
                <div className="km-card__body">
                  <p className="km-card__brand">{p.brand}</p>
                  <h2 className="km-card__name">
                    <Link href={`/product/${p.slug}`} className="km-card__link">{p.name}</Link>
                  </h2>
                  <Price usd={p.priceUsd} compareAt={p.compareAtUsd} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
