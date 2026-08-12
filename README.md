# KIDS MODA

**Fashion for Little Moments**

The website for Kids Moda — a children's fashion boutique in Hadath, Saint Thérèse,
facing Orca Center, Beirut.

Boys and girls, 0 to 14 years. Delivery all over Lebanon, cash on delivery,
prices in USD and LBP.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

The site runs fully with no configuration. Product data comes from a local
development catalogue until the real one is imported.

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint
```

## Environment

Copy `.env.example` to `.env.local`. Every value is optional — the site works
without them, and switches to the database the moment they exist.

| Variable | Where it runs | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Enables the database and admin sign-in |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | Public reads, restricted by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Guest order writes and stock movements |
| `NEXT_PUBLIC_SITE_URL` | browser + server | Canonical URLs, sitemap, structured data |

`SUPABASE_SERVICE_ROLE_KEY` must never be given a `NEXT_PUBLIC_` prefix. The
module that reads it (`lib/supabase/admin.ts`) imports `server-only`, so a
mistake becomes a build error rather than a leaked key.

---

## Shopping architecture

There are exactly **two** customer-facing worlds: **Girls** and **Boys**.

Age is a navigation and filter dimension *inside* each world, never a
department of its own:

```
/girls                     campaign page (becomes a listing once filtered)
/girls/0-2  /girls/2-5  /girls/6-9  /girls/10-14
/boys       …same
/new-in     /sale        /search
/product/[slug]
```

Age brackets and their sizes live in `lib/config.ts` (`AGE_GROUPS`) and move to
Admin → Settings once the database is connected.

---

## Project structure

```
app/                    routes (App Router, server components by default)
  admin/                private dashboard — gated, noindex, blocked in prod without auth
  api/                  search, product lookup, order placement
components/
  ui/                   Figure, Plate, Icon, Logo, Accordion
  motion/               MotionRoot, Reveal, Ribbon, Parallax, Magnetic, Opening
  shop/                 cards, filters, gallery, buy box, cart, search, checkout
  editorial/            hero, worlds, chapters, drops, film, lookbook, store
  admin/                shell, charts, KPIs, POS, product form
lib/
  commerce/             catalogue, stock, orders, seed data, query parsing
  currency/             USD → LBP, formatting
  supabase/             browser / server / service-role clients
  validation/           zod schemas shared by client and server
  admin/                auth gate, metrics
styles/                 tokens → components → layout → shop → editorial → admin
supabase/migrations/    Postgres schema with row level security
types/                  domain model
```

---

## Design system

Everything derives from `styles/tokens.css`. No component hardcodes a colour,
radius, duration, spacing step or shadow.

**Colour.** A warm-ivory foundation with a ten-hue brand rainbow. Every hue has
three tiers: `base` for colour fields, `ink` for text (all verified at ≥ 4.5:1
on ivory), and `tint` for soft backgrounds.

**Colour worlds.** A section declares `data-world="girls|boys|sale|journal|film|neutral"`
and its children read `--world`, `--world-ink`, `--world-tint`. The full rainbow
never appears inside a single component — it appears across the scroll. Age
brackets carry their own sub-worlds via `data-age`.

**Type.** Fraunces for display (variable optical size; expressive through
composition, never through bubble letterforms) and Inter for interface, with
tabular numerals on every price and dashboard figure.

**Shape.** UI radii stay small and consistent. The *arch* is the signature form
and is reserved for image portals — it is what makes a Kids Moda composition
recognisable with the logo hidden.

**The ribbon.** One signature element, used only at world boundaries, in the
opening, and in the footer, so it stays recognisable rather than decorative.

---

## Motion

- One shared `IntersectionObserver` (`components/motion/MotionRoot.tsx`) drives
  every scroll reveal. Elements are unobserved after revealing, so nothing
  re-animates on scroll-up.
- Content is visible by default; the `km-js` class is only added once the
  observer is running. No JS, an old browser, or a crawler → everything is
  simply visible.
- All motion names a duration and easing token. Parallax is capped, runs on one
  rAF-throttled listener, and is disabled on coarse pointers.
- `prefers-reduced-motion` collapses cinematic motion to opacity cross-fades.
  Nothing is ever hidden from a reduced-motion user.

**The opening.** A first-visit cinematic of about 3.2s: colour fields, fabric
bands entering from both edges, a clip-wipe on the wordmark, the ribbon arc
drawing on, then the bands parting like a curtain while the wordmark travels
toward the header. Variants: full, short (slow device or 2G), reduced, and none
(already seen this session). Skippable with any click, key or scroll, with a
hard timeout so it can never hold the page.

---

## Photography

**No real photography has been supplied yet.** Rather than grey boxes or a fake
human figure, every image slot renders an art-directed vector composition in
its section's colour world — see `components/ui/Plate.tsx`.

To replace, set `src` on the media record (`lib/commerce/seed.ts`, or the
`product_media` table). `<Figure>` then renders `next/image` and the plate is
never called. **No layout or styling change is required.**

Ratios are fixed by token: `portrait 3:4`, `tall 2:3`, `hero 16:9`,
`square 1:1`, `wide 21:9`, `editorial 5:4`.

---

## Commerce

**Stock is variant-level.** Colour × size, always. There is no product-level
quantity column anywhere. `available = stockOnHand − reserved`.

**Pricing is server-side.** The browser sends product ids, variant ids and
quantities. Every price, delivery fee and total is recalculated on the server
from the catalogue (`lib/commerce/orders.ts`), so a modified request cannot
change what an order costs.

**Currency.** USD is canonical. LBP is derived at render time from one rate in
`lib/config.ts` → later `site_settings.usd_to_lbp`. Changing the rate re-prices
the whole shop without touching a product. The rate is captured onto each order
so historic orders never re-price.

**Checkout** is guest-only cash on delivery: no account, no email, no card.
Lebanese mobile validation, an idempotency key against double submits, and a
real stock-conflict state.

---

## What is not connected yet

This is stated plainly rather than mocked:

- **Supabase.** No credentials exist. The schema is written
  (`supabase/migrations/0001_schema.sql`) with row level security; the catalogue
  and orders currently resolve against the development seed. `loadProducts()`
  in `lib/commerce/catalog.ts` is the single function that changes.
- **Admin authentication.** Fully architected (session + `admin_profiles`
  membership — signing in is not enough). Without keys the dashboard runs in a
  clearly-labelled preview mode, and `proxy.ts` blocks `/admin` on production
  deployments so an unprotected dashboard can never ship live.
- **The cash register.** We do not yet know what software it runs, so nothing
  syncs with it. Admin → In-Store records sales against the same inventory the
  website sells from. See [`docs/POS-INTEGRATION.md`](docs/POS-INTEGRATION.md).
- **The mailing list.** The newsletter form validates and confirms locally; it
  does not claim to have subscribed anyone.
- **Product photography and the real catalogue**, as above.

---

## Accessibility

Visible focus on every surface, keyboard paths through all drawers and dialogs
with focus trapping and restoration, semantic landmarks and heading order, 48px
touch targets, `prefers-reduced-motion` throughout, and 16px form inputs so iOS
never zooms. Colour is never the only signal — every badge and status carries a
word.

## SEO

Per-route metadata and canonicals, Open Graph and Twitter cards, a generated
sitemap and robots rules, and structured data for `ClothingStore`, `Product`,
`BreadcrumbList` and `FAQPage`. Checkout, order pages, search and the dashboard
are excluded from indexing.
