import { CURRENCY, DELIVERY, GOVERNORATES, STORE, AGE_GROUPS } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";

export default function AdminSettingsPage() {
  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Settings</h1>
          <p className="km-admin__sub">The numbers and rules the whole shop runs on.</p>
        </div>
      </header>

      <div className="km-admin__split">
        <section className="km-panel">
          <h2 className="km-panel__title">Currency</h2>
          <p className="km-panel__note">
            Prices are stored in USD. The LBP shown everywhere on the site is
            calculated from this rate, so changing it here re-prices the whole
            shop — no product needs editing.
          </p>
          <div className="km-form__fields">
            <label className="km-field km-field--full">
              <span className="km-label">1 USD equals (LBP)</span>
              <input className="km-input" type="number" defaultValue={CURRENCY.usdToLbp} />
            </label>
            <label className="km-field">
              <span className="km-label">Round LBP to nearest</span>
              <input className="km-input" type="number" defaultValue={CURRENCY.lbpRounding} />
            </label>
          </div>
        </section>

        <section className="km-panel">
          <h2 className="km-panel__title">Delivery</h2>
          <div className="km-form__fields">
            <label className="km-field">
              <span className="km-label">Delivery fee (USD)</span>
              <input className="km-input" type="number" step="0.5" defaultValue={DELIVERY.feeUsd} />
            </label>
            <label className="km-field">
              <span className="km-label">Free over (USD)</span>
              <input className="km-input" type="number" defaultValue={DELIVERY.freeThresholdUsd} />
            </label>
            <label className="km-field">
              <span className="km-label">Exchange window (days)</span>
              <input className="km-input" type="number" defaultValue={DELIVERY.exchangeWindowDays} />
            </label>
          </div>
          <p className="km-panel__note">
            Delivering to {GOVERNORATES.length} governorates.
          </p>
        </section>
      </div>

      <section className="km-panel">
        <h2 className="km-panel__title">Age groups</h2>
        <p className="km-panel__note">
          These drive navigation, filters and the size options on every product.
        </p>
        <div className="km-tablewrap">
          <table className="km-table">
            <thead>
              <tr>
                <th scope="col">Label</th>
                <th scope="col">Short</th>
                <th scope="col">Sizes</th>
              </tr>
            </thead>
            <tbody>
              {AGE_GROUPS.map((a) => (
                <tr key={a.id}>
                  <td><input className="km-input km-input--mini" defaultValue={a.label} aria-label={`Label for ${a.id}`} /></td>
                  <td><input className="km-input km-input--mini" defaultValue={a.short} aria-label={`Short label for ${a.id}`} /></td>
                  <td>{a.sizes.join(" · ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="km-panel">
        <h2 className="km-panel__title">Store details</h2>
        <div className="km-form__fields">
          <label className="km-field"><span className="km-label">WhatsApp number</span><input className="km-input" defaultValue={STORE.phoneDisplay} /></label>
          <label className="km-field"><span className="km-label">Instagram</span><input className="km-input" defaultValue={`@${STORE.instagram}`} /></label>
          <label className="km-field km-field--full"><span className="km-label">Address</span><input className="km-input" defaultValue={`${STORE.street}, ${STORE.district}`} /></label>
        </div>
      </section>

      <section className="km-panel">
        <h2 className="km-panel__title">Who has access</h2>
        <p className="km-panel__note">
          Only people listed in <code>admin_profiles</code> can open this
          dashboard — signing in is not enough on its own. Today that is the
          owner and her son.
        </p>
      </section>

      <p className="km-admin__note">
        <Icon name="alert" size={16} />
        These fields write to <code>site_settings</code> once the database is
        connected. Right now they show the values in <code>lib/config.ts</code>.
      </p>
    </>
  );
}
