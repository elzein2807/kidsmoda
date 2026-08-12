import { ANNOUNCEMENTS } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";

/**
 * WEBSITE CONTENT — the surfaces the owners must be able to change without a
 * developer. Each block maps to a row in `site_content` keyed by name, so
 * editing here changes the homepage without a deploy.
 */
const BLOCKS = [
  { key: "announcement", title: "Announcement bar", note: "The rotating strip at the very top.", fields: ANNOUNCEMENTS },
  { key: "hero", title: "Homepage hero", note: "Headline, supporting line and the campaign images.", fields: ["Little Looks, Big Personality.", "Fashion for Little Moments"] },
  { key: "two_worlds", title: "Girls & Boys panels", note: "The two-world split under the hero.", fields: ["Girls copy", "Boys copy"] },
  { key: "new_this_week", title: "New this week", note: "Choose which products appear in the weekly drop.", fields: ["8 products selected automatically by newest"] },
  { key: "best_sellers", title: "Best sellers", note: "Pick the pieces to feature, or leave on automatic.", fields: ["Automatic, by units sold"] },
  { key: "shop_the_look", title: "Shop the look", note: "The outfit, the hotspots and the products behind them.", fields: ["4 products, 4 hotspots"] },
  { key: "made_to_move", title: "Brand film", note: "Upload the film and its poster frame.", fields: ["No film uploaded yet"] },
  { key: "store", title: "Our store", note: "Store photography, address and opening hours.", fields: ["Hadath, Saint Thérèse, facing Orca Center"] },
  { key: "community", title: "Instagram wall", note: "The images shown in the community collage.", fields: ["7 tiles"] },
  { key: "footer", title: "Footer", note: "Links, newsletter copy and store details.", fields: ["4 columns"] },
];

export default function AdminContentPage() {
  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Website content</h1>
          <p className="km-admin__sub">Change what the homepage says without touching code.</p>
        </div>
      </header>

      <div className="km-content-blocks">
        {BLOCKS.map((b) => (
          <section key={b.key} className="km-panel km-content-block">
            <div className="km-panel__head">
              <div>
                <h2 className="km-panel__title">{b.title}</h2>
                <p className="km-panel__meta">{b.note}</p>
              </div>
              <button type="button" className="km-btn km-btn--outline km-btn--sm">
                <Icon name="edit" size={15} />
                Edit
              </button>
            </div>
            <ul className="km-content-block__list">
              {b.fields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="km-panel__note">
              Stored as <code>site_content.{b.key}</code>
            </p>
          </section>
        ))}
      </div>

      <p className="km-admin__note">
        <Icon name="alert" size={16} />
        Editing is wired to the <code>site_content</code> table and becomes
        active with the database. Until then the homepage reads its defaults
        from <code>lib/config.ts</code>.
      </p>
    </>
  );
}
