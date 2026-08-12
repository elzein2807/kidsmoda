import { NextResponse } from "next/server";
import { queryCatalog } from "@/lib/commerce/catalog";
import { productAvailability } from "@/lib/commerce/stock";
import { CATEGORIES } from "@/lib/config";

/**
 * SEARCH — server-side so the whole catalogue never ships to the browser.
 * Returns a small, display-ready payload: enough for the suggestion panel,
 * nothing more.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ query: q, products: [], categories: [] });
  }

  const { items, total } = await queryCatalog({ search: q, perPage: 6, sort: "recommended" });

  const needle = q.toLowerCase();
  const categories = CATEGORIES.filter((c) => c.name.toLowerCase().includes(needle))
    .slice(0, 4)
    .flatMap((c) => c.genders.map((g) => ({ label: `${c.name} — ${g === "girls" ? "Girls" : "Boys"}`, href: `/${g}?category=${c.slug}` })))
    .slice(0, 4);

  return NextResponse.json({
    query: q,
    total,
    categories,
    products: items.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      gender: p.gender,
      priceUsd: p.priceUsd,
      compareAtUsd: p.compareAtUsd,
      plate: p.media[0]?.plate ?? "campaign",
      availability: productAvailability(p),
    })),
  });
}
