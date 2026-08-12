/**
 * KIDS MODA — development catalogue.
 *
 * Realistic stand-in data used until the real catalogue is imported. It has
 * the exact shape the database returns, so replacing it is a data task, not a
 * redesign. Nothing here is Lorem Ipsum and no third-party trademark is used —
 * "Kids Moda" and "Maison Petit" are the boutique's own labels.
 *
 * To replace: import products into Supabase and remove SEED from the resolver
 * in lib/commerce/catalog.ts. No component changes.
 */

import type { AgeGroupId, ColorOption, Gender, PlateShape, Product, Variant } from "@/types/catalog";
import { AGE_GROUPS } from "@/lib/config";

/* ---------------------------------------------------------------------------
   Shared colour library — swatches reused across the catalogue so filtering
   by colour actually groups products the way a customer expects.
   --------------------------------------------------------------------------- */
const C = {
  ivory: { id: "ivory", name: "Ivory", hex: "#F2EBDF" },
  ecru: { id: "ecru", name: "Ecru", hex: "#E4D8C4" },
  charcoal: { id: "charcoal", name: "Charcoal", hex: "#39343A" },
  coral: { id: "coral", name: "Coral", hex: "#F2684F" },
  strawberry: { id: "strawberry", name: "Strawberry", hex: "#E8577F" },
  blush: { id: "blush", name: "Blush", hex: "#F2A9A0" },
  tangerine: { id: "tangerine", name: "Tangerine", hex: "#F08A2E" },
  butter: { id: "butter", name: "Butter", hex: "#F2C744" },
  lime: { id: "lime", name: "Lime", hex: "#A8C93A" },
  sage: { id: "sage", name: "Sage", hex: "#6E9B7A" },
  turquoise: { id: "turquoise", name: "Turquoise", hex: "#3FB8AB" },
  sky: { id: "sky", name: "Sky", hex: "#63B3D9" },
  cobalt: { id: "cobalt", name: "Cobalt", hex: "#2A54B8" },
  lilac: { id: "lilac", name: "Lilac", hex: "#A38AD1" },
  denim: { id: "denim", name: "Denim", hex: "#4A6C96" },
  stripe: { id: "stripe", name: "Rainbow Stripe", hex: "#F2684F", hexSecondary: "#2A54B8" },
} satisfies Record<string, ColorOption>;

/** Sizes covered by a product's age range, in wearing order. */
function sizesFor(ages: AgeGroupId[]): string[] {
  return AGE_GROUPS.filter((a) => ages.includes(a.id)).flatMap((a) => a.sizes);
}

interface SeedInput {
  slug: string;
  name: string;
  brand: string;
  gender: Gender;
  ages: AgeGroupId[];
  cats: string[];
  plate: PlateShape;
  priceUsd: number;
  compareAtUsd?: number;
  colors: ColorOption[];
  description: string;
  materials: string;
  care: string;
  styling: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  soldCount?: number;
  /** Sizes that are genuinely out of stock, so the UI has real sold-out states */
  soldOut?: string[];
  /** Sizes down to their last pieces, so low-stock warnings are real */
  low?: string[];
  daysAgo: number;
}

/**
 * Builds colour × size variants. Stock is deterministic (derived from the SKU)
 * so server and client always agree and screenshots stay stable.
 */
function buildVariants(input: SeedInput): Variant[] {
  const sizes = sizesFor(input.ages);
  const variants: Variant[] = [];

  input.colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      const sku = `KM-${input.slug.slice(0, 6).toUpperCase()}-${color.id.slice(0, 3).toUpperCase()}-${size}`;
      const soldOut = input.soldOut?.includes(size) && ci === 0;
      const low = input.low?.includes(size);
      // Deterministic spread: middle sizes carry more depth than the extremes
      const base = 3 + ((ci * 7 + si * 5) % 9);

      variants.push({
        id: `${input.slug}-${color.id}-${size}`,
        sku,
        barcode: `628${String(1000000 + ci * 137 + si * 29 + input.slug.length * 911).slice(0, 7)}`,
        colorId: color.id,
        size,
        stockOnHand: soldOut ? 0 : low ? 1 : base,
        reserved: soldOut || low ? 0 : (si + ci) % 3 === 0 ? 1 : 0,
        incoming: soldOut ? 12 : 0,
        damaged: 0,
        lowStockThreshold: 3,
      });
    });
  });

  return variants;
}

