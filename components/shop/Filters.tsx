"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import type { CatalogFacets, SortKey } from "@/types/catalog";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

/**
 * FILTERS
 *
 * All filter state is written to the URL, so a filtered view is shareable and
 * the back button behaves. Desktop gets a persistent left rail; mobile gets a
 * bottom sheet with the result count on the apply button, because on a phone
 * you want to know what you are about to get before you close the sheet.
 */

const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  bestselling: "Best selling",
};

interface FiltersProps {
  facets: CatalogFacets;
  total: number;
  /** Ages are hidden on an age landing page — the route already fixes them */
  hideAges?: boolean;
  hideCategories?: boolean;
}

export function Filters({ facets, total, hideAges = false, hideCategories = false }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const current = useCallback((key: string) => params.getAll(key), [params]);

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      const existing = next.getAll(key);
      next.delete(key);
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      updated.forEach((v) => next.append(key, v));
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const setSingle = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null) next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const hasFilters = ["category", "age", "size", "color", "brand", "sale", "new", "instock", "min", "max"].some(
    (k) => params.has(k),
  );

  const body = (
    <>
      {!hideCategories && facets.categories.length > 0 && (
        <FilterGroup title="Category">
          <ul className="km-filter__list">
            {facets.categories.map((c) => (
              <li key={c.slug}>
                <Checkbox
                  label={c.name}
                  count={c.count}
                  checked={current("category").includes(c.slug)}
                  onChange={() => toggle("category", c.slug)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      {!hideAges && facets.ages.length > 0 && (
        <FilterGroup title="Age">
          <ul className="km-filter__list">
            {facets.ages.map((a) => (
              <li key={a.id}>
                <Checkbox
                  label={a.label}
                  count={a.count}
                  checked={current("age").includes(a.id)}
                  onChange={() => toggle("age", a.id)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      {facets.sizes.length > 0 && (
        <FilterGroup title="Size">
          <div className="km-filter__chips">
            {facets.sizes.map((s) => (
              <button
                key={s.size}
                type="button"
                className="km-chip km-chip--sm"
                aria-pressed={current("size").includes(s.size)}
                onClick={() => toggle("size", s.size)}
              >
                {s.size}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Colour">
          <div className="km-filter__colors">
            {facets.colors.map((c) => {
              const on = current("color").includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="km-filter__color"
                  aria-pressed={on}
                  onClick={() => toggle("color", c.id)}
                >
                  <span className="km-swatch km-swatch--lg" style={{ background: c.hex }} data-selected={on} />
                  <span className="km-filter__color-name">{c.name}</span>
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      {facets.brands.length > 1 && (
        <FilterGroup title="Brand">
          <ul className="km-filter__list">
            {facets.brands.map((b) => (
              <li key={b.name}>
                <Checkbox
                  label={b.name}
                  count={b.count}
                  checked={current("brand").includes(b.name)}
                  onChange={() => toggle("brand", b.name)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <div className="km-filter__price">
          <label className="km-sr" htmlFor="km-min">Minimum price in dollars</label>
          <input
            id="km-min"
            className="km-input"
            type="number"
            inputMode="numeric"
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            placeholder={`$${facets.priceRange.min}`}
            defaultValue={params.get("min") ?? ""}
            onBlur={(e) => setSingle("min", e.target.value || null)}
          />
          <span aria-hidden="true">—</span>
          <label className="km-sr" htmlFor="km-max">Maximum price in dollars</label>
          <input
            id="km-max"
            className="km-input"
            type="number"
            inputMode="numeric"
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            placeholder={`$${facets.priceRange.max}`}
            defaultValue={params.get("max") ?? ""}
            onBlur={(e) => setSingle("max", e.target.value || null)}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Show">
        <ul className="km-filter__list">
          <li>
            <Checkbox label="New in" checked={params.get("new") === "1"} onChange={() => setSingle("new", params.get("new") === "1" ? null : "1")} />
          </li>
          <li>
            <Checkbox label="On sale" checked={params.get("sale") === "1"} onChange={() => setSingle("sale", params.get("sale") === "1" ? null : "1")} />
          </li>
          <li>
            <Checkbox label="In stock only" checked={params.get("instock") === "1"} onChange={() => setSingle("instock", params.get("instock") === "1" ? null : "1")} />
          </li>
        </ul>
      </FilterGroup>
    </>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="km-filters" aria-label="Filters">
        <div className="km-filters__head">
          <h2 className="km-filters__title">Filter</h2>
          {hasFilters && (
            <button type="button" className="km-link km-link--static km-filters__clear" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
        {body}
      </aside>

      {/* Mobile / tablet trigger bar */}
      <div className="km-filterbar">
        <button type="button" className="km-btn km-btn--outline km-btn--sm" onClick={() => setSheetOpen(true)}>
          <Icon name="filter" size={16} />
          Filter {hasFilters && <span className="km-filterbar__dot" aria-hidden="true" />}
        </button>
        <SortSelect />
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="km-scrim"
              onClick={() => setSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="km-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="km-drawer__head">
                <h2 className="km-drawer__title">Filter</h2>
                <button type="button" className="km-iconbtn" onClick={() => setSheetOpen(false)} aria-label="Close filters">
                  <Icon name="close" />
                </button>
              </div>
              <div className="km-drawer__body">{body}</div>
              <div className="km-drawer__foot km-sheet__foot">
                {hasFilters && (
                  <button type="button" className="km-btn km-btn--outline" onClick={clearAll}>
                    Clear
                  </button>
                )}
                <button type="button" className="km-btn km-btn--block" onClick={() => setSheetOpen(false)}>
                  Show {total} {total === 1 ? "item" : "items"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = `km-filter-${title.toLowerCase()}`;
  return (
    <section className="km-filter">
      <h3>
        <button
          type="button"
          className="km-filter__toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
        >
          {title}
          <Icon name="chevron-down" size={16} className={cx("km-filter__chev", open && "is-open")} />
        </button>
      </h3>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </section>
  );
}

function Checkbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="km-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="km-check__box" aria-hidden="true">
        <Icon name="check" size={13} strokeWidth={2.4} />
      </span>
      <span className="km-check__label">{label}</span>
      {count !== undefined && <span className="km-check__count">{count}</span>}
    </label>
  );
}

/** SORT — a native select. Faster on mobile than any custom dropdown. */
export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = (params.get("sort") as SortKey) ?? "recommended";

  return (
    <div className="km-sort">
      <label htmlFor="km-sort" className="km-sort__label">Sort</label>
      <select
        id="km-sort"
        className="km-select km-sort__select"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", e.target.value);
          next.delete("page");
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      >
        {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {SORT_LABELS[k]}
          </option>
        ))}
      </select>
    </div>
  );
}

/** ACTIVE FILTER CHIPS — always visible above the grid. */
export function ActiveChips({ filters }: { filters: { key: string; value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (filters.length === 0) return null;

  const remove = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (key === "price") {
      next.delete("min");
      next.delete("max");
    } else {
      const rest = next.getAll(key).filter((v) => v !== value);
      next.delete(key);
      rest.forEach((v) => next.append(key, v));
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <ul className="km-activechips" aria-label="Active filters">
      {filters.map((f) => (
        <li key={`${f.key}-${f.value}`}>
          <button type="button" className="km-chip km-chip--active" onClick={() => remove(f.key, f.value)}>
            {f.label}
            <Icon name="close" size={13} />
            <span className="km-sr">Remove filter</span>
          </button>
        </li>
      ))}
      <li>
        <button type="button" className="km-link km-link--static km-activechips__clear" onClick={() => router.push(pathname, { scroll: false })}>
          Clear all
        </button>
      </li>
    </ul>
  );
}
