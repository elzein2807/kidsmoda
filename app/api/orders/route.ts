import { NextResponse } from "next/server";
import { checkoutSchema, fieldErrors, normalisePhone } from "@/lib/validation/checkout";
import { createOrder } from "@/lib/commerce/orders";

/**
 * POST /api/orders — place a cash-on-delivery order.
 *
 * The request carries product ids, variant ids and quantities only. Prices,
 * the delivery fee and the total are all computed on the server from the
 * catalogue, so a modified request cannot change what an order costs.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Could not read the request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: fieldErrors(parsed.error), message: "Please check the highlighted fields." },
      { status: 422 },
    );
  }

  const d = parsed.data;
  const result = await createOrder({
    items: d.items,
    currency: d.currency,
    idempotencyKey: d.idempotencyKey,
    address: {
      fullName: d.fullName,
      phone: normalisePhone(d.phone),
      governorate: d.governorate,
      city: d.city,
      address: d.address,
      building: d.building ?? "",
      floor: d.floor ?? "",
      landmark: d.landmark ?? "",
      instructions: d.instructions ?? "",
    },
  });

  if (!result.ok) {
    if (result.reason === "stock") {
      return NextResponse.json(
        {
          ok: false,
          reason: "stock",
          unavailable: result.unavailable,
          message: "Some pieces sold out while you were checking out.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, message: "Your bag is empty." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    duplicate: result.duplicate,
    order: {
      number: result.order.number,
      totalUsd: result.order.totalUsd,
      subtotalUsd: result.order.subtotalUsd,
      deliveryFeeUsd: result.order.deliveryFeeUsd,
      currency: result.order.currency,
    },
  });
}
