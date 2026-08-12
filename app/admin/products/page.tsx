import Link from "next/link";
import { SEED_PRODUCTS } from "@/lib/commerce/seed";
import { productAvailable, isOnSale } from "@/lib/commerce/stock";
import { Icon } from "@/components/ui/Icon";
import { formatUsd } from "@/lib/currency";
import { categoryBySlug } from "@/lib/config";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.toLowerCase() : "";
  const gender = typeof params.gender === "string" ? params.gender : "";

  const products = SEED_PRODUCTS.filter((p) => {
    if (gender && p.gender !== gender) return false;
    if (q && !`${p.name} ${p.brand} ${p.slug}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <>
      <header className="km-admin__head">
        <div>
          <h1 className="km-admin__title">Products</h1>
          <p className="km-admin__sub">{SEED_PRODUCTS.length} products in the catalogue.</p>
        </div>
        <Link href="/admin/products/new" className="km-btn km-btn--sm">
          <Icon name="plus" size={16} />
          New product
        </Link>
      </header>

      <form className="km-admin__filters" role="search">
        <input
          className="km-input km-admin__search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, brand or SKU"
          aria-label="Search products"
        />
        <Link href="/admin/products" className="km-chip" aria-pressed={!gender}>All</Link>
        <Link href="/admin/products?gender=girls" className="km-chip" aria-pressed={gender === "girls"}>Girls</Link>
        <Link href="/admin/products?gender=boys" className="km-chip" aria-pressed={gender === "boys"}>Boys</Link>
      </form>

      <div className="km-panel">
        <div className="km-tablewrap">
          <table className="km-table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">World</th>
                <th scope="col">Ages</th>
                <th scope="col">Category</th>
                <th scope="col" className="km-table__num">Cost</th>
                <th scope="col" className="km-table__num">Price</th>
                <th scope="col" className="km-table__num">Margin</th>
                <th scope="col" className="km-table__num">Stock</th>
                <th scope="col">Flags</th>
                <th scope="col"><span className="km-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = productAvailable(p);
                const margin = Math.round(((p.priceUsd - p.costUsd) / p.priceUsd) * 100);
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      <br />
                      <span className="km-admin__muted">{p.brand} · {p.variants.length} variants</span>
                    </td>
                    <td>{p.gender === "girls" ? "Girls" : "Boys"}</td>
                    <td>{p.ageGroups.join(", ")}</td>
                    <td>{p.categorySlugs.map((c) => categoryBySlug(c)?.name ?? c).join(", ")}</td>
                    <td className="km-table__num">{formatUsd(p.costUsd)}</td>
                    <td className="km-table__num">
                      {formatUsd(p.priceUsd)}
                      {isOnSale(p) && <><br /><span className="km-admin__muted">was {formatUsd(p.compareAtUsd!)}</span></>}
                    </td>
                    <td className="km-table__num">{margin}%</td>
                    <td className="km-table__num">
                      <span className={stock === 0 ? "km-pill km-pill--danger" : stock <= 5 ? "km-pill km-pill--warning" : "km-pill"}>
                        {stock}
                      </span>
                    </td>
                    <td>
                      <div className="km-admin__flags">
                        {p.isNew && <span className="km-badge km-badge--new">New</span>}
                        {isOnSale(p) && <span className="km-badge km-badge--sale">Sale</span>}
                        {p.isBestseller && <span className="km-badge km-badge--best">Best</span>}
                      </div>
                    </td>
                    <td>
                      <div className="km-admin__rowactions">
                        <Link href={`/admin/products/${p.slug}`} className="km-iconbtn" aria-label={`Edit ${p.name}`}>
                          <Icon name="edit" size={17} />
                        </Link>
                        <Link href={`/product/${p.slug}`} className="km-iconbtn" aria-label={`View ${p.name} on the site`}>
                          <Icon name="arrow-up-right" size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {products.length === 0 && (
        <div className="km-panel">
          <div className="km-empty km-empty--flat">
            <p className="km-empty__title">Nothing matched</p>
            <p className="km-empty__copy">Try a different word, or clear the filters.</p>
          </div>
        </div>
      )}
    </>
  );
}
