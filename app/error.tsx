"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { STORE } from "@/lib/config";
import { whatsapp } from "@/lib/whatsapp";

/**
 * Route error boundary. Offers a retry, a way home, and — because Kids Moda
 * genuinely sells this way — a WhatsApp route so a broken page never costs a sale.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server logs carry the digest; the customer never sees a stack trace.
    console.error("Route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="km-shell km-section km-notfound" data-world="neutral">
      <p className="km-eyebrow">Something went wrong</p>
      <h1 className="km-page-type km-notfound__title">This page did not load.</h1>
      <p className="km-lede km-notfound__copy">
        It is us, not you. Try again — and if it keeps happening, message us and
        we will sort your order out directly.
      </p>
      <div className="km-notfound__actions">
        <button type="button" className="km-btn" onClick={reset}>Try again</button>
        <Link href="/" className="km-btn km-btn--outline">Go home</Link>
        <a href={whatsapp.general()} target="_blank" rel="noopener noreferrer" className="km-btn km-btn--outline">
          <Icon name="whatsapp" size={18} />
          {STORE.phoneDisplay}
        </a>
      </div>
      {error.digest && <p className="km-hint km-notfound__digest">Reference: {error.digest}</p>}
    </div>
  );
}