function build(input: SeedInput): Product {
  const created = new Date(Date.now() - input.daysAgo * 86_400_000).toISOString();
  return {
    id: input.slug,
    slug: input.slug,
    name: input.name,
    brand: input.brand,
    gender: input.gender,
    ageGroups: input.ages,
    categorySlugs: input.cats,
    description: input.description,
    materials: input.materials,
    care: input.care,
    styling: input.styling,
    priceUsd: input.priceUsd,
    compareAtUsd: input.compareAtUsd ?? null,
    costUsd: Math.round(input.priceUsd * 0.42 * 100) / 100,
    colors: input.colors,
    // Real photography drops in here. `src: null` renders the vector plate.
    media: [
      { id: `${input.slug}-1`, kind: "image", src: null, alt: `${input.name} — front view`, plate: input.plate },
      { id: `${input.slug}-2`, kind: "image", src: null, alt: `${input.name} — back view`, plate: input.plate },
      { id: `${input.slug}-3`, kind: "image", src: null, alt: `${input.name} — fabric detail`, plate: input.plate },
      { id: `${input.slug}-4`, kind: "image", src: null, alt: `${input.name} — worn by a child`, plate: "campaign" },
    ],
    variants: buildVariants(input),
    isNew: input.isNew ?? false,
    isBestseller: input.isBestseller ?? false,
    isFeatured: input.isFeatured ?? false,
    visible: true,
    soldCount: input.soldCount ?? 0,
    createdAt: created,
  };
}

/* ---------------------------------------------------------------------------
   GIRLS
   --------------------------------------------------------------------------- */
