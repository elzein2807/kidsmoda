"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useStore } from "@/components/shop/StoreProvider";
import { Icon } from "@/components/ui/Icon";
import { Figure } from "@/components/ui/Figure";
import { Price } from "@/components/shop/Price";
import type { PlateShape } from "@/types/catalog";

interface Hit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  gender: string;
  priceUsd: number;
  compareAtUsd: number | null;
  plate: PlateShape;
  availability: "in-stock" | "low-stock" | "sold-out";
}

const TRENDING = ["Linen set", "Denim jacket", "Polo", "Party dress", "Sneakers", "Pyjamas"];
const RECENT_KEY = "km-recent-searches";

/**
 * SEARCH — opens as a full-width panel that pushes down from the header.
 *
 * · Debounced at 220ms so a fast typist fires one request, not eight.
 * · In-flight requests are aborted when a newer keystroke arrives, so results
 *   can never arrive out of order.
 * · Empty, loading, results and no-results are all designed states.
 * · No-results offers real routes forward rather than a dead end.
 */
export function SearchOverlay() {
  const { searchOpen, closeSearch } = useStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [cats, setCats] = useState<{ label: string; href: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [recent, setRecent] = useState<string[]>([]);

  // Read once on mount. Lazy state init cannot be used here because
  // localStorage does not exist during server rendering.
  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
        if (Array.isArray(stored)) setRecent(stored as string[]);
      } catch {
        /* unreadable storage — recent searches just stay empty */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  // Debounced fetch. Everything that changes state happens inside the timeout,
  // never synchronously in the effect body.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;

    const t = window.setTimeout(async () => {
      setStatus("loading");
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setHits(data.products ?? []);
        setCats(data.categories ?? []);
        setTotal(data.total ?? 0);
        setStatus("done");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("error");
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [query]);

  // Below the minimum query length the panel is always in its idle state —
  // derived, not stored, so no effect has to reset it.
  const view = query.trim().length < 2 ? "idle" : status;

  const remember = useCallback((term: string) => {
    setRecent((prev) => {
      const next = [term, ...prev.filter((r) => r !== term)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const close = () => {
    setQuery("");
    setHits([]);
    setCats([]);
    setStatus("idle");
    closeSearch();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    remember(q);
    close();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            className="km-scrim"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="km-search"
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="km-search__inner km-shell-wide">
              <form className="km-search__form" onSubmit={submit} role="search">
                <Icon name="search" size={24} className="km-search__icon" />
                <label htmlFor="km-search-input" className="km-sr">Search products</label>
                <input
                  id="km-search-input"
                  ref={inputRef}
                  className="km-search__input"
                  type="search"
                  placeholder="What are you looking for?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                <button type="button" className="km-iconbtn" onClick={close} aria-label="Close search">
                  <Icon name="close" />
                </button>
              </form>

              <div className="km-search__results" aria-live="polite">
                {view === "idle" && (
                  <div className="km-search__cols">
                    {recent.length > 0 && (
                      <div>
                        <p className="km-eyebrow">Recent</p>
                        <ul className="km-search__terms">
                          {recent.map((r) => (
                            <li key={r}>
                              <button type="button" className="km-chip" onClick={() => setQuery(r)}>{r}</button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="km-eyebrow">Popular right now</p>
                      <ul className="km-search__terms">
                        {TRENDING.map((t) => (
                          <li key={t}>
                            <button type="button" className="km-chip" onClick={() => setQuery(t)}>{t}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="km-eyebrow">Go to</p>
                      <ul className="km-search__terms">
                        <li><Link href="/girls" className="km-chip" onClick={close}>Girls</Link></li>
                        <li><Link href="/boys" className="km-chip" onClick={close}>Boys</Link></li>
                        <li><Link href="/new-in" className="km-chip" onClick={close}>New In</Link></li>
                        <li><Link href="/sale" className="km-chip" onClick={close}>Sale</Link></li>
                      </ul>
                    </div>
                  </div>
                )}

                {view === "loading" && (
                  <div className="km-search__grid">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="km-search__hit">
                        <div className="km-skeleton" style={{ aspectRatio: "3 / 4" }} />
                        <div className="km-skeleton" style={{ height: 14, marginTop: 10, width: "70%" }} />
                        <div className="km-skeleton" style={{ height: 14, marginTop: 6, width: "40%" }} />
                      </div>
                    ))}
                  </div>
                )}

                {view === "error" && (
                  <p className="km-note km-note--error">
                    Search is not responding. Please try again, or message us on WhatsApp and we will find it for you.
                  </p>
                )}

                {view === "done" && hits.length === 0 && (
                  <div className="km-empty">
                    <h3 className="km-empty__title">Nothing matched “{query}”</h3>
                    <p className="km-empty__copy">
                      Try a simpler word — “dress”, “polo”, “shoes” — or browse by age.
                    </p>
                    <div className="km-empty__actions">
                      <Link href="/girls" className="km-btn km-btn--sm" onClick={close}>Shop Girls</Link>
                      <Link href="/boys" className="km-btn km-btn--sm" onClick={close}>Shop Boys</Link>
                      <Link href="/new-in" className="km-btn km-btn--outline km-btn--sm" onClick={close}>New In</Link>
                    </div>
                  </div>
                )}

                {view === "done" && hits.length > 0 && (
                  <>
                    {cats.length > 0 && (
                      <ul className="km-search__terms km-search__cats">
                        {cats.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="km-chip" onClick={close}>{c.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="km-search__grid">
                      {hits.map((h) => (
                        <Link
                          key={h.id}
                          href={`/product/${h.slug}`}
                          className="km-search__hit"
                          onClick={() => {
                            remember(query.trim());
                            closeSearch();
                          }}
                          data-world={h.gender}
                        >
                          <Figure seed={h.id} plate={h.plate} ratio="portrait" sizes="180px" alt="" />
                          <p className="km-search__hit-brand">{h.brand}</p>
                          <p className="km-search__hit-name">{h.name}</p>
                          <Price usd={h.priceUsd} compareAt={h.compareAtUsd} size="sm" />
                        </Link>
                      ))}
                    </div>
                    <button type="button" className="km-btn km-btn--outline km-search__all" onClick={submit}>
                      See all {total} results
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
