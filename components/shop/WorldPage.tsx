import { notFound } from "next/navigation";
import Link from "next/link";
import type { AgeGroupId, Gender } from "@/types/catalog";
import { AGE_GROUPS, ageGroupById, categoryBySlug } from "@/lib/config";
import { queryCatalog, getNewArrivals, getBestsellers, getFeatured, getOnSale } from "@/lib/commerce/catalog";
import { parseQuery, type SearchParamsInput } from "@/lib/commerce/query";
import { CatalogView } from "@/components/shop/CatalogView";
import { WorldLanding } from "@/components/editorial/WorldLanding";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

/**
 * WORLD PAGE — the shared body of /girls, /boys and their age routes.
 *
 * A world URL with no filters is a campaign; the moment a filter is applied it
 * becomes a listing. That means the mega menu can link straight to
 * /girls?category=dresses and land the customer on products, while /girls on
 * its own is still the brand's chapter for her.
 */

const FILTER_KEYS = ["category", "age", "size", "color", "brand", "min", "max", "sale", "new", "instock", "sort", "page"];

export async function WorldPage({
  gender,
  age,
  searchParams,
}: {
  gender: Gender;
  age?: string;
  searchParams: SearchParamsInput;
}) {
  const ageGroup = age ? ageGroupById(age) : undefined;
  if (age && !ageGroup) notFound();

  const isListing = Boolean(age) || FILTER_KEYS.some((k) => searchParams[k] !== undefined);
  const label = gender === "girls" ? "Girls" : "Boys";
  const basePath = age ? `/${gender}/${age}` : `/${gender}`;

  if (!isListing) {
    const [newArrivals, bestsellers, featured, onSale] = await Promise.all([
      getNewArrivals(gender, 4),
      getBestsellers(gender, 6),
      getFeatured(gender, 1),
      getOnSale(gender, 6),
    ]);
    return (
      <WorldLanding
        gender={gender}
        newArrivals={newArrivals}
        bestsellers={bestsellers}
        featured={featured[0]}
        onSale={onSale}
      />
    );
  }

  const base = { gender, ...(ageGroup ? { ages: [ageGroup.id as AgeGroupId] } : {}) };
  const result = await queryCatalog(parseQuery(searchParams, base));

  const categorySlug = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category;
  const category = categorySlug ? categoryBySlug(categorySlug) : undefined;

  const title = ageGroup ? `${label} · ${ageGroup.label}` : category ? `${category.name}` : label;

  return (
    <div data-world={gender}>
      <header className="km-pagehead" data-age={ageGroup?.id}>
        <div className="km-pagehead__wash" aria-hidden="true" />
        <div className="km-shell-wide km-pagehead__inner">
          <Reveal className="km-pagehead__text">
            <nav className="km-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/${gender}`}>{label}</Link>
              {(ageGroup || category) && (
                <>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{ageGroup?.label ?? category?.name}</span>
                </>
              )}
            </nav>
            <h1 className="km-page-type">
              <MaskLine>{title}</MaskLine>
            </h1>
            {ageGroup && (
              <p className="km-pagehead__copy">
                Sizes {ageGroup.sizes.join(", ")}. Everything here is cut for this
                age — not scaled down from an older size.
              </p>
            )}
          </Reveal>

          {/* Age remains reachable from any listing, since it is how parents shop */}
          <Reveal className="km-pagehead__aside" delay={100}>
            <div className="km-ageselect">
              {AGE_GROUPS.map((a) => (
                <Link
                  key={a.id}
                  href={`/${gender}/${a.id}`}
                  className="km-age-chip"
                  data-age={a.id}
                  aria-current={a.id === ageGroup?.id ? "page" : undefined}
                >
                  {a.short}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="km-shell-wide km-section-tight">
        <CatalogView
          result={result}
          params={searchParams}
          basePath={basePath}
          hideAges={Boolean(ageGroup)}
        />
      </div>
    </div>
  );
}
