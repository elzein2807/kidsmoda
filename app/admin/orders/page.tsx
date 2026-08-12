import Link from "next/link";
import { listOrders } from "@/lib/commerce/orders";
import { StatusPill } from "@/components/admin/Kpi";
import { Icon } from "@/components/ui/Icon";
import { formatUsd, formatLbp } from "@/lib/currency";
import { whatsapp } from "@/lib/whatsapp";

const STATUSES = [
  "new", "awaiting_confirmation", "confirmed", "preparing", "ready_for_delivery",
  "out_for_delivery", "delivered", "cancelled", "returned", "exchanged",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = typeof params.status === "string" ? params.status : undefined;
  const all = await listOrders();
  const orders = filter ? all.filter((o) => o.status === filter) : all;

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Orders</h1>
          <p className="km-admin__sub">Confirm, prepare, dispatch and collect cash.</p>
        </div>
      </header>

      <div className="km-admin__filters">
        <Link href="/admin/orders" className="km-chip" aria-pressed={!filter}>All ({all.length})</Link>
        {STATUSES.map((s) => {
          const count = all.filter((o) => o.status === s).length;
          if (count === 0 && filter !== s) return null;
          return (
            <Link key={s} href={`/admin/orders?status=${s}`} className="km-chip" aria-pressed={filter === s}>
              {s.replace(/_/g, " ")} ({count})
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="km-panel">
          <div className="km-empty km-empty--flat">
            <Icon name="truck" size={30} className="km-empty__icon" />
            <p className="km-empty__title">
              {filter ? "No orders with this status" : "No orders yet"}
            </p>
            <p className="km-empty__copy">
              Website orders land here immediately. WhatsApp orders can be entered
              through In-Store so stock stays correct.
            </p>
          </div>
        </div>
      ) : (
        <div className="km-panel">
          <div className="km-tablewrap">
            <table className="km-table">
              <thead>
                <tr>
                  <th scope="col">Order</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Items</th>
                  <th scope="col">Delivery</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="km-table__num">Cash due</th>
                  <th scope="col"><span className="km-sr">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.number}>
                    <td>
                      <strong data-numeric>{o.number}</strong>
                      <br />
                      <span className="km-admin__muted">
                        {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </td>
                    <td>
                      {o.address.fullName}
                      <br />
                      <a href={`tel:+961${o.address.phone}`} className="km-admin__muted">{o.address.phone}</a>
                    </td>
                    <td>
                      {o.items.map((i) => (
                        <div key={i.variantId} className="km-admin__muted">
                          {i.name} · {i.size} × {i.qty}
                        </div>
                      ))}
                    </td>
                    <td>
                      {o.address.city}, {o.address.governorate}
                      <br />
                      <span className="km-admin__muted">{o.address.address}</span>
                    </td>
                    <td><StatusPill status={o.status} /></td>
                    <td className="km-table__num">
                      {o.currency === "USD" ? formatUsd(o.totalUsd) : formatLbp(o.totalUsd, o.exchangeRate)}
                      <br />
                      <span className="km-admin__muted">{o.cashCollected ? "Collected" : "Due"}</span>
                    </td>
                    <td>
                      <div className="km-admin__rowactions">
                        <a
                          href={whatsapp.orderConfirmation(o.number)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="km-iconbtn"
                          aria-label={`WhatsApp about order ${o.number}`}
                        >
                          <Icon name="whatsapp" size={17} />
                        </a>
                        <a href={`tel:+961${o.address.phone}`} className="km-iconbtn" aria-label={`Call ${o.address.fullName}`}>
                          <Icon name="phone" size={17} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="km-admin__note">
        <Icon name="alert" size={16} />
        Status changes, delivery assignment, printing and cash reconciliation
        write to the database. They become active once Supabase is connected —
        the schema for all of it is in <code>supabase/migrations</code>.
      </p>
    </>
  );
}
