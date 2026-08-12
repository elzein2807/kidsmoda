import type { Metadata } from "next";
import Link from "next/link";
import { queryCatalog } from "@/lib/commerce/catalog";
import { parseQuery } from "@/lib/commerce/query";
import { CatalogView } from "@/components/shop/CatalogView";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Sale",
  description: "Reduced kids clothing at Kids Moda, Hadath. Boys and girls, 0 to 14 years.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const result = await queryCatalog(parseQuery(params, { onlySale: true, perPage: 16 }));

  return (
    <div data-world="sale">
      <header className="km-pagehead">
        <div className="km-pagehead__wash" aria-hidden="true" />
        <div className="km-shell-wide km-pagehead__inner">
          <Reveal className="km-pagehead__text">
            <nav className="km-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Sale</span>
            </nav>
            <h1 className="km-page-type">
              <MaskLine>Sale</MaskLine>
            </h1>
            <p className="km-pagehead__copy">
              End of season, reduced while sizes last. Sale pieces can be exchanged
              in store within 7 days.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="km-shell-wide km-section-tight">
        <CatalogView
          result={result}
          params={params}
          basePath="/sale"
          emptyTitle="Nothing is reduced right now"
        />
      </div>
    </div>
  );
}
