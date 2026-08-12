import Link from "next/link";
import type { CatalogResult } from "@/types/catalog";
import { ProductCard } from "@/components/shop/ProductCard";
import { Filters, ActiveChips, SortSelect } from "@/components/shop/Filters";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { activeFilters, type SearchParamsInput } from "@/lib/commerce/query";
import { categoryBySlug } from "@/lib/config";
import { whatsapp } from "@/lib/whatsapp";

/**
 * CATALOG VIEW — the shared product listing.
 *
 * Used by every shoppable route (worlds, age pages, new in, sale, search) so
 * filtering, sorting, pagination, empty and error states behave identically
 * everywhere. Rendered on the server: the grid is HTML, and the only client
 * JavaScript is the filter controls.
 */
export function CatalogView({
  result,
  params,
  basePath,
  hideAges = false,
  hideCategories = false,
  emptyTitle = "Nothing matches those filters",
}: {
  result: CatalogResult;
  params: SearchParamsInput;
  basePath: string;
  hideAges?: boolean;
  hideCategories?: boolean;
  emptyTitle?: string;
}) {
  const chips = activeFilters(params, (slug) => categoryBySlug(slug)?.name ?? slug);

  return (
    <div className="km-listing">
      <Filters
        facets={result.facets}
        total={result.total}
        hideAges={hideAges}
        hideCategories={hideCategories}
      />

      <div>
        <div className="km-listing__head">
          <p className="km-listing__count" data-numeric aria-live="polite">
            {result.total} {result.total === 1 ? "item" : "items"}
          </p>
          <div className="km-listing__sort">
            <SortSelect />
          </div>
        </div>

        <ActiveChips filters={chips} />

        {result.items.length === 0 ? (
          <div className="km-empty">
            <Icon name="search" size={34} className="km-empty__icon" />
            <h2 className="km-empty__title">{emptyTitle}</h2>
            <p className="km-empty__copy">
              Try removing a filter, or ask us — if it is in the shop in Hadath we
              will tell you.
            </p>
            <div className="km-empty__actions">
              <Link href={basePath} className="km-btn km-btn--sm">Clear filters</Link>
              <a
                href={whatsapp.general()}
                target="_blank"
                rel="noopener noreferrer"
                className="km-btn km-btn--outline km-btn--sm"
              >
                <Icon name="whatsapp" size={16} />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="km-products">
            {result.items.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 50} y={18}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
        )}

        <Pagination result={result} params={params} basePath={basePath} />
      </div>
    </div>
  );
}

/**
 * Real pagination with real links rather than infinite scroll: it is
 * crawlable, restores position on back, and never traps a keyboard user
 * before the footer.
 */
function Pagination({
  result,
  params,
  basePath,
}: {
  result: CatalogResult;
  params: SearchParamsInput;
  basePath: string;
}) {
  if (result.totalPages <= 1) return null;

  const build = (page: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value === undefined) continue;
      for (const v of Array.isArray(value) ? value : [value]) next.append(key, v);
    }
    if (page > 1) next.set("page", String(page));
    const qs = next.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const pages = Array.from({ length: result.totalPages }, (_, i) => i + 1);

  return (
    <nav className="km-pager" aria-label="Pagination">
      <Link
        href={build(result.page - 1)}
        className="km-pager__link"
        aria-disabled={result.page === 1}
        tabIndex={result.page === 1 ? -1 : undefined}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={16} />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={build(p)}
          className="km-pager__link"
          aria-current={p === result.page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}

      <Link
        href={build(result.page + 1)}
        className="km-pager__link"
        aria-disabled={result.page === result.totalPages}
        tabIndex={result.page === result.totalPages ? -1 : undefined}
        aria-label="Next page"
      >
        <Icon name="chevron-right" size={16} />
      </Link>
    </nav>
  );
}

/** Loading skeleton used by route-level loading.tsx files. */
export function CatalogSkeleton() {
  return (
    <div className="km-products" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="km-card">
          <div className="km-skeleton" style={{ aspectRatio: "3 / 4" }} />
          <div className="km-card__body">
            <div className="km-skeleton" style={{ height: 10, width: "35%" }} />
            <div className="km-skeleton" style={{ height: 16, width: "80%" }} />
            <div className="km-skeleton" style={{ height: 16, width: "45%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
