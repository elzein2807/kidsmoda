import type { Metadata } from "next";
import { CartView } from "@/app/cart/CartView";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
