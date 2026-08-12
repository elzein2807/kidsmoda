import { STORE } from "@/lib/config";

/**
 * WhatsApp is a primary sales channel for Kids Moda, not a support afterthought.
 * Every entry point pre-fills a message so the owner immediately knows the
 * context of the enquiry.
 */

function link(message: string): string {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const whatsapp = {
  general: () => link("Hi Kids Moda! I have a question."),

  product: (name: string, url: string, size?: string, color?: string) => {
    const details = [size && `size ${size}`, color && `in ${color}`].filter(Boolean).join(", ");
    return link(
      `Hi Kids Moda! I'd like to ask about ${name}${details ? ` (${details})` : ""}.\n${url}`,
    );
  },

  sizeHelp: (name: string) =>
    link(`Hi Kids Moda! Could you help me choose the right size for ${name}?`),

  /** Used by the cart drawer — the whole bag as a readable list */
  cart: (lines: { name: string; size: string; colorName: string; qty: number }[], total: string) => {
    const body = lines
      .map((l) => `• ${l.name} — ${l.colorName}, ${l.size} × ${l.qty}`)
      .join("\n");
    return link(`Hi Kids Moda! I'd like to order:\n\n${body}\n\nTotal: ${total}`);
  },

  orderConfirmation: (orderNumber: string) =>
    link(`Hi Kids Moda! I just placed order ${orderNumber}. Could you confirm it please?`),

  checkoutHelp: () => link("Hi Kids Moda! I need help completing my order."),

  directions: () =>
    link(`Hi Kids Moda! Could you send me directions to the store in ${STORE.district}?`),

  stockCheck: (name: string, size: string) =>
    link(`Hi Kids Moda! Is ${name} available in size ${size}?`),
};

export const CALL_HREF = `tel:+${STORE.whatsapp}`;