const GIRLS: SeedInput[] = [
  {
    slug: "wildflower-tiered-dress",
    name: "Wildflower Tiered Dress",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["2-5", "6-9"],
    cats: ["dresses", "new-arrivals"],
    plate: "dress",
    priceUsd: 42,
    colors: [C.coral, C.sage, C.ivory],
    description:
      "A soft cotton dress with three gathered tiers that move when she does. Wide shoulder straps stay put through the whole day.",
    materials: "100% cotton poplin",
    care: "Machine wash cold, tumble dry low",
    styling: "Wears easily with sandals now and a knit cardigan once it cools down.",
    isNew: true,
    isFeatured: true,
    soldCount: 64,
    low: ["4Y"],
    daysAgo: 3,
  },
  {
    slug: "sunday-knit-cardigan",
    name: "Sunday Knit Cardigan",
    brand: "Maison Petit",
    gender: "girls",
    ages: ["0-2", "2-5"],
    cats: ["knitwear"],
    plate: "knitwear",
    priceUsd: 38,
    colors: [C.butter, C.blush, C.ivory],
    description:
      "A fine-gauge cotton cardigan with small shell buttons. Light enough for summer evenings, warm enough for the first days of autumn.",
    materials: "80% cotton, 20% viscose",
    care: "Hand wash cold, dry flat",
    styling: "The layer that finishes almost everything else in her wardrobe.",
    isBestseller: true,
    soldCount: 118,
    daysAgo: 26,
  },
  {
    slug: "playground-denim-jacket",
    name: "Playground Denim Jacket",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["6-9", "10-14"],
    cats: ["jackets", "sale"],
    plate: "jacket",
    priceUsd: 54,
    compareAtUsd: 68,
    colors: [C.denim, C.ivory],
    description:
      "Washed denim that already feels broken in, with a slightly roomy cut so there is space to grow and space to move.",
    materials: "100% cotton denim",
    care: "Machine wash cold, wash separately first time",
    styling: "Over the tiered dress, or with everything else she owns.",
    isBestseller: true,
    soldCount: 92,
    low: ["12Y"],
    soldOut: ["14Y"],
    daysAgo: 48,
  },
  {
    slug: "ribbed-everyday-tee",
    name: "Ribbed Everyday Tee",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["2-5", "6-9", "10-14"],
    cats: ["t-shirts"],
    plate: "tshirt",
    priceUsd: 16,
    colors: [C.ivory, C.coral, C.sage, C.lilac],
    description:
      "The tee that goes in the bag for every trip. Ribbed cotton keeps its shape after a hundred washes.",
    materials: "95% cotton, 5% elastane rib",
    care: "Machine wash cold",
    styling: "Buy two. It is the one she reaches for first.",
    isBestseller: true,
    soldCount: 240,
    daysAgo: 60,
  },
  {
    slug: "meadow-pleated-skirt",
    name: "Meadow Pleated Skirt",
    brand: "Maison Petit",
    gender: "girls",
    ages: ["6-9", "10-14"],
    cats: ["skirts", "new-arrivals"],
    plate: "skirt",
    priceUsd: 32,
    colors: [C.sage, C.charcoal],
    description:
      "Sharp knife pleats in a fabric soft enough to sit on the floor in. Elastic back so it fits without fuss.",
    materials: "65% polyester, 35% viscose",
    care: "Machine wash cold, cool iron",
    styling: "School in the morning, a birthday party by the afternoon.",
    isNew: true,
    soldCount: 31,
    daysAgo: 6,
  },
  {
    slug: "little-linen-set",
    name: "Little Linen Set",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["0-2", "2-5"],
    cats: ["sets", "new-arrivals"],
    plate: "set",
    priceUsd: 46,
    colors: [C.ecru, C.blush],
    description:
      "A washed linen top and matching bloomers. Cut wide so air moves through it on the hottest days.",
    materials: "55% linen, 45% cotton",
    care: "Machine wash cold, tumble dry low",
    styling: "Made for August in Beirut.",
    isNew: true,
    isFeatured: true,
    soldCount: 27,
    daysAgo: 4,
  },
  {
    slug: "stargaze-pyjama-set",
    name: "Stargaze Pyjama Set",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["2-5", "6-9"],
    cats: ["pyjamas"],
    plate: "pyjamas",
    priceUsd: 28,
    colors: [C.lilac, C.sky],
    description:
      "Brushed cotton with a small printed star. Cuffed ankles so the legs stay down while she sleeps.",
    materials: "100% brushed cotton",
    care: "Machine wash warm",
    styling: "The pair that ends up being worn all Sunday.",
    soldCount: 76,
    daysAgo: 34,
  },
  {
    slug: "corduroy-wide-pants",
    name: "Corduroy Wide Pants",
    brand: "Maison Petit",
    gender: "girls",
    ages: ["6-9", "10-14"],
    cats: ["pants"],
    plate: "pants",
    priceUsd: 36,
    colors: [C.tangerine, C.charcoal, C.sage],
    description:
      "Fine-wale corduroy with a wide leg and an adjustable inner waistband. Deep pockets, because they get used.",
    materials: "98% cotton, 2% elastane",
    care: "Machine wash cold, inside out",
    styling: "The wide leg is the whole point — let it hang long.",
    soldCount: 44,
    low: ["9Y"],
    daysAgo: 19,
  },
  {
    slug: "seaside-swimsuit",
    name: "Seaside Swimsuit",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["2-5", "6-9"],
    cats: ["swimwear"],
    plate: "swimwear",
    priceUsd: 24,
    colors: [C.turquoise, C.strawberry],
    description:
      "A one-piece with a wide back strap that stays on through every jump. UPF 50+ fabric that dries quickly.",
    materials: "82% polyamide, 18% elastane",
    care: "Rinse in cold water after swimming",
    styling: "Ready for the coast road.",
    soldCount: 58,
    soldOut: ["3Y"],
    daysAgo: 22,
  },
  {
    slug: "velvet-party-dress",
    name: "Velvet Party Dress",
    brand: "Maison Petit",
    gender: "girls",
    ages: ["6-9", "10-14"],
    cats: ["occasionwear", "dresses"],
    plate: "occasion",
    priceUsd: 68,
    colors: [C.cobalt, C.strawberry],
    description:
      "Deep velvet with a full skirt and a satin sash that ties at the back. Lined so it sits properly without scratching.",
    materials: "Velvet: 92% polyester, 8% elastane. Lining: 100% cotton",
    care: "Dry clean only",
    styling: "For the evenings that get photographed.",
    isFeatured: true,
    soldCount: 39,
    low: ["10Y"],
    daysAgo: 12,
  },
  {
    slug: "canvas-strap-sandals",
    name: "Canvas Strap Sandals",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["2-5", "6-9"],
    cats: ["shoes"],
    plate: "shoes",
    priceUsd: 34,
    colors: [C.ivory, C.coral],
    description:
      "Two adjustable straps and a cushioned footbed. A flexible sole that bends where a child's foot bends.",
    materials: "Cotton canvas upper, rubber sole",
    care: "Wipe clean with a damp cloth",
    styling: "Runs true to size — order her usual.",
    soldCount: 67,
    daysAgo: 30,
  },
  {
    slug: "hair-ribbon-trio",
    name: "Hair Ribbon Trio",
    brand: "Kids Moda",
    gender: "girls",
    ages: ["2-5", "6-9", "10-14"],
    cats: ["accessories"],
    plate: "accessory",
    priceUsd: 12,
    colors: [C.stripe],
    description: "Three grosgrain ribbons in the Kids Moda colours. Soft elastic that does not pull.",
    materials: "100% grosgrain polyester",
    care: "Hand wash",
    styling: "The small thing that finishes the outfit.",
    soldCount: 152,
    daysAgo: 40,
  },
];

