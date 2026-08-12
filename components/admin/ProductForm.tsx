"use client";

import { useState } from "react";
import type { Product } from "@/types/catalog";
import { AGE_GROUPS, CATEGORIES } from "@/lib/config";
import { Icon } from "@/components/ui/Icon";

/**
 * PRODUCT FORM — the full editing surface: identity, pricing, categorisation,
 * media, flags, SEO and variant-level stock.
 *
 * Saving writes to Supabase. Until the keys exist there is nothing to write
 * to, so the form validates and reports that plainly instead of showing a
 * success message that would be a lie.
 */
export function ProductForm({ product }: { product?: Product }) {
  const [saved, setSaved] = useState<"idle" | "blocked">("idle");
  const isEdit = Boolean(product);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved("blocked");
  };

  return (
    <form className="km-form" onSubmit={submit}>
      {saved === "blocked" && (
        <p className="km-note km-note--warning" role="alert">
          <Icon name="alert" size={18} />
          <span>
            Not saved — there is no database connected yet. Add the Supabase keys
            and this form writes to <code>products</code> and{" "}
            <code>product_variants</code>.
          </span>
        </p>
      )}

      <div className="km-form__grid">
        <section className="km-panel">
          <h2 className="km-panel__title">Details</h2>
          <div className="km-form__fields">
            <label className="km-field km-field--full">
              <span className="km-label">Name</span>
              <input className="km-input" name="name" defaultValue={product?.name} required />
            </label>

            <label className="km-field">
              <span className="km-label">Brand</span>
              <input className="km-input" name="brand" defaultValue={product?.brand ?? "Kids Moda"} />
            </label>

            <label className="km-field">
              <span className="km-label">World</span>
              <select className="km-select" name="gender" defaultValue={product?.gender ?? "girls"}>
                <option value="girls">Girls</option>
                <option value="boys">Boys</option>
              </select>
            </label>

            <fieldset className="km-field km-field--full">
              <legend className="km-label">Age groups</legend>
              <div className="km-form__chips">
                {AGE_GROUPS.map((a) => (
                  <label key={a.id} className="km-check">
                    <input type="checkbox" name="ages" value={a.id} defaultChecked={product?.ageGroups.includes(a.id)} />
                    <span className="km-check__box" aria-hidden="true"><Icon name="check" size={13} strokeWidth={2.4} /></span>
                    <span className="km-check__label">{a.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="km-field km-field--full">
              <legend className="km-label">Categories</legend>
              <div className="km-form__chips km-form__chips--scroll">
                {CATEGORIES.map((c) => (
                  <label key={c.slug} className="km-check">
                    <input type="checkbox" name="categories" value={c.slug} defaultChecked={product?.categorySlugs.includes(c.slug)} />
                    <span className="km-check__box" aria-hidden="true"><Icon name="check" size={13} strokeWidth={2.4} /></span>
                    <span className="km-check__label">{c.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="km-field km-field--full">
              <span className="km-label">Description</span>
              <textarea className="km-textarea" name="description" rows={4} defaultValue={product?.description} />
            </label>

            <label className="km-field">
              <span className="km-label">Materials</span>
              <input className="km-input" name="materials" defaultValue={product?.materials} />
            </label>

            <label className="km-field">
              <span className="km-label">Care</span>
              <input className="km-input" name="care" defaultValue={product?.care} />
            </label>
          </div>
        </section>

        <div className="km-form__side">
          <section className="km-panel">
            <h2 className="km-panel__title">Pricing</h2>
            <div className="km-form__fields">
              <label className="km-field">
                <span className="km-label">Cost (USD)</span>
                <input className="km-input" type="number" step="0.01" name="cost" defaultValue={product?.costUsd} />
              </label>
              <label className="km-field">
                <span className="km-label">Price (USD)</span>
                <input className="km-input" type="number" step="0.01" name="price" defaultValue={product?.priceUsd} required />
              </label>
              <label className="km-field km-field--full">
                <span className="km-label">Was (USD)</span>
                <input className="km-input" type="number" step="0.01" name="compareAt" defaultValue={product?.compareAtUsd ?? ""} />
                <span className="km-hint">Leave empty if the piece is not reduced. LBP is calculated from the rate in Settings.</span>
              </label>
            </div>
          </section>

          <section className="km-panel">
            <h2 className="km-panel__title">Visibility</h2>
            <div className="km-form__switches">
              {[
                { name: "visible", label: "Visible on the website", checked: product?.visible ?? true },
                { name: "isNew", label: "Show as New", checked: product?.isNew ?? false },
                { name: "isBestseller", label: "Show as Bestseller", checked: product?.isBestseller ?? false },
                { name: "isFeatured", label: "Feature on the homepage", checked: product?.isFeatured ?? false },
              ].map((s) => (
                <label key={s.name} className="km-switch">
                  <input type="checkbox" name={s.name} defaultChecked={s.checked} />
                  <span className="km-switch__track" aria-hidden="true"><span className="km-switch__thumb" /></span>
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="km-panel">
            <h2 className="km-panel__title">Search engines</h2>
            <div className="km-form__fields">
              <label className="km-field km-field--full">
                <span className="km-label">SEO title</span>
                <input className="km-input" name="seoTitle" defaultValue={product?.name} />
              </label>
              <label className="km-field km-field--full">
                <span className="km-label">SEO description</span>
                <textarea className="km-textarea" name="seoDescription" rows={3} defaultValue={product?.description.slice(0, 155)} />
              </label>
            </div>
          </section>
        </div>
      </div>

      {/* VARIANTS — stock is always per colour and size */}
      <section className="km-panel">
        <div className="km-panel__head">
          <h2 className="km-panel__title">Stock by colour and size</h2>
          <p className="km-panel__meta">
            {product ? `${product.variants.length} variants` : "Variants are created after the colours and sizes are set"}
          </p>
        </div>

        {product ? (
          <div className="km-tablewrap">
            <table className="km-table">
              <thead>
                <tr>
                  <th scope="col">SKU</th>
                  <th scope="col">Barcode</th>
                  <th scope="col">Colour</th>
                  <th scope="col">Size</th>
                  <th scope="col" className="km-table__num">In shop</th>
                  <th scope="col" className="km-table__num">Reserved</th>
                  <th scope="col" className="km-table__num">Available</th>
                  <th scope="col" className="km-table__num">Incoming</th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => {
                  const available = Math.max(0, v.stockOnHand - v.reserved);
                  return (
                    <tr key={v.id}>
                      <td><code>{v.sku}</code></td>
                      <td><code>{v.barcode}</code></td>
                      <td>{product.colors.find((c) => c.id === v.colorId)?.name}</td>
                      <td>{v.size}</td>
                      <td className="km-table__num">
                        <input className="km-input km-input--mini" type="number" defaultValue={v.stockOnHand} aria-label={`Stock for ${v.sku}`} />
                      </td>
                      <td className="km-table__num">{v.reserved}</td>
                      <td className="km-table__num">
                        <span className={available === 0 ? "km-pill km-pill--danger" : available <= v.lowStockThreshold ? "km-pill km-pill--warning" : "km-pill"}>
                          {available}
                        </span>
                      </td>
                      <td className="km-table__num">{v.incoming}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="km-panel__note">
            Save the product first, then colours and sizes generate the variant grid.
          </p>
        )}
      </section>

      <div className="km-form__actions">
        <button type="submit" className="km-btn">{isEdit ? "Save changes" : "Create product"}</button>
        {isEdit && (
          <>
            <button type="button" className="km-btn km-btn--outline">Duplicate</button>
            <button type="button" className="km-btn km-btn--outline">Archive</button>
          </>
        )}
      </div>
    </form>
  );
}
