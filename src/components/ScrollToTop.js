import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Resets the scroll position to the top of the page whenever the route changes.
// Without this, navigating from a long category page into a product keeps the
// window scrolled to wherever the click happened — a jarring UX bug.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}
