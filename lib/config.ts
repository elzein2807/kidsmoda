/**
 * KIDS MODA — central business configuration.
 *
 * Everything the owner might change lives here (and will later be served from
 * Admin → Settings). Nothing in this file is a secret.
 */

import type { AgeGroup, Category, Gender } from "@/types/catalog";

export const SITE = {
  name: "KIDS MODA",
  tagline: "Fashion for Little Moments",
  description:
    "Premium kids fashion in Hadath, Beirut. Boys and girls, 0 to 14 years. Delivery all over Lebanon, cash on delivery.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kidsmoda.com",
  locale: "en_LB",
} as const;

export const STORE = {
  name: "Kids Moda — Hadath",
  street: "Saint Thérèse, facing Orca Center",
  district: "Hadath",
  city: "Beirut",
  country: "Lebanon",
  /** E.164, no spaces — used to build wa.me links */
  whatsapp: "96181898170",
  /** Display form */
  phoneDisplay: "+961 81 898 170",
  instagram: "kidsmoda",
  instagramUrl: "https://instagram.com/kidsmoda",
  hours: [
    { days: "Monday – Saturday", time: "9:30 — 19:30" },
    { days: "Sunday", time: "Closed" },
  ],
  /** Google Maps deep link for the "Get directions" action */
  mapsUrl: "https://maps.google.com/?q=Hadath+Saint+Therese+Beirut+Lebanon",
} as const;

/**
 * CURRENCY
 * USD is canonical. The LBP rate is a single configuration value — it must
 * never be hardcoded inside a component, and it moves to Admin → Settings
 * (site_settings.exchange_rate) once the database is connected.
 */
export const CURRENCY = {
  base: "USD" as const,
  /** Placeholder development rate. Owner-editable in Admin → Settings. */
  usdToLbp: 89_000,
  /** Round LBP to the nearest note so prices read cleanly in store */
  lbpRounding: 1_000,
} as const;

export const DELIVERY = {
  /** Flat fee across Lebanon, owner-editable */
  feeUsd: 3,
  /** Orders at or above this ship free */
  freeThresholdUsd: 100,
  etaDays: "2 – 4 working days",
  etaBeirut: "1 – 2 working days",
  exchangeWindowDays: 7,
} as const;

/** Lebanese governorates, used for checkout validation and delivery routing. */
export const GOVERNORATES = [
  "Beirut",
  "Mount Lebanon",
  "North Lebanon",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South Lebanon",
  "Nabatieh",
] as const;

export const AGE_GROUPS: AgeGroup[] = [
  { id: "0-2", label: "0–2 Years", short: "0–2", order: 1, sizes: ["3M", "6M", "9M", "12M", "18M", "24M"] },
  { id: "2-5", label: "2–5 Years", short: "2–5", order: 2, sizes: ["2Y", "3Y", "4Y", "5Y"] },
  { id: "6-9", label: "6–9 Years", short: "6–9", order: 3, sizes: ["6Y", "7Y", "8Y", "9Y"] },
  { id: "10-14", label: "10–14 Years", short: "10–14", order: 4, sizes: ["10Y", "11Y", "12Y", "13Y", "14Y"] },
];

const BOTH: Gender[] = ["girls", "boys"];

/**
 * Category taxonomy. `genders` controls where a category appears in
 * navigation — Dresses and Skirts are Girls-only, Polos are Boys-only, and
 * everything else is shared. Editable from Admin → Categories.
 */
export const CATEGORIES: Category[] = [
  { slug: "new-arrivals", name: "New Arrivals", genders: BOTH, group: "highlight", order: 1 },
  { slug: "occasionwear", name: "Occasionwear", genders: BOTH, group: "highlight", order: 2 },

  { slug: "dresses", name: "Dresses", genders: ["girls"], group: "clothing", order: 10 },
  { slug: "sets", name: "Sets", genders: BOTH, group: "clothing", order: 11 },
  { slug: "t-shirts", name: "T-Shirts & Tops", genders: ["girls"], group: "clothing", order: 12 },
  { slug: "tees", name: "T-Shirts", genders: ["boys"], group: "clothing", order: 12 },
  { slug: "polos", name: "Polos", genders: ["boys"], group: "clothing", order: 13 },
  { slug: "shirts", name: "Shirts", genders: BOTH, group: "clothing", order: 14 },
  { slug: "skirts", name: "Skirts", genders: ["girls"], group: "clothing", order: 15 },
  { slug: "pants", name: "Pants", genders: BOTH, group: "clothing", order: 16 },
  { slug: "jeans", name: "Jeans", genders: BOTH, group: "clothing", order: 17 },
  { slug: "shorts", name: "Shorts", genders: BOTH, group: "clothing", order: 18 },
  { slug: "hoodies", name: "Hoodies & Sweatshirts", genders: BOTH, group: "clothing", order: 19 },
  { slug: "jackets", name: "Jackets", genders: BOTH, group: "clothing", order: 20 },
  { slug: "knitwear", name: "Knitwear", genders: BOTH, group: "clothing", order: 21 },
  { slug: "pyjamas", name: "Pyjamas", genders: BOTH, group: "clothing", order: 22 },
  { slug: "swimwear", name: "Swimwear", genders: BOTH, group: "clothing", order: 23 },

  { slug: "shoes", name: "Shoes", genders: BOTH, group: "footwear", order: 30 },
  { slug: "accessories", name: "Accessories", genders: BOTH, group: "footwear", order: 31 },

  { slug: "sale", name: "Sale", genders: BOTH, group: "special", order: 40 },
];

export function categoriesFor(gender: Gender): Category[] {
  return CATEGORIES.filter((c) => c.genders.includes(gender)).sort((a, b) => a.order - b.order);
}

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function ageGroupById(id: string): AgeGroup | undefined {
  return AGE_GROUPS.find((a) => a.id === id);
}

/** Every size in the system, in wearing order — used by filter facets. */
export const ALL_SIZES: string[] = AGE_GROUPS.flatMap((a) => a.sizes);

export const WORLDS: { id: Gender; label: string; href: string }[] = [
  { id: "girls", label: "Girls", href: "/girls" },
  { id: "boys", label: "Boys", href: "/boys" },
];

/** Announcement bar messages. Owner-editable from Admin → Website Content. */
export const ANNOUNCEMENTS: string[] = [
  "Delivery all over Lebanon · Cash on Delivery · USD & LBP",
  "New arrivals every week · Visit us in Hadath, Saint Thérèse",
  "Free delivery on orders over $100",
];