/* ---------------------------------------------------------------------------
   BOYS
   --------------------------------------------------------------------------- */
const BOYS: SeedInput[] = [
  {
    slug: "weekend-cotton-polo",
    name: "Weekend Cotton Polo",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["2-5", "6-9"],
    cats: ["polos", "new-arrivals"],
    plate: "polo",
    priceUsd: 22,
    colors: [C.cobalt, C.ivory, C.lime],
    description:
      "Piqué cotton with a two-button placket and a flat collar that holds its shape after washing.",
    materials: "100% cotton piqué",
    care: "Machine wash cold",
    styling: "Smart enough for lunch, easy enough for after.",
    isNew: true,
    isBestseller: true,
    soldCount: 134,
    daysAgo: 5,
  },
  {
    slug: "explorer-cargo-shorts",
    name: "Explorer Cargo Shorts",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["6-9", "10-14"],
    cats: ["shorts"],
    plate: "shorts",
    priceUsd: 28,
    colors: [C.sage, C.ecru, C.charcoal],
    description:
      "Six pockets, a reinforced seat and an adjustable waist. Built for the way boys actually wear shorts.",
    materials: "100% cotton twill",
    care: "Machine wash warm",
    styling: "Everything he collects has somewhere to go.",
    soldCount: 88,
    low: ["8Y"],
    daysAgo: 24,
  },
  {
    slug: "rainbow-stripe-tee",
    name: "Rainbow Stripe Tee",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["0-2", "2-5"],
    cats: ["tees", "new-arrivals"],
    plate: "tshirt",
    priceUsd: 18,
    colors: [C.stripe, C.ivory],
    description:
      "The house stripe, knitted rather than printed, so the colour never cracks or fades at the shoulder.",
    materials: "100% organic cotton jersey",
    care: "Machine wash cold",
    styling: "The Kids Moda stripe. Start here.",
    isNew: true,
    isFeatured: true,
    soldCount: 96,
    daysAgo: 2,
  },
  {
    slug: "field-hooded-sweatshirt",
    name: "Field Hooded Sweatshirt",
    brand: "Maison Petit",
    gender: "boys",
    ages: ["6-9", "10-14"],
    cats: ["hoodies", "sale"],
    plate: "hoodie",
    priceUsd: 44,
    compareAtUsd: 55,
    colors: [C.turquoise, C.charcoal, C.tangerine],
    description:
      "Heavy brushed-back fleece with a lined hood and ribbed cuffs that stay tight at the wrist.",
    materials: "80% cotton, 20% recycled polyester",
    care: "Machine wash cold, tumble dry low",
    styling: "The one he will wear until you hide it to wash it.",
    isBestseller: true,
    soldCount: 156,
    low: ["10Y"],
    daysAgo: 44,
  },
  {
    slug: "harbour-denim-jeans",
    name: "Harbour Denim Jeans",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["2-5", "6-9"],
    cats: ["jeans"],
    plate: "jeans",
    priceUsd: 38,
    colors: [C.denim, C.charcoal],
    description:
      "Straight-leg denim with a little stretch and an adjustable inner waistband. Double-stitched at the knee.",
    materials: "98% cotton, 2% elastane",
    care: "Machine wash cold, inside out",
    styling: "Cuff them once while he grows into them.",
    soldCount: 102,
    daysAgo: 28,
  },
  {
    slug: "first-steps-two-piece",
    name: "First Steps Two-Piece",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["0-2"],
    cats: ["sets", "new-arrivals"],
    plate: "set",
    priceUsd: 40,
    colors: [C.sky, C.ecru],
    description:
      "A snap-shoulder top and soft-waist trousers. Every fastening is where a parent's hands can reach it quickly.",
    materials: "100% cotton interlock",
    care: "Machine wash warm",
    styling: "Made for the months when everything changes weekly.",
    isNew: true,
    soldCount: 41,
    daysAgo: 7,
  },
  {
    slug: "lighthouse-knit-jumper",
    name: "Lighthouse Knit Jumper",
    brand: "Maison Petit",
    gender: "boys",
    ages: ["2-5", "6-9"],
    cats: ["knitwear"],
    plate: "knitwear",
    priceUsd: 42,
    colors: [C.butter, C.cobalt, C.ivory],
    description:
      "A chunky cotton knit with a crew neck and dropped shoulders, so it pulls on over a shirt without a fight.",
    materials: "100% cotton",
    care: "Hand wash cold, dry flat",
    styling: "Over the linen shirt for lunch by the sea.",
    isFeatured: true,
    soldCount: 63,
    daysAgo: 15,
  },
  {
    slug: "court-sneakers",
    name: "Court Sneakers",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["6-9", "10-14"],
    cats: ["shoes"],
    plate: "shoes",
    priceUsd: 48,
    colors: [C.ivory, C.cobalt],
    description:
      "A low canvas sneaker with a vulcanised rubber sole and a wide toe box. Laces plus a hidden elastic gusset.",
    materials: "Canvas upper, rubber sole",
    care: "Wipe clean, air dry",
    styling: "Order a half size up if he is between sizes.",
    isBestseller: true,
    soldCount: 121,
    soldOut: ["13Y"],
    daysAgo: 36,
  },
  {
    slug: "linen-occasion-shirt",
    name: "Linen Occasion Shirt",
    brand: "Maison Petit",
    gender: "boys",
    ages: ["6-9", "10-14"],
    cats: ["occasionwear", "shirts"],
    plate: "shirt",
    priceUsd: 36,
    colors: [C.ivory, C.sky],
    description:
      "Washed linen with a soft collar and a straight hem, so it looks right tucked in or left out.",
    materials: "100% washed linen",
    care: "Machine wash cold, cool iron",
    styling: "The shirt for weddings that turns into the shirt for everything.",
    soldCount: 54,
    low: ["11Y"],
    daysAgo: 17,
  },
  {
    slug: "camp-pyjama-set",
    name: "Camp Pyjama Set",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["2-5", "6-9"],
    cats: ["pyjamas"],
    plate: "pyjamas",
    priceUsd: 26,
    colors: [C.lime, C.charcoal],
    description: "Long-sleeve cotton with a printed pocket. Cut generously so it does not pull when he turns over.",
    materials: "100% cotton",
    care: "Machine wash warm",
    styling: "Soft from the first night, not the tenth wash.",
    soldCount: 71,
    daysAgo: 32,
  },
  {
    slug: "everyday-puffer-jacket",
    name: "Everyday Puffer Jacket",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["10-14"],
    cats: ["jackets"],
    plate: "jacket",
    priceUsd: 72,
    colors: [C.cobalt, C.charcoal],
    description:
      "Water-repellent shell with recycled fill, a high collar and zipped pockets. Light to carry when he takes it off.",
    materials: "Shell: 100% recycled polyester. Fill: 100% recycled polyester",
    care: "Machine wash cold, tumble dry low to restore loft",
    styling: "Mountain mornings and school runs.",
    soldCount: 48,
    low: ["12Y"],
    daysAgo: 11,
  },
  {
    slug: "everyday-cotton-cap",
    name: "Everyday Cotton Cap",
    brand: "Kids Moda",
    gender: "boys",
    ages: ["2-5", "6-9", "10-14"],
    cats: ["accessories"],
    plate: "accessory",
    priceUsd: 14,
    colors: [C.tangerine, C.cobalt, C.ivory],
    description: "Six-panel cotton twill with an adjustable strap and a curved brim that keeps the sun off.",
    materials: "100% cotton twill",
    care: "Hand wash, air dry",
    styling: "Lives in the car, gets used every time.",
    soldCount: 187,
    daysAgo: 50,
  },
];

export const SEED_PRODUCTS: Product[] = [...GIRLS, ...BOYS].map(build);

/** Brands present in the catalogue — powers the brand filter facet. */
export const SEED_BRANDS = Array.from(new Set(SEED_PRODUCTS.map((p) => p.brand))).sort();
