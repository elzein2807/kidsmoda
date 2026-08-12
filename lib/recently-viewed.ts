/**
 * RECENTLY VIEWED — kept in localStorage rather than React state.
 *
 * Recording a view is a write to an external system, not application state:
 * nothing in the current render depends on it. Keeping it out of the store
 * means viewing a product does not re-render the header, the cart or anything
 * else on the page.
 */

const KEY = "km-recently-viewed";
const MAX = 8;

export function recordView(id: string): void {
  try {
    const next = [id, ...read().filter((i) => i !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode — recently viewed simply does not persist */
  }
}

export function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}
