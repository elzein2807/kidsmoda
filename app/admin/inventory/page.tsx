import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { variantStock } from "@/lib/commerce/stock";
import { inventoryValue, lowStockVariants } from "@/lib/admin/metrics";
import { Kpi } from "@/components/admin/Kpi";
import { Icon } from "@/components/ui/Icon";
import { formatUsd } from "@/lib/currency";

export default function AdminInventoryPage() {
  const value = inventoryValue();
  const low = lowStockVariants();

  const rows = SEED_PRODUCTS.flatMap((p) =>
    p.variants.map((v) => ({
      product: p,
      variant: v,
      color: p.colors.find((c) => c.id === v.colorId)?.name ?? v.colorId,
      stock: variantStock(v),
    })),
  );

  const totalReserved = rows.reduce((n, r) => n + r.variant.reserved, 0);
  const totalIncoming = rows.reduce((n, r) => n + r.variant.incoming, 0);

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Inventory</h1>
          <p className="km-admin__sub">Every colour and size counted separately.</p>
        </div>
        <div className="km-admin__headactions">
          <button type="button" className="km-btn km-btn--outline km-btn--sm">
            <Icon name="download" size={16} />
            Export CSV
          </button>
          <button type="button" className="km-btn km-btn--outline km-btn--sm">
            <Icon name="upload" size={16} />
            Import CSV
          </button>
          <button type="button" className="km-btn km-btn--sm">
            <Icon name="barcode" size={16} />
            Stock count
          </button>
        </div>
      </header>

      <div className="km-kpis">
        <Kpi label="Units in shop" value={value.units.toLocaleString("en-US")} />
        <Kpi label="Retail value" value={formatUsd(value.retail)} />
        <Kpi label="Cost value" value={formatUsd(value.cost)} />
        <Kpi label="Reserved online" value={String(totalReserved)} hint="Held by unconfirmed orders" />
        <Kpi label="Incoming" value={String(totalIncoming)} />
        <Kpi label="Low or out" value={String(low.length)} tone={low.length > 0 ? "warning" : "neutral"} />
      </div>

      <div className="km-panel">
        <div className="km-panel__head">
          <h2 className="km-panel__title">All variants</h2>
          <p className="km-panel__meta" data-numeric>{rows.length} rows</p>
        </div>

        <div className="km-tablewrap km-tablewrap--tall">
          <table className="km-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Colour</th>
                <th scope="col">Size</th>
                <th scope="col">SKU</th>
                <th scope="col" className="km-table__num">In shop</th>
                <th scope="col" className="km-table__num">Reserved</th>
                <th scope="col" className="km-table__num">Available</th>
                <th scope="col" className="km-table__num">Incoming</th>
                <th scope="col" className="km-table__num">Damaged</th>
                <th scope="col">State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.variant.id}>
                  <td>{r.product.name}</td>
                  <td>{r.color}</td>
                  <td>{r.variant.size}</td>
                  <td><code>{r.variant.sku}</code></td>
                  <td className="km-table__num">{r.variant.stockOnHand}</td>
                  <td className="km-table__num">{r.variant.reserved}</td>
                  <td className="km-table__num">{r.stock.available}</td>
                  <td className="km-table__num">{r.variant.incoming}</td>
                  <td className="km-table__num">{r.variant.damaged}</td>
                  <td>
                    {r.stock.isSoldOut ? (
                      <span className="km-pill km-pill--danger">Sold out</span>
                    ) : r.stock.isLowStock ? (
                      <span className="km-pill km-pill--warning">Low</span>
                    ) : (
                      <span className="km-pill km-pill--positive">In stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="km-admin__note">
        <Icon name="alert" size={16} />
        Stock corrections, damage write-offs, incoming deliveries and the full
        movement history are modelled in <code>stock_movements</code>. Every
        change is recorded with who made it and why — nothing edits a number
        silently.
      </p>
    </>
  );
}
