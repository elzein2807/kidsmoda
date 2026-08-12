import "server-only";

import type {
  AgeGroupId,
  CatalogFacets,
  CatalogQuery,
  CatalogResult,
  Gender,
  Product,
} from "@/types/catalog";
import { AGE_GROUPS, ALL_SIZES, categoryBySlug } from "@/lib/config";
import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { availableColorIds, isOnSale, productAvailable } from "@/lib/commerce/stock";

/**
 * The catalogue data source.
 *
 * Today it reads the local seed catalogue. When Supabase credentials exist,
 * `loadProducts()` is the single function that changes — every page, filter
 * and facet above it keeps working untouched.
 */
async function loadProducts(): Promise<Product[]> {
  // Deliberately not reading Supabase yet: no credentials are configured and
  // inventing them would fake a working integration. See supabase/migrations
  // for the schema this resolves against once keys are added.
  return SEED_PRODUCTS.filter((p) => p.visible);
}

const DEFAULT_PER_PAGE = 12;

function matches(p: Product, q: CatalogQuery): boolean {
  if (q.gender && p.gender !== q.gender) return false;

  if (q.ages?.length && !q.ages.some((a) => p.ageGroups.includes(a))) return false;

  if (q.categories?.length) {
    const wantsSale = q.categories.includes("sale");
    const others = q.categories.filter((c) => c !== "sale");
    const catHit = others.length === 0 || others.some((c) => p.categorySlugs.includes(c));
    const saleHit = !wantsSale || isOnSale(p);
    if (!catHit || !saleHit) return false;
  }

  if (q.sizes?.length) {
    const has = p.variants.some((v) => q.sizes!.includes(v.size));
    if (!has) return false;
  }

  if (q.colors?.length && !p.colors.some((c) => q.colors!.includes(c.id))) return false;

  if (q.brands?.length && !q.brands.includes(p.brand)) return false;

  if (q.minPrice !== undefined && p.priceUsd < q.minPrice) return false;
  if (q.maxPrice !== undefined && p.priceUsd > q.maxPrice) return false;

  if (q.onlyNew && !p.isNew) return false;
  if (q.onlySale && !isOnSale(p)) return false;
  if (q.inStockOnly && productAvailable(p) === 0) return false;

  if (q.search) {
    const needle = q.search.toLowerCase().trim();
    if (needle) {
      const haystack = [
        p.name,
        p.brand,
        p.description,
        p.gender,
        ...p.categorySlugs.map((c) => categoryBySlug(c)?.name ?? c),
        ...p.colors.map((c) => c.name),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }

  return true;
}

function sortProducts(items: Product[], sort: CatalogQuery["sort"]): Product[] {
  const out = [...items];
  switch (sort) {
    case "newest":
      return out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    case "price-asc":
      return out.sort((a, b) => a.priceUsd - b.priceUsd);
    case "price-desc":
      return out.sort((a, b) => b.priceUsd - a.priceUsd);
    case "bestselling":
      return out.sort((a, b) => b.soldCount - a.soldCount);
    case "recommended":
    default:
      // Recommended = the boutique's own merchandising order: featured first,
      // then genuinely new, then proven sellers. Sold-out items sink.
      return out.sort((a, b) => {
        const score = (p: Product) =>
          (p.isFeatured ? 400 : 0) +
          (p.isNew ? 200 : 0) +
          (p.isBestseller ? 120 : 0) +
          (productAvailable(p) === 0 ? -500 : 0) +
          Math.min(p.soldCount, 100);
        return score(b) - score(a);
      });
  }
}

/** Facets are computed from the results BEFORE paging, so counts are honest. */
function buildFacets(pool: Product[]): CatalogFacets {
  const catCount = new Map<string, number>();
  const ageCount = new Map<AgeGroupId, number>();
  const sizeCount = new Map<string, number>();
  const colorCount = new Map<string, { name: string; hex: string; count: number }>();
  const brandCount = new Map<string, number>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of pool) {
    for (const c of p.categorySlugs) catCount.set(c, (catCount.get(c) ?? 0) + 1);
    if (isOnSale(p)) catCount.set("sale", (catCount.get("sale") ?? 0) + 1);
    for (const a of p.ageGroups) ageCount.set(a, (ageCount.get(a) ?? 0) + 1);

    const sizes = new Set(p.variants.map((v) => v.size));
    for (const s of sizes) sizeCount.set(s, (sizeCount.get(s) ?? 0) + 1);

    const live = availableColorIds(p);
    for (const c of p.colors) {
      if (!live.includes(c.id)) continue;
      const prev = colorCount.get(c.id);
      colorCount.set(c.id, { name: c.name, hex: c.hex, count: (prev?.count ?? 0) + 1 });
    }

    brandCount.set(p.brand, (brandCount.get(p.brand) ?? 0) + 1);
    min = Math.min(min, p.priceUsd);
    max = Math.max(max, p.priceUsd);
  }

  return {
    categories: [...catCount.entries()]
      .map(([slug, count]) => ({ slug, name: categoryBySlug(slug)?.name ?? slug, count }))
      .sort((a, b) => (categoryBySlug(a.slug)?.order ?? 99) - (categoryBySlug(b.slug)?.order ?? 99)),
    ages: AGE_GROUPS.filter((a) => ageCount.has(a.id)).map((a) => ({
      id: a.id,
      label: a.label,
      count: ageCount.get(a.id) ?? 0,
    })),
    sizes: ALL_SIZES.filter((s) => sizeCount.has(s)).map((s) => ({
      size: s,
      count: sizeCount.get(s) ?? 0,
    })),
    colors: [...colorCount.entries()].map(([id, v]) => ({ id, name: v.name, hex: v.hex, count: v.count })),
    brands: [...brandCount.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: {
      min: Number.isFinite(min) ? Math.floor(min) : 0,
      max: Math.ceil(max) || 100,
    },
  };
}

export async function queryCatalog(q: CatalogQuery = {}): Promise<CatalogResult> {
  const all = await loadProducts();

  // Facets reflect the world the customer is in (Boys or Girls) but ignore
  // their own active filters, so counts never collapse to zero as they refine.
  const worldPool = all.filter((p) => (q.gender ? p.gender === q.gender : true));
  const filtered = all.filter((p) => matches(p, q));
  const sorted = sortProducts(filtered, q.sort);

  const perPage = q.perPage ?? DEFAULT_PER_PAGE;
  const page = Math.max(1, q.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const start = (page - 1) * perPage;

  return {
    items: sorted.slice(start, start + perPage),
    total: sorted.length,
    page,
    perPage,
    totalPages,
    facets: buildFacets(worldPool),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await loadProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getAllProductSlugs(): Promise<string[]> {
  const all = await loadProducts();
  return all.map((p) => p.slug);
}

export async function getNewArrivals(gender?: Gender, limit = 8): Promise<Product[]> {
  const { items } = await queryCatalog({ gender, onlyNew: true, sort: "newest", perPage: limit });
  return items;
}

export async function getBestsellers(gender?: Gender, limit = 8): Promise<Product[]> {
  const all = await loadProducts();
  return all
    .filter((p) => (gender ? p.gender === gender : true) && p.isBestseller)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

export async function getFeatured(gender?: Gender, limit = 4): Promise<Product[]> {
  const all = await loadProducts();
  return all.filter((p) => (gender ? p.gender === gender : true) && p.isFeatured).slice(0, limit);
}

export async function getOnSale(gender?: Gender, limit = 12): Promise<Product[]> {
  const all = await loadProducts();
  return all.filter((p) => (gender ? p.gender === gender : true) && isOnSale(p)).slice(0, limit);
}

/** "Complete the look" / "You may also like" — same world, related category,
 *  never the product itself. */
export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const all = await loadProducts();
  const scored = all
    .filter((p) => p.id !== product.id && p.gender === product.gender)
    .map((p) => {
      const sharedCats = p.categorySlugs.filter((c) => product.categorySlugs.includes(c)).length;
      const sharedAges = p.ageGroups.filter((a) => product.ageGroups.includes(a)).length;
      return { p, score: sharedAges * 3 + sharedCats * 2 };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

/** Products by id, preserving the order given — used by wishlist and
 *  recently-viewed, which store ids in the browser. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const all = await loadProducts();
  return ids.map((id) => all.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}
