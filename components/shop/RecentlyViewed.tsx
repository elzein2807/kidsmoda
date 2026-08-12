"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { read as readRecentlyViewed } from "@/lib/recently-viewed";
import { Figure } from "@/components/ui/Figure";
import { Price } from "@/components/shop/Price";
import type { PlateShape } from "@/types/catalog";

interface Lite {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceUsd: number;
  compareAtUsd: number | null;
  plate: PlateShape;
}

/**
 * RECENTLY VIEWED — ids are held in the browser, so the products themselves
 * are fetched from the server rather than kept in localStorage. That keeps
 * prices and stock honest even if the tab has been open for a week.
 */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<Lite[]>([]);

  useEffect(() => {
    const ids = readRecentlyViewed()
      .filter((id) => id !== excludeId)
      .slice(0, 6);
    if (ids.length === 0) return;

    const controller = new AbortController();
    fetch(`/api/products?ids=${ids.join(",")}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setItems(d.products ?? []))
      .catch(() => {
        /* offline or aborted — the strip simply does not appear */
      });
    return () => controller.abort();
  }, [excludeId]);

  if (items.length === 0) return null;

  return (
    <section className="km-section-tight km-shell-wide" aria-labelledby="km-recent">
      <h2 id="km-recent" className="km-eyebrow km-recent__title">Recently viewed</h2>
      <div className="km-rail" role="list">
        {items.map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="km-recent__item" role="listitem">
            <Figure seed={p.id} plate={p.plate} ratio="portrait" sizes="180px" alt="" />
            <p className="km-recent__name">{p.name}</p>
            <Price usd={p.priceUsd} compareAt={p.compareAtUsd} size="sm" />
          </Link>
        ))}
      </div>
    </section>
  );
}
