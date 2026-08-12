import type { AgeGroupId, CatalogQuery, Gender, SortKey } from "@/types/catalog";
import { AGE_GROUPS } from "@/lib/config";

/**
 * URL ⇄ query translation.
 *
 * Filter state lives in the URL, never in React state. That means a filtered
 * view is shareable, survives a refresh, works with the back button and can be
 * rendered on the server. Multi-value filters use repeated params
 * (?size=4Y&size=5Y) rather than comma strings, so they stay valid URLs.
 */

export type SearchParamsInput = Record<string, string | string[] | undefined>;

const SORTS: SortKey[] = ["recommended", "newest", "price-asc", "price-desc", "bestselling"];

function list(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).flatMap((v) => v.split(",")).filter(Boolean);
}

function num(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const VALID_AGES = new Set(AGE_GROUPS.map((a) => a.id));

export function parseQuery(params: SearchParamsInput, base: Partial<CatalogQuery> = {}): CatalogQuery {
  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const sort = SORTS.includes(sortRaw as SortKey) ? (sortRaw as SortKey) : "recommended";

  const ages = list(params.age).filter((a): a is AgeGroupId => VALID_AGES.has(a as AgeGroupId));

  return {
    ...base,
    ages: ages.length ? ages : base.ages,
    categories: list(params.category).length ? list(params.category) : base.categories,
    sizes: list(params.size),
    colors: list(params.color),
    brands: list(params.brand),
    minPrice: num(params.min),
    maxPrice: num(params.max),
    onlyNew: params.new === "1" || base.onlyNew,
    onlySale: params.sale === "1" || base.onlySale,
    inStockOnly: params.instock === "1",
    search: (Array.isArray(params.q) ? params.q[0] : params.q) ?? base.search,
    sort,
    page: num(params.page) ?? 1,
    perPage: base.perPage ?? 12,
  };
}

/** Chips shown above the grid, so active filters are always visible. */
export interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

export function activeFilters(params: SearchParamsInput, categoryName: (slug: string) => string): ActiveFilter[] {
  const out: ActiveFilter[] = [];

  for (const c of list(params.category)) out.push({ key: "category", value: c, label: categoryName(c) });
  for (const a of list(params.age)) {
    const age = AGE_GROUPS.find((g) => g.id === a);
    if (age) out.push({ key: "age", value: a, label: age.label });
  }
  for (const s of list(params.size)) out.push({ key: "size", value: s, label: `Size ${s}` });
  for (const c of list(params.color)) out.push({ key: "color", value: c, label: c[0]!.toUpperCase() + c.slice(1) });
  for (const b of list(params.brand)) out.push({ key: "brand", value: b, label: b });

  if (params.sale === "1") out.push({ key: "sale", value: "1", label: "On sale" });
  if (params.new === "1") out.push({ key: "new", value: "1", label: "New in" });
  if (params.instock === "1") out.push({ key: "instock", value: "1", label: "In stock" });

  const min = num(params.min);
  const max = num(params.max);
  if (min !== undefined || max !== undefined) {
    out.push({
      key: "price",
      value: "1",
      label: `$${min ?? 0} – $${max ?? "∞"}`,
    });
  }

  return out;
}

export function readList(params: SearchParamsInput, key: string): string[] {
  return list(params[key]);
}

/** Gender is a route segment, not a filter — it can never be cleared away. */
export function genderFromPath(path: string): Gender | undefined {
  if (path.startsWith("/girls")) return "girls";
  if (path.startsWith("/boys")) return "boys";
  return undefined;
}
