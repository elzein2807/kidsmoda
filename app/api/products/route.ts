import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/commerce/catalog";

/**
 * Lightweight product lookup by id — powers wishlist and recently-viewed,
 * both of which hold only ids in the browser. Returns display fields only;
 * cost price and stock internals never leave the server.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 24);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await getProductsByIds(ids);

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      gender: p.gender,
      priceUsd: p.priceUsd,
      compareAtUsd: p.compareAtUsd,
      plate: p.media[0]?.plate ?? "campaign",
    })),
  });
}
