import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { PosTerminal } from "@/components/admin/PosTerminal";
import { Icon } from "@/components/ui/Icon";

export default function AdminPosPage() {
  // Only what the terminal needs, flattened for fast client-side search
  const catalogue = SEED_PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    priceUsd: p.priceUsd,
    colors: p.colors.map((c) => ({ id: c.id, name: c.name })),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      barcode: v.barcode,
      colorId: v.colorId,
      size: v.size,
      available: Math.max(0, v.stockOnHand - v.reserved),
    })),
  }));

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">In-store sale</h1>
          <p className="km-admin__sub">Ring up a sale at the counter and take it off the website stock.</p>
        </div>
      </header>

      <p className="km-note km-note--info km-admin__note">
        <Icon name="alert" size={18} />
        <span>
          <strong>The cash register is not connected.</strong> We do not yet know
          which software it runs, so nothing here syncs with it automatically and
          this page does not pretend otherwise. Sales recorded here reduce the
          same inventory the website sells from, which is what keeps the shop
          floor and the site in agreement. The adapter layer for a real register
          integration is described in <code>docs/POS-INTEGRATION.md</code>.
        </span>
      </p>

      <PosTerminal catalogue={catalogue} />
    </>
  );
}
