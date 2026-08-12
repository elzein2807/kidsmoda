import type { Metadata } from "next";

import { Hero } from "@/components/editorial/Hero";
import { TwoWorlds } from "@/components/editorial/TwoWorlds";
import { WorldChapter } from "@/components/editorial/WorldChapter";
import { DropGirls, DropBoys } from "@/components/editorial/Drop";
import { MadeToMove } from "@/components/editorial/MadeToMove";
import { ShopTheLook } from "@/components/editorial/ShopTheLook";
import { ProductRail } from "@/components/editorial/ProductRail";
import { StoreStory, Community, Trust, StoreLinks } from "@/components/editorial/StoreAndCommunity";
import { RibbonSeam } from "@/components/editorial/RibbonSeam";

import { getBestsellers, getFeatured, getNewArrivals, queryCatalog } from "@/lib/commerce/catalog";

export const metadata: Metadata = {
  title: "Kids Moda — Fashion for Little Moments",
  description:
    "Premium kids fashion in Hadath, Beirut. Boys and girls, 0 to 14 years. New arrivals every week, delivery all over Lebanon, cash on delivery.",
  alternates: { canonical: "/" },
};

/**
 * HOMEPAGE
 *
 * A server component: every product query runs on the server and the page
 * ships as HTML. The only client JavaScript is the motion root, the header,
 * and the interactive commerce pieces that genuinely need it.
 *
 * The section order is a deliberate narrative:
 *   hero → the fork (two worlds) → her chapter → her drop → his chapter →
 *   his drop → the film → the look → this week → bestsellers → the shop →
 *   community → trust.
 */
export default async function HomePage() {
  const [girlsNew, boysNew, girlsFeatured, boysFeatured, bestsellers, thisWeek, lookProducts] =
    await Promise.all([
      getNewArrivals("girls", 4),
      getNewArrivals("boys", 4),
      getFeatured("girls", 1),
      getFeatured("boys", 1),
      getBestsellers(undefined, 8),
      queryCatalog({ sort: "newest", perPage: 8 }),
      queryCatalog({ gender: "girls", perPage: 4, sort: "recommended" }),
    ]);

  return (
    <>
      <Hero />

      <RibbonSeam world="girls" />

      <TwoWorlds />

      <WorldChapter gender="girls" />
      <DropGirls products={girlsNew} feature={girlsFeatured[0]} />

      <RibbonSeam world="boys" flip />

      <WorldChapter gender="boys" />
      <DropBoys products={boysNew} feature={boysFeatured[0]} />

      <MadeToMove />

      <ShopTheLook products={lookProducts.items} />

      <ProductRail
        id="km-this-week"
        eyebrow="New this week"
        title="Just off the rail"
        copy="New pieces land in Hadath every week. This is what arrived most recently."
        products={thisWeek.items}
        href="/new-in"
        hrefLabel="All new in"
        world="journal"
      />

      <ProductRail
        id="km-bestsellers"
        eyebrow="Best sellers"
        title="What everyone buys"
        copy="The pieces that leave the shop fastest, in both worlds."
        products={bestsellers}
        href="/new-in"
        hrefLabel="Shop all"
        ranked
        world="neutral"
      />

      <StoreStory />
      <Community />
      <Trust />
      <StoreLinks />
    </>
  );
}
