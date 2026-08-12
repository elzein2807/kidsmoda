"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Currency } from "@/types/catalog";

/**
 * STORE PROVIDER — the browser-side shopping state.
 *
 * Cart, wishlist, currency preference and recently-viewed all persist to
 * localStorage so a parent can close the tab and come back. No account is
 * required for any of it, which matches how Kids Moda sells today.
 *
 * Hydration: state starts empty on both server and client, then loads from
 * storage in an effect. That keeps the first render identical on both sides.
 */

interface State {
  lines: CartLine[];
  wishlist: string[];
  currency: Currency;
  ready: boolean;
}

type Action =
  | { type: "hydrate"; payload: Partial<State> }
  | { type: "add"; line: CartLine }
  | { type: "setQty"; key: string; qty: number }
  | { type: "remove"; key: string }
  | { type: "clear" }
  | { type: "toggleWish"; id: string }
  | { type: "currency"; currency: Currency };

const MAX_QTY = 10;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload, ready: true };

    case "add": {
      const existing = state.lines.find((l) => l.key === action.line.key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === action.line.key ? { ...l, qty: Math.min(MAX_QTY, l.qty + action.line.qty) } : l,
          ),
        };
      }
      return { ...state, lines: [...state.lines, action.line] };
    }

    case "setQty":
      if (action.qty <= 0) return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, qty: Math.min(MAX_QTY, action.qty) } : l,
        ),
      };

    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };

    case "clear":
      return { ...state, lines: [] };

    case "toggleWish":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.id)
          ? state.wishlist.filter((i) => i !== action.id)
          : [action.id, ...state.wishlist],
      };

    case "currency":
      return { ...state, currency: action.currency };
  }
}

const INITIAL: State = {
  lines: [],
  wishlist: [],
  currency: "USD",
  ready: false,
};

interface StoreValue extends State {
  count: number;
  subtotalUsd: number;
  addLine: (line: CartLine) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;
  setCurrency: (c: Currency) => void;

  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const KEY = "km-store-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Load once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<State>) : {};
      dispatch({
        type: "hydrate",
        payload: {
          lines: Array.isArray(parsed.lines) ? parsed.lines : [],
          wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
          currency: parsed.currency === "LBP" ? "LBP" : "USD",
        },
      });
    } catch {
      dispatch({ type: "hydrate", payload: {} });
    }
  }, []);

  // Persist on change (only after hydration, so we never overwrite with empties)
  useEffect(() => {
    if (!state.ready) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          lines: state.lines,
          wishlist: state.wishlist,
          currency: state.currency,
        }),
      );
    } catch {
      /* storage full or blocked — the session still works, it just won't persist */
    }
  }, [state]);

  // Body scroll lock whenever an overlay owns the screen
  useEffect(() => {
    const locked = cartOpen || searchOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, searchOpen]);

  /**
   * Every action is a stable reference. This matters: components call
   * markViewed() from an effect, and a function that changed identity on each
   * render would re-fire that effect forever.
   */
  const addLine = useCallback((line: CartLine) => {
    dispatch({ type: "add", line });
    setCartOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: "setQty", key, qty }), []);
  const removeLine = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);
  const toggleWish = useCallback((id: string) => dispatch({ type: "toggleWish", id }), []);
  const setCurrency = useCallback((currency: Currency) => dispatch({ type: "currency", currency }), []);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const value = useMemo<StoreValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const subtotalUsd = state.lines.reduce((n, l) => n + l.unitUsd * l.qty, 0);
    return {
      ...state,
      count,
      subtotalUsd,
      addLine,
      setQty,
      removeLine,
      clearCart,
      toggleWish,
      isWished: (id) => state.wishlist.includes(id),
      setCurrency,
      cartOpen,
      openCart,
      closeCart,
      searchOpen,
      openSearch,
      closeSearch,
    };
  }, [
    state, cartOpen, searchOpen, addLine, setQty, removeLine, clearCart,
    toggleWish, setCurrency, openCart, closeCart, openSearch, closeSearch,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
