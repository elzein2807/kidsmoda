import type { Metadata } from "next";
import Link from "next/link";
import { queryCatalog } from "@/lib/commerce/catalog";
import { parseQuery } from "@/lib/commerce/query";
import { CatalogView } from "@/components/shop/CatalogView";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "New In",
  description:
    "The newest arrivals at Kids Moda, Hadath. New pieces for boys and girls every week, 0 to 14 years.",
  alternates: { canonical: "/new-in" },
};

export default async function NewInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const result = await queryCatalog(parseQuery(params, { sort: "newest", perPage: 16 }));

  return (
    <div data-world="journal">
      <header className="km-pagehead">
        <div className="km-pagehead__wash" aria-hidden="true" />
        <div className="km-shell-wide km-pagehead__inner">
          <Reveal className="km-pagehead__text">
            <nav className="km-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">New In</span>
            </nav>
            <h1 className="km-page-type">
              <MaskLine>New this week</MaskLine>
            </h1>
            <p className="km-pagehead__copy">
              We take delivery most weeks. This is everything that has arrived
              recently, newest first.
            </p>
          </Reveal>
        </div>
      </header>

      <div className="km-shell-wide km-section-tight">
        <CatalogView result={result} params={params} basePath="/new-in" />
      </div>
    </div>
  );
}
