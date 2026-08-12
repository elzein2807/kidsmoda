/**
 * KIDS MODA — core domain types.
 *
 * These mirror the Postgres schema in supabase/migrations exactly, so the
 * seed catalogue and the database return identical shapes. Swapping the data
 * source never changes a component.
 */

/** The two — and only two — customer shopping worlds. */
export type Gender = "girls" | "boys";

/** Age is an internal navigation dimension inside Boys and Girls, never a
 *  top-level department. Ranges are editable from Admin → Settings. */
export type AgeGroupId = "0-2" | "2-5" | "6-9" | "10-14";

export interface AgeGroup {
  id: AgeGroupId;
  /** "0–2 Years" — always rendered with an en dash */
  label: string;
  /** "0–2" for compact chips */
  short: string;
  /** Sizes that belong to this bracket, in wearing order */
  sizes: string[];
  order: number;
}

export type CategoryGroup = "highlight" | "clothing" | "footwear" | "special";

export interface Category {
  slug: string;
  name: string;
  /** Which worlds show this category in navigation */
  genders: Gender[];
  group: CategoryGroup;
  order: number;
}

export interface ColorOption {
  id: string;
  name: string;
  /** Swatch colour. Two-tone garments use `hexSecondary`. */
  hex: string;
  hexSecondary?: string;
}

/**
 * Stock lives at VARIANT level — colour × size. There is never a single
 * stock number for a product.
 */
export interface Variant {
  id: string;
  sku: string;
  barcode: string;
  colorId: string;
  size: string;
  /** Units physically in the boutique */
  stockOnHand: number;
  /** Units held by unconfirmed online orders */
  reserved: number;
  /** Units expected from suppliers */
  incoming: number;
  /** Units written off */
  damaged: number;
  lowStockThreshold: number;
}

export type MediaKind = "image" | "video";

/**
 * `src` is empty until real KIDS MODA photography is uploaded. Every consumer
 * renders <Figure>, which falls back to an art-directed vector plate keyed by
 * `plate`. Dropping a real file in and setting `src` is the only change needed.
 */
export interface Media {
  id: string;
  kind: MediaKind;
  src: string | null;
  /** Written for screen readers — describes the garment, not the file */
  alt: string;
  /** Vector fallback: which garment silhouette to draw */
  plate?: PlateShape;
  /** Poster frame for video */
  poster?: string | null;
}

export type PlateShape =
  | "dress" | "set" | "tshirt" | "polo" | "shirt" | "pants" | "jeans"
  | "shorts" | "skirt" | "hoodie" | "jacket" | "knitwear" | "pyjamas"
  | "swimwear" | "shoes" | "accessory" | "occasion" | "campaign";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  gender: Gender;
  ageGroups: AgeGroupId[];
  categorySlugs: string[];

  description: string;
  /** Fabric composition, e.g. "100% cotton jersey" */
  materials: string;
  care: string;
  /** One short styling line used on the PDP and Shop the Look */
  styling: string;

  /** USD is the canonical currency. LBP is always derived from the rate in
   *  site settings — never stored per product, never hardcoded in a component. */
  priceUsd: number;
  compareAtUsd: number | null;
  /** Never exposed to the storefront. Admin margin reporting only. */
  costUsd: number;

  colors: ColorOption[];
  variants: Variant[];
  media: Media[];

  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  visible: boolean;

  soldCount: number;
  createdAt: string;
}

/* -------------------------------------------------------------------------
   Derived, computed on the server — the storefront never recalculates stock
   ------------------------------------------------------------------------- */

export interface StockSummary {
  /** stockOnHand − reserved, floored at 0 */
  available: number;
  isSoldOut: boolean;
  isLowStock: boolean;
}

export type ProductAvailability = "in-stock" | "low-stock" | "sold-out";

/* -------------------------------------------------------------------------
   Catalogue querying
   ------------------------------------------------------------------------- */

export type SortKey =
  | "recommended"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "bestselling";

export interface CatalogQuery {
  gender?: Gender;
  ages?: AgeGroupId[];
  categories?: string[];
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyNew?: boolean;
  onlySale?: boolean;
  inStockOnly?: boolean;
  search?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface CatalogFacets {
  categories: { slug: string; name: string; count: number }[];
  ages: { id: AgeGroupId; label: string; count: number }[];
  sizes: { size: string; count: number }[];
  colors: { id: string; name: string; hex: string; count: number }[];
  brands: { name: string; count: number }[];
  priceRange: { min: number; max: number };
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: CatalogFacets;
}

/* -------------------------------------------------------------------------
   Cart & orders
   ------------------------------------------------------------------------- */

export interface CartLine {
  /** `${productId}:${variantId}` — stable key for merge/update */
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  brand: string;
  colorId: string;
  colorName: string;
  size: string;
  qty: number;
  /** Snapshot for display only. The server always re-prices at checkout. */
  unitUsd: number;
  compareAtUsd: number | null;
  plate?: PlateShape;
  src: string | null;
}

export type Currency = "USD" | "LBP";

export type OrderStatus =
  | "new"
  | "awaiting_confirmation"
  | "confirmed"
  | "preparing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "exchanged";

export type OrderChannel = "online" | "in_store";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  building: string;
  floor: string;
  landmark: string;
  instructions: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  brand: string;
  colorName: string;
  size: string;
  qty: number;
  unitUsd: number;
  lineTotalUsd: number;
}

export interface Order {
  id: string;
  /** Human reference shown to the customer, e.g. KM-4821 */
  number: string;
  channel: OrderChannel;
  status: OrderStatus;
  items: OrderItem[];
  address: DeliveryAddress;
  currency: Currency;
  subtotalUsd: number;
  deliveryFeeUsd: number;
  discountUsd: number;
  totalUsd: number;
  /** Rate captured at order time so historic orders never re-price */
  exchangeRate: number;
  cashCollected: boolean;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
}
