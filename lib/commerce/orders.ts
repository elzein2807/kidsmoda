import "server-only";

import type { Currency, DeliveryAddress, Order, OrderItem, OrderStatus } from "@/types/catalog";
import { CURRENCY, DELIVERY } from "@/lib/config";
import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { variantStock } from "@/lib/commerce/stock";

/**
 * ORDERS — server-side pricing and stock checking.
 *
 * The browser sends product ids, variant ids and quantities. Nothing else.
 * Every price, fee and total below is calculated here from the catalogue, so
 * a tampered request cannot change what an order costs.
 *
 * STORAGE: orders are held in a module-level Map for development. This is
 * intentionally not a database — Supabase credentials do not exist yet, and a
 * fake persistence layer would be worse than an obvious one. `createOrder`
 * and `getOrder` are the only two functions that change when the `orders`
 * table in supabase/migrations is wired up.
 */

/**
 * Held on globalThis rather than in module scope. Route handlers, server
 * components and server actions are compiled into separate bundles, so a plain
 * module-level Map would give each of them its own copy and an order placed
 * through the API would be invisible to the confirmation page.
 */
interface OrderStore {
  orders: Map<string, Order>;
  /** idempotencyKey → order number, so a double submit returns the first order */
  idempotency: Map<string, string>;
}

const globalStore = globalThis as typeof globalThis & { __kmOrders?: OrderStore };

const store: OrderStore = (globalStore.__kmOrders ??= {
  orders: new Map<string, Order>(),
  idempotency: new Map<string, string>(),
});

const ORDERS = store.orders;
const IDEMPOTENCY = store.idempotency;

export interface CreateOrderInput {
  items: { productId: string; variantId: string; qty: number }[];
  address: DeliveryAddress;
  currency: Currency;
  idempotencyKey: string;
}

export type CreateOrderResult =
  | { ok: true; order: Order; duplicate: boolean }
  | { ok: false; reason: "empty" | "stock"; unavailable: { name: string; size: string; available: number }[] };

function orderNumber(): string {
  // KM-XXXX, readable over the phone and easy to write on a delivery note
  const n = 1000 + ORDERS.size + Math.floor(Math.random() * 900);
  return `KM-${n}`;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const existing = IDEMPOTENCY.get(input.idempotencyKey);
  if (existing) {
    const order = ORDERS.get(existing);
    if (order) return { ok: true, order, duplicate: true };
  }

  if (input.items.length === 0) return { ok: false, reason: "empty", unavailable: [] };

  const lines: OrderItem[] = [];
  const unavailable: { name: string; size: string; available: number }[] = [];

  for (const item of input.items) {
    const product = SEED_PRODUCTS.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant) {
      unavailable.push({ name: product?.name ?? "An item", size: "—", available: 0 });
      continue;
    }

    const stock = variantStock(variant);
    if (stock.available < item.qty) {
      unavailable.push({ name: product.name, size: variant.size, available: stock.available });
      continue;
    }

    const color = product.colors.find((c) => c.id === variant.colorId);
    lines.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      brand: product.brand,
      colorName: color?.name ?? "—",
      size: variant.size,
      qty: item.qty,
      // Server price. The client's snapshot is never used.
      unitUsd: product.priceUsd,
      lineTotalUsd: Math.round(product.priceUsd * item.qty * 100) / 100,
    });
  }

  if (unavailable.length > 0) return { ok: false, reason: "stock", unavailable };

  const subtotalUsd = Math.round(lines.reduce((s, l) => s + l.lineTotalUsd, 0) * 100) / 100;
  const deliveryFeeUsd = subtotalUsd >= DELIVERY.freeThresholdUsd ? 0 : DELIVERY.feeUsd;
  const totalUsd = Math.round((subtotalUsd + deliveryFeeUsd) * 100) / 100;

  const now = new Date().toISOString();
  const order: Order = {
    id: crypto.randomUUID(),
    number: orderNumber(),
    channel: "online",
    status: "awaiting_confirmation",
    items: lines,
    address: input.address,
    currency: input.currency,
    subtotalUsd,
    deliveryFeeUsd,
    discountUsd: 0,
    totalUsd,
    // Captured now so a historic order never re-prices when the rate changes
    exchangeRate: CURRENCY.usdToLbp,
    cashCollected: false,
    internalNote: "",
    createdAt: now,
    updatedAt: now,
  };

  ORDERS.set(order.number, order);
  IDEMPOTENCY.set(input.idempotencyKey, order.number);

  // NOTE: stock is NOT decremented here. Online orders reserve stock only once
  // the owner confirms them in Admin → Orders, because Kids Moda also sells
  // the same physical piece over the counter. Reserving on confirmation is
  // what keeps the shop floor and the website honest with each other.

  return { ok: true, order, duplicate: false };
}

export async function getOrder(number: string): Promise<Order | null> {
  return ORDERS.get(number.toUpperCase()) ?? null;
}

export async function listOrders(): Promise<Order[]> {
  return [...ORDERS.values()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function updateOrderStatus(number: string, status: OrderStatus): Promise<Order | null> {
  const order = ORDERS.get(number);
  if (!order) return null;
  const next = { ...order, status, updatedAt: new Date().toISOString() };
  ORDERS.set(number, next);
  return next;
}
