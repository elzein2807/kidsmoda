import Link from "next/link";

import { getKpis, lowStockVariants, bestSellers, salesSeries, categoryPerformance, inventoryValue } from "@/lib/admin/metrics";
import { listOrders } from "@/lib/commerce/orders";
import { Kpi, StatusPill } from "@/components/admin/Kpi";
import { LineChart, BarList } from "@/components/admin/Chart";
import { Icon } from "@/components/ui/Icon";
import { formatUsd, formatLbp } from "@/lib/currency";

export default async function AdminOverviewPage() {
  const [kpis, series, orders] = await Promise.all([getKpis(), salesSeries(14), listOrders()]);
  const low = lowStockVariants().slice(0, 8);
  const best = bestSellers(6);
  const categories = categoryPerformance();
  const stock = inventoryValue();
  const recent = orders.slice(0, 6);

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Overview</h1>
          <p className="km-admin__sub">Everything happening in the shop today.</p>
        </div>
        <Link href="/admin/pos" className="km-btn km-btn--sm">
          <Icon name="cash" size={16} />
          Record an in-store sale
        </Link>
      </header>

      {/* ---- Money ---------------------------------------------------- */}
      <section aria-labelledby="km-adm-sales" className="km-admin__section">
        <h2 id="km-adm-sales" className="km-admin__h2">Sales</h2>
        <div className="km-kpis">
          <Kpi label="Sales today" value={formatUsd(kpis.salesToday)} hint={formatLbp(kpis.salesToday)} />
          <Kpi label="This week" value={formatUsd(kpis.salesWeek)} />
          <Kpi label="This month" value={formatUsd(kpis.salesMonth)} />
          <Kpi label="Average order" value={formatUsd(kpis.averageOrderValue)} />
          <Kpi label="Cash expected" value={formatUsd(kpis.cashExpected)} tone="warning" hint="Not yet collected" />
          <Kpi label="Cash collected" value={formatUsd(kpis.cashCollected)} tone="positive" />
        </div>

        <div className="km-panel">
          <div className="km-panel__head">
            <h3 className="km-panel__title">Last 14 days</h3>
            <p className="km-panel__meta">Online and in-store combined</p>
          </div>
          <LineChart data={series} label="Revenue over the last 14 days" />
        </div>
      </section>

      {/* ---- Orders --------------------------------------------------- */}
      <section aria-labelledby="km-adm-orders" className="km-admin__section">
        <h2 id="km-adm-orders" className="km-admin__h2">Orders</h2>
        <div className="km-kpis">
          <Kpi label="Orders today" value={String(kpis.ordersToday)} />
          <Kpi label="Awaiting confirmation" value={String(kpis.awaitingConfirmation)} tone={kpis.awaitingConfirmation > 0 ? "warning" : "neutral"} hint="Call the customer" />
          <Kpi label="Preparing" value={String(kpis.preparing)} />
          <Kpi label="Ready for delivery" value={String(kpis.readyForDelivery)} />
          <Kpi label="Out for delivery" value={String(kpis.outForDelivery)} />
          <Kpi label="Delivered" value={String(kpis.delivered)} tone="positive" />
          <Kpi label="Cancelled" value={String(kpis.cancelled)} tone={kpis.cancelled > 0 ? "danger" : "neutral"} />
          <Kpi label="Returned" value={String(kpis.returned)} tone={kpis.returned > 0 ? "danger" : "neutral"} />
        </div>

        <div className="km-panel">
          <div className="km-panel__head">
            <h3 className="km-panel__title">Latest orders</h3>
            <Link href="/admin/orders" className="km-link km-link--static">All orders</Link>
          </div>

          {recent.length === 0 ? (
            <div className="km-empty km-empty--flat">
              <p className="km-empty__title">No orders yet</p>
              <p className="km-empty__copy">
                Orders placed on the website will appear here the moment they come in.
              </p>
            </div>
          ) : (
            <div className="km-tablewrap">
              <table className="km-table">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Where</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="km-table__num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.number}>
                      <td><Link href={`/admin/orders?order=${o.number}`} className="km-link km-link--static">{o.number}</Link></td>
                      <td>{o.address.fullName}<br /><span className="km-admin__muted">{o.address.phone}</span></td>
                      <td>{o.address.city}, {o.address.governorate}</td>
                      <td><StatusPill status={o.status} /></td>
                      <td className="km-table__num">{formatUsd(o.totalUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ---- Channels & stock ----------------------------------------- */}
      <section aria-labelledby="km-adm-stock" className="km-admin__section">
        <h2 id="km-adm-stock" className="km-admin__h2">Stock &amp; channels</h2>

        <div className="km-admin__split">
          <div className="km-panel">
            <div className="km-panel__head">
              <h3 className="km-panel__title">Where sales come from</h3>
            </div>
            <BarList
              data={[
                { label: "Online", value: kpis.onlineSales },
                { label: "In store", value: kpis.inStoreSales },
              ]}
            />
            <p className="km-panel__note">
              In-store figures cover sales recorded in the dashboard. The physical
              cash register is not connected — see In-Store for how that works today.
            </p>
          </div>

          <div className="km-panel">
            <div className="km-panel__head">
              <h3 className="km-panel__title">Stock on hand</h3>
              <Link href="/admin/inventory" className="km-link km-link--static">Inventory</Link>
            </div>
            <div className="km-kpis km-kpis--tight">
              <Kpi label="Units in shop" value={stock.units.toLocaleString("en-US")} />
              <Kpi label="Retail value" value={formatUsd(stock.retail)} />
              <Kpi label="Cost value" value={formatUsd(stock.cost)} />
            </div>
          </div>
        </div>

        <div className="km-admin__split">
          <div className="km-panel">
            <div className="km-panel__head">
              <h3 className="km-panel__title">Low stock</h3>
              <span className="km-panel__meta" data-numeric>{kpis.lowStockCount} variants</span>
            </div>
            {low.length === 0 ? (
              <p className="km-panel__note">Nothing is running low.</p>
            ) : (
              <div className="km-tablewrap">
                <table className="km-table">
                  <thead>
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Colour / size</th>
                      <th scope="col" className="km-table__num">Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {low.map((r) => (
                      <tr key={r.sku}>
                        <td>{r.product.name}</td>
                        <td>{r.color} · {r.size}</td>
                        <td className="km-table__num">
                          <span className={r.available === 0 ? "km-pill km-pill--danger" : "km-pill km-pill--warning"}>
                            {r.available === 0 ? "Sold out" : r.available}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="km-panel">
            <div className="km-panel__head">
              <h3 className="km-panel__title">Best sellers</h3>
              <Link href="/admin/reports" className="km-link km-link--static">Reports</Link>
            </div>
            <BarList
              data={best.map((b) => ({ label: b.product.name, value: b.revenue }))}
            />
          </div>
        </div>

        <div className="km-panel">
          <div className="km-panel__head">
            <h3 className="km-panel__title">Category performance</h3>
          </div>
          <BarList data={categories} />
        </div>
      </section>
    </>
  );
}
