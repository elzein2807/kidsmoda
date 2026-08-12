import { getKpis, salesSeries, categoryPerformance, bestSellers, inventoryValue } from "@/lib/admin/metrics";
import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { LineChart, BarList } from "@/components/admin/Chart";
import { Kpi } from "@/components/admin/Kpi";
import { formatUsd } from "@/lib/currency";
import { Icon } from "@/components/ui/Icon";

export default async function AdminReportsPage() {
  const [kpis, series] = await Promise.all([getKpis(), salesSeries(30)]);
  const categories = categoryPerformance();
  const best = bestSellers(8);
  const stock = inventoryValue();

  // Size performance tells the owner what to reorder — the single most useful
  // report for a children's shop, where sizes sell out unevenly.
  const sizeMap = new Map<string, number>();
  for (const p of SEED_PRODUCTS) {
    for (const v of p.variants) {
      sizeMap.set(v.size, (sizeMap.get(v.size) ?? 0) + v.stockOnHand);
    }
  }
  const sizes = [...sizeMap.entries()].map(([label, value]) => ({ label, value })).slice(0, 12);

  const margin = stock.retail > 0 ? Math.round(((stock.retail - stock.cost) / stock.retail) * 100) : 0;
  const totalOrders = kpis.delivered + kpis.cancelled + kpis.returned + kpis.awaitingConfirmation;
  const cancelRate = totalOrders > 0 ? Math.round((kpis.cancelled / totalOrders) * 100) : 0;
  const returnRate = totalOrders > 0 ? Math.round((kpis.returned / totalOrders) * 100) : 0;

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Reports</h1>
          <p className="km-admin__sub">What is selling, what is sitting, and what it is worth.</p>
        </div>
        <button type="button" className="km-btn km-btn--outline km-btn--sm">
          <Icon name="download" size={16} />
          Export
        </button>
      </header>

      <div className="km-kpis">
        <Kpi label="Sales this month" value={formatUsd(kpis.salesMonth)} />
        <Kpi label="Average order" value={formatUsd(kpis.averageOrderValue)} />
        <Kpi label="Stock margin" value={`${margin}%`} hint="Retail against cost" />
        <Kpi label="Cancellation rate" value={`${cancelRate}%`} tone={cancelRate > 10 ? "warning" : "neutral"} />
        <Kpi label="Return rate" value={`${returnRate}%`} tone={returnRate > 10 ? "warning" : "neutral"} />
        <Kpi label="Stock value" value={formatUsd(stock.retail)} />
      </div>

      <div className="km-panel">
        <div className="km-panel__head">
          <h2 className="km-panel__title">Revenue, last 30 days</h2>
        </div>
        <LineChart data={series} height={220} label="Revenue over the last 30 days" />
      </div>

      <div className="km-admin__split">
        <div className="km-panel">
          <div className="km-panel__head"><h2 className="km-panel__title">Best selling pieces</h2></div>
          <BarList data={best.map((b) => ({ label: b.product.name, value: b.revenue }))} />
        </div>
        <div className="km-panel">
          <div className="km-panel__head"><h2 className="km-panel__title">Category performance</h2></div>
          <BarList data={categories} />
        </div>
      </div>

      <div className="km-panel">
        <div className="km-panel__head">
          <h2 className="km-panel__title">Stock held by size</h2>
          <p className="km-panel__meta">Where the money is sitting</p>
        </div>
        <BarList data={sizes} format={(n) => `${n} units`} />
      </div>

      <p className="km-admin__note">
        <Icon name="alert" size={16} />
        Daily, weekly and monthly breakdowns, online against in-store, delivery
        performance and stock age all read from the same order and movement
        tables. They fill in as real orders arrive.
      </p>
    </>
  );
}
