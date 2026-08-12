import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllProductSlugs, getProductBySlug, getRelated } from "@/lib/commerce/catalog";
import { productAvailability } from "@/lib/commerce/stock";
import { discountPercent, usdToLbp } from "@/lib/currency";
import { SITE, categoryBySlug } from "@/lib/config";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductBuy } from "@/components/shop/ProductBuy";
import { ProductCard } from "@/components/shop/ProductCard";
import { Accordion } from "@/components/ui/Accordion";
import { RecentlyViewed } from "@/components/shop/RecentlyViewed";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — Kids Moda`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelated(product, 4);
  const availability = productAvailability(product);
  const off = discountPercent(product.priceUsd, product.compareAtUsd);
  const label = product.gender === "girls" ? "Girls" : "Boys";
  const category = product.categorySlugs.map((c) => categoryBySlug(c)).find(Boolean);

  /* Product structured data — real availability, real currency. */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    category: category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: product.priceUsd.toFixed(2),
      availability:
        availability === "sold-out"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${SITE.url}/product/${product.slug}`,
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE.url}/${product.gender}` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE.url}/product/${product.slug}` },
    ],
  };

  return (
    <div data-world={product.gender}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([schema, breadcrumb]) }}
      />

      <div className="km-shell-wide km-pdp">
        <nav className="km-crumbs km-pdp__crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${product.gender}`}>{label}</Link>
          {category && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/${product.gender}?category=${category.slug}`}>{category.name}</Link>
            </>
          )}
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="km-pdp__grid">
          <div className="km-pdp__media">
            <ProductGallery media={product.media} name={product.name} />
          </div>

          <div className="km-pdp__buy">
            <ProductBuy product={product} />

            <Accordion
              items={[
                { id: "desc", title: "Description", content: product.description, open: true },
                { id: "fabric", title: "Fabric & care", content: `${product.materials}\n${product.care}` },
                {
                  id: "delivery",
                  title: "Delivery & exchanges",
                  content:
                    "Delivery all over Lebanon in 2 – 4 working days, 1 – 2 in Beirut. Pay the driver in cash, USD or LBP. Exchange in store within 7 days with the receipt, unworn and with tags on.",
                },
                { id: "styling", title: "Styling note", content: product.styling },
              ]}
            />

            {off !== null && (
              <p className="km-pdp__saving" data-numeric>
                You save ${(product.compareAtUsd! - product.priceUsd).toFixed(0)} ·{" "}
                {usdToLbp(product.compareAtUsd! - product.priceUsd).toLocaleString("en-US")} LL
              </p>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="km-section km-shell-wide" aria-labelledby="km-related">
          <div className="km-head">
            <Reveal className="km-head__text">
              <p className="km-eyebrow">Complete the look</p>
              <h2 id="km-related" className="km-section-type km-head__title">
                <MaskLine>Wears well with</MaskLine>
              </h2>
            </Reveal>
          </div>
          <div className="km-products">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
