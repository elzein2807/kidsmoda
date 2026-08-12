import { listOrders } from "@/lib/commerce/orders";
import { Icon } from "@/components/ui/Icon";
import { formatUsd } from "@/lib/currency";

export default async function AdminCustomersPage() {
  const orders = await listOrders();

  // Customers are derived from orders — guest checkout means the phone number
  // is the identity, and a customer record exists as soon as they buy once.
  const byPhone = new Map<string, { name: string; phone: string; orders: number; spent: number; city: string; last: string }>();
  for (const o of orders) {
    const prev = byPhone.get(o.address.phone);
    byPhone.set(o.address.phone, {
      name: o.address.fullName,
      phone: o.address.phone,
      orders: (prev?.orders ?? 0) + 1,
      spent: (prev?.spent ?? 0) + (o.status === "cancelled" || o.status === "returned" ? 0 : o.totalUsd),
      city: `${o.address.city}, ${o.address.governorate}`,
      last: prev?.last ?? o.createdAt,
    });
  }
  const customers = [...byPhone.values()].sort((a, b) => b.spent - a.spent);

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Customers</h1>
          <p className="km-admin__sub">Built from orders — no account needed to buy.</p>
        </div>
      </header>

      {customers.length === 0 ? (
        <div className="km-panel">
          <div className="km-empty km-empty--flat">
            <Icon name="heart" size={30} className="km-empty__icon" />
            <p className="km-empty__title">No customers yet</p>
            <p className="km-empty__copy">
              A customer record is created from the phone number on their first
              order, so repeat buyers are recognised automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="km-panel">
          <div className="km-tablewrap">
            <table className="km-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Where</th>
                  <th scope="col" className="km-table__num">Orders</th>
                  <th scope="col" className="km-table__num">Total spent</th>
                  <th scope="col">Last order</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.phone}>
                    <td><strong>{c.name}</strong></td>
                    <td><a href={`tel:+961${c.phone}`}>{c.phone}</a></td>
                    <td>{c.city}</td>
                    <td className="km-table__num">{c.orders}</td>
                    <td className="km-table__num">{formatUsd(c.spent)}</td>
                    <td>{new Date(c.last).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
