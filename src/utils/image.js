// Centralized image URL resolution.
// Images may arrive in 3 shapes:
//   1. Absolute URL (http/https) — Cloudinary or external hosting
//   2. Data URI (data:image/jpeg;base64,...) — current production approach
//   3. Relative "/uploads/..." path — legacy local dev
// Anything missing falls back to a themed placeholder.

const API = process.env.REACT_APP_API || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

export function resolveImage(src, label = '', size = '480x600') {
  if (!src) return `https://placehold.co/${size}/eee/999?text=${encodeURIComponent(label || 'No Image')}&font=montserrat`;
  if (src.startsWith('http') || src.startsWith('data:')) return src;
  return `${API}${src}`;
}

export { API };
