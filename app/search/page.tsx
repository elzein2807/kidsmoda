import type { Metadata } from "next";
import Link from "next/link";
import { queryCatalog } from "@/lib/commerce/catalog";
import { parseQuery } from "@/lib/commerce/query";
import { CatalogView } from "@/components/shop/CatalogView";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Search",
  // A search results page should never compete with real pages in the index
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const result = await queryCatalog(parseQuery(params, { perPage: 16 }));

  return (
    <div data-world="neutral">
      <header className="km-pagehead">
        <div className="km-shell-wide km-pagehead__inner">
          <Reveal className="km-pagehead__text">
            <nav className="km-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Search</span>
            </nav>
            <h1 className="km-page-type">
              <MaskLine>{q ? `“${q}”` : "Search"}</MaskLine>
            </h1>
            <p className="km-pagehead__copy" data-numeric>
              {q ? `${result.total} ${result.total === 1 ? "result" : "results"}` : "Type a word to search the shop."}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="km-shell-wide km-section-tight">
        <CatalogView
          result={result}
          params={params}
          basePath="/search"
          emptyTitle={q ? `Nothing matched “${q}”` : "Search Kids Moda"}
        />
      </div>
    </div>
  );
}
