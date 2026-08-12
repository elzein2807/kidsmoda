import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/app/checkout/CheckoutForm";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

/**
 * CHECKOUT PAGE — the site chrome steps back here on purpose. A stripped
 * header with only the logo and a way back keeps the customer on task; the
 * WhatsApp dock is hidden on this route for the same reason.
 */
export default function CheckoutPage() {
  return (
    <div className="km-checkoutpage" data-world="neutral">
      <header className="km-checkoutpage__head km-shell">
        <Link href="/" aria-label="Kids Moda — home">
          <Logo />
        </Link>
        <Link href="/" className="km-checkoutpage__back">
          <Icon name="chevron-left" size={16} />
          Keep shopping
        </Link>
      </header>

      <div className="km-shell">
        <h1 className="km-page-type km-checkoutpage__title">Checkout</h1>
        <p className="km-hint km-checkoutpage__sub">
          Cash on delivery · No account needed
        </p>
        <CheckoutForm />
      </div>
    </div>
  );
}
