# Connecting the cash register

## Where things stand

Kids Moda sells the same physical garments two ways: over the counter in Hadath
and through this website. Both must draw down the same stock, or the site will
sell a piece that left the shop an hour earlier.

The boutique currently rings up counter sales on a standalone cash register.
**We do not yet know which software or model it is**, so nothing in this
codebase talks to it, and nothing pretends to. Admin → In-Store is a real
terminal that records a counter sale against the same inventory the website
uses — it just has to be operated by a person rather than fed automatically.

## What already works

`Admin → In-Store` (`/admin/pos`) lets whoever is at the counter:

- search by product name, SKU or barcode (a scanner is just fast typing plus
  Enter, which the input already handles)
- pick colour, size and quantity, with live availability per variant
- take cash in USD or LBP and calculate change at the configured rate
- complete the sale, which writes an `in_store` order and a matching
  `stock_movements` row

That movement row is what takes the piece off the website. It is the same
ledger online orders use, so the two channels can never disagree.

## The adapter layer

Everything a register integration needs sits behind one boundary, so adding it
later does not touch the dashboard, the storefront or the schema.

```
components/admin/PosTerminal.tsx     the counter UI
        │
        ▼
lib/commerce/orders.ts               createOrder({ channel: "in_store", … })
        │
        ▼
stock_movements                      one signed row per line, kind = 'in_store_sale'
```

A register integration becomes a second producer of the same movement rows:

```ts
// lib/pos/adapter.ts  — to be written when the register is identified
export interface RegisterAdapter {
  /** Human name, shown in Admin → Settings */
  name: string;
  /** Pull sales since a timestamp, newest last */
  fetchSales(since: Date): Promise<RegisterSale[]>;
  /** Optional: push our catalogue so the register knows prices and barcodes */
  pushCatalogue?(items: RegisterItem[]): Promise<void>;
}

export interface RegisterSale {
  externalId: string;      // the register's own receipt id — the idempotency key
  soldAt: Date;
  currency: "USD" | "LBP";
  lines: { barcode: string; quantity: number; unitPrice: number }[];
}
```

The importer then:

1. matches each `barcode` to a `product_variants` row;
2. skips any `externalId` already imported (so a re-run cannot double-count);
3. writes one `in_store` order plus its `stock_movements`;
4. records anything it could not match for a human to resolve, rather than
   silently dropping it.

## What we need from the shop to build it

1. The **make and model** of the register, and the software it runs.
2. Whether it can **export sales** — a CSV on a USB stick is enough to start.
3. Whether every garment already carries a **barcode**, and whether those
   barcodes match the ones we generate.
4. Whether the register is **networked** or stands alone.

With (1) and (2) we can build a nightly import. With (4) we can move to
near-live sync. Until then, the terminal above keeps both channels honest with
one extra tap at the counter.

## Interim rule

Until a register integration exists, a counter sale must be entered in
Admin → In-Store. It takes a few seconds and it is the only thing preventing
the website from selling a garment that is already in a customer's bag.
