import { z } from "zod";
import { GOVERNORATES } from "@/lib/config";

/**
 * CHECKOUT VALIDATION — one schema, used by the browser for instant feedback
 * and by the server as the real gate. The client copy is a convenience; the
 * server never trusts it.
 */

/**
 * Lebanese mobile numbers. Accepts the forms people actually type:
 *   03 123 456 · 03123456 · 71 123 456 · +961 71 123 456 · 0096171123456
 * Mobile prefixes in use: 03, 70, 71, 76, 78, 79, 81.
 */
export function normalisePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, "").replace(/^\+?961/, "").replace(/^00961/, "").replace(/^0/, "");
  return digits;
}

export function isLebaneseMobile(input: string): boolean {
  const d = normalisePhone(input);
  return /^(?:3|70|71|76|78|79|81)\d{6}$/.test(d);
}

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(80, "That name is too long"),

  phone: z
    .string()
    .trim()
    .min(6, "Please enter your phone number")
    .refine(isLebaneseMobile, "Enter a Lebanese mobile number, for example 03 123 456"),

  governorate: z.enum(GOVERNORATES, { message: "Please choose your governorate" }),

  city: z.string().trim().min(2, "Please enter your city or town").max(60),

  address: z
    .string()
    .trim()
    .min(6, "Please give a street and area so the driver can find you")
    .max(200),

  building: z.string().trim().max(60).optional().default(""),
  floor: z.string().trim().max(30).optional().default(""),
  landmark: z.string().trim().max(120).optional().default(""),
  instructions: z.string().trim().max(300).optional().default(""),

  currency: z.enum(["USD", "LBP"]),

  /** The server re-prices from these, it never trusts a total from the client */
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1, "Your bag is empty"),

  coupon: z.string().trim().max(40).optional().default(""),

  /** Guards against a double submit creating two identical orders */
  idempotencyKey: z.string().min(8).max(64),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Field-level errors keyed by field name, for rendering under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
