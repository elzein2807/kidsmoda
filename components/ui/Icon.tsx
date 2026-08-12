/**
 * ICON SET — one visual language: 24px grid, 1.5px stroke, round caps and
 * joins, no fills. Drawn slightly geometric to sit against Fraunces without
 * looking technical.
 */

type IconName =
  | "search" | "heart" | "heart-filled" | "bag" | "menu" | "close" | "chevron-down"
  | "chevron-right" | "chevron-left" | "arrow-right" | "arrow-up-right" | "whatsapp"
  | "instagram" | "pin" | "phone" | "truck" | "cash" | "exchange" | "check"
  | "plus" | "minus" | "filter" | "grid" | "play" | "zoom" | "star" | "ruler"
  | "alert" | "print" | "trash" | "edit" | "download" | "upload" | "barcode";

const PATHS: Record<IconName, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  heart: <path d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3C19.5 15.3 12 20 12 20Z" />,
  "heart-filled": (
    <path
      d="M12 20s-7.5-4.7-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3C19.5 15.3 12 20 12 20Z"
      fill="currentColor"
    />
  ),
  bag: <><path d="M4.5 7.5h15l-1.2 12.2a1 1 0 0 1-1 .8H6.7a1 1 0 0 1-1-.8Z" /><path d="M8.75 10V6.75a3.25 3.25 0 0 1 6.5 0V10" /></>,
  menu: <><path d="M3.5 7h17" /><path d="M3.5 12h17" /><path d="M3.5 17h11" /></>,
  close: <><path d="m5.5 5.5 13 13" /><path d="m18.5 5.5-13 13" /></>,
  "chevron-down": <path d="m5.5 9 6.5 6 6.5-6" />,
  "chevron-right": <path d="m9 5.5 6 6.5-6 6.5" />,
  "chevron-left": <path d="m15 5.5-6 6.5 6 6.5" />,
  "arrow-right": <><path d="M4 12h15.5" /><path d="m13.5 6 6 6-6 6" /></>,
  "arrow-up-right": <><path d="M7 17 17 7" /><path d="M8.5 7H17v8.5" /></>,
  whatsapp: (
    <path d="M20 11.6a8 8 0 0 1-11.9 7L4 20l1.5-4a8 8 0 1 1 14.5-4.4Z M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1.2-.5 1.2-1l-1.6-.8-.9.9a5 5 0 0 1-2.3-2.3l.9-.9L11 9.3c-.5 0-1 .6-1 1.2Z" />
  ),
  instagram: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.7" cy="7.3" r="1" fill="currentColor" stroke="none" /></>,
  pin: <><path d="M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  phone: <path d="M6.5 4h3l1.5 4-2 1.4a10 10 0 0 0 5.6 5.6l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />,
  truck: <><path d="M3.5 7.5h10v9h-10z" /><path d="M13.5 11h4l3 3v2.5h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>,
  cash: <><rect x="3" y="6.5" width="18" height="11" rx="2" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 10v4M17.5 10v4" /></>,
  exchange: <><path d="M4 8.5h13l-3-3" /><path d="M20 15.5H7l3 3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  plus: <><path d="M12 5.5v13" /><path d="M5.5 12h13" /></>,
  minus: <path d="M5.5 12h13" />,
  filter: <><path d="M4 7h16" /><path d="M7 12h10" /><path d="M10 17h4" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></>,
  play: <path d="M9 6.5 18 12l-9 5.5z" fill="currentColor" stroke="none" />,
  zoom: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5M8.5 11h5M11 8.5v5" /></>,
  star: <path d="m12 4.5 2.3 4.9 5.2.7-3.8 3.7 1 5.2-4.7-2.6-4.7 2.6 1-5.2L4.5 10l5.2-.7z" />,
  ruler: <><rect x="3" y="8" width="18" height="8" rx="1.5" /><path d="M7.5 8v3M12 8v4M16.5 8v3" /></>,
  alert: <><path d="M12 4.5 21 19.5H3z" /><path d="M12 10v4M12 16.6v.4" /></>,
  print: <><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="7" rx="1.5" /><path d="M7 16h10v4H7z" /></>,
  trash: <><path d="M4.5 7h15" /><path d="M9.5 7V4.5h5V7" /><path d="M6.5 7 7.6 20h8.8L17.5 7" /></>,
  edit: <><path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5z" /><path d="m14.5 6.5 3 3" /></>,
  download: <><path d="M12 4v11" /><path d="m7.5 11 4.5 4.5L16.5 11" /><path d="M4.5 19.5h15" /></>,
  upload: <><path d="M12 15.5v-11" /><path d="m7.5 8.5 4.5-4 4.5 4" /><path d="M4.5 19.5h15" /></>,
  barcode: <><path d="M4 6v12M7 6v12M10 6v9M13 6v12M16 6v9M20 6v12" /></>,
};

export function Icon({
  name,
  size = 22,
  className,
  strokeWidth = 1.5,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
