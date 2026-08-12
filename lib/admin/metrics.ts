import "server-only";

import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { listOrders } from "@/lib/commerce/orders";
import { variantStock } from "@/lib/commerce/stock";
import type { Order, Product } from "@/types/catalog";

/**
 * ADMIN METRICS
 *
 * Computed from real order and stock records rather than invented figures. The
 * dashboard is an operational tool: if there have been no orders today, it
 * says zero, because a store owner needs to trust these numbers.
 *
 * Historic in-store sales do not exist yet (the boutique still uses a physical
 * cash register and no integration has been agreed), so `inStore` reflects
 * only sales recorded through Admin → In-Store.
 */

export interface Kpis {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  ordersToday: number;
  awaitingConfirmation: number;
  preparing: number;
  readyForDelivery: number;
  outForDelivery: number;
  delivered: number;
  cancelled: number;
  returned: number;
  cashExpected: number;
  cashCollected: number;
  onlineSales: number;
  inStoreSales: number;
  averageOrderValue: number;
  lowStockCount: number;
}

function startOfDay(d = new Date()): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export async function getKpis(): Promise<Kpis> {
  const orders = await listOrders();
  const today = startOfDay();
  const weekAgo = today - 6 * 86_400_000;
  const monthAgo = today - 29 * 86_400_000;

  const at = (o: Order) => +new Date(o.createdAt);
  const isRevenue = (o: Order) => o.status !== "cancelled" && o.status !== "returned";
  const sum = (list: Order[]) => Math.round(list.reduce((n, o) => n + o.totalUsd, 0) * 100) / 100;

  const revenue = orders.filter(isRevenue);
  const todays = revenue.filter((o) => at(o) >= today);

  const byStatus = (s: Order["status"]) => orders.filter((o) => o.status === s).length;

  const delivered = revenue.filter((o) => o.status === "delivered");
  const outstanding = revenue.filter((o) => !o.cashCollected && o.status !== "delivered");

  return {
    salesToday: sum(todays),
    salesWeek: sum(revenue.filter((o) => at(o) >= weekAgo)),
    salesMonth: sum(revenue.filter((o) => at(o) >= monthAgo)),
    ordersToday: todays.length,
    awaitingConfirmation: byStatus("awaiting_confirmation") + byStatus("new"),
    preparing: byStatus("preparing"),
    readyForDelivery: byStatus("ready_for_delivery"),
    outForDelivery: byStatus("out_for_delivery"),
    delivered: delivered.length,
    cancelled: byStatus("cancelled"),
    returned: byStatus("returned"),
    cashExpected: sum(outstanding),
    cashCollected: sum(revenue.filter((o) => o.cashCollected)),
    onlineSales: sum(revenue.filter((o) => o.channel === "online")),
    inStoreSales: sum(revenue.filter((o) => o.channel === "in_store")),
    averageOrderValue: revenue.length ? Math.round((sum(revenue) / revenue.length) * 100) / 100 : 0,
    lowStockCount: lowStockVariants().length,
  };
}

export interface LowStockRow {
  product: Product;
  sku: string;
  color: string;
  size: string;
  available: number;
  threshold: number;
}

export function lowStockVariants(): LowStockRow[] {
  const rows: LowStockRow[] = [];
  for (const product of SEED_PRODUCTS) {
    for (const v of product.variants) {
      const s = variantStock(v);
      if (s.available > v.lowStockThreshold) continue;
      rows.push({
        product,
        sku: v.sku,
        color: product.colors.find((c) => c.id === v.colorId)?.name ?? v.colorId,
        size: v.size,
        available: s.available,
        threshold: v.lowStockThreshold,
      });
    }
  }
  return rows.sort((a, b) => a.available - b.available);
}

export function bestSellers(limit = 6): { product: Product; sold: number; revenue: number }[] {
  return [...SEED_PRODUCTS]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit)
    .map((p) => ({ product: p, sold: p.soldCount, revenue: Math.round(p.soldCount * p.priceUsd) }));
}

/** Last 14 days of revenue, for the overview chart. */
export async function salesSeries(days = 14): Promise<{ label: string; value: number }[]> {
  const orders = await listOrders();
  const out: { label: string; value: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const start = day.getTime();
    const end = start + 86_400_000;

    const value = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "returned")
      .filter((o) => {
        const t = +new Date(o.createdAt);
        return t >= start && t < end;
      })
      .reduce((n, o) => n + o.totalUsd, 0);

    out.push({ label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: Math.round(value) });
  }
  return out;
}

/** Category performance, derived from catalogue sold counts. */
export function categoryPerformance(): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of SEED_PRODUCTS) {
    const key = p.categorySlugs[0] ?? "other";
    map.set(key, (map.get(key) ?? 0) + p.soldCount * p.priceUsd);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function inventoryValue(): { retail: number; cost: number; units: number } {
  let retail = 0;
  let cost = 0;
  let units = 0;
  for (const p of SEED_PRODUCTS) {
    for (const v of p.variants) {
      units += v.stockOnHand;
      retail += v.stockOnHand * p.priceUsd;
      cost += v.stockOnHand * p.costUsd;
    }
  }
  return { retail: Math.round(retail), cost: Math.round(cost), units };
}
