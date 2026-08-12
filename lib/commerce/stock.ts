import type { Product, ProductAvailability, StockSummary, Variant } from "@/types/catalog";

/**
 * Stock is always derived on the server from variant-level numbers.
 * `available` is what a customer may buy: physical stock minus units already
 * held by unconfirmed orders. The storefront never sees stockOnHand directly.
 */

export function variantStock(v: Variant): StockSummary {
  const available = Math.max(0, v.stockOnHand - v.reserved);
  return {
    available,
    isSoldOut: available === 0,
    isLowStock: available > 0 && available <= v.lowStockThreshold,
  };
}

export function findVariant(product: Product, colorId: string, size: string): Variant | undefined {
  return product.variants.find((v) => v.colorId === colorId && v.size === size);
}

/** Total buyable units across every variant. */
export function productAvailable(product: Product): number {
  return product.variants.reduce((sum, v) => sum + variantStock(v).available, 0);
}

export function productAvailability(product: Product): ProductAvailability {
  const total = productAvailable(product);
  if (total === 0) return "sold-out";
  // "Only a few left" is a genuine signal, not a sales tactic: it fires when
  // the whole product is down to single figures.
  if (total <= 5) return "low-stock";
  return "in-stock";
}

/** Sizes that can actually be bought in a given colour. */
export function availableSizes(product: Product, colorId: string): string[] {
  return product.variants
    .filter((v) => v.colorId === colorId && variantStock(v).available > 0)
    .map((v) => v.size);
}

/** Colours that still have at least one buyable size. */
export function availableColorIds(product: Product): string[] {
  const ids = new Set<string>();
  for (const v of product.variants) {
    if (variantStock(v).available > 0) ids.add(v.colorId);
  }
  return [...ids];
}

/** Every size the product is made in, whether or not it is in stock — the
 *  size selector must show sold-out sizes as disabled, never hide them. */
export function allSizes(product: Product): string[] {
  const seen: string[] = [];
  for (const v of product.variants) if (!seen.includes(v.size)) seen.push(v.size);
  return seen;
}

export function isOnSale(product: Product): boolean {
  return product.compareAtUsd !== null && product.compareAtUsd > product.priceUsd;
}
