"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { whatsapp } from "@/lib/whatsapp";

/**
 * WHATSAPP DOCK — a considered piece of the interface, not a bolted-on bubble.
 *
 * It stays out of the way until the visitor has actually started reading
 * (past the hero), and hides itself on checkout, where a floating control
 * would compete with the sticky pay button and on mobile could cover a field.
 */
export function WhatsAppDock() {
  const pathname = usePathname();
  // Appears once the visitor has actually started reading, not immediately.
  const visible = useScrolledPast(520);

  const hidden = pathname?.startsWith("/checkout") || pathname?.startsWith("/admin");
  if (hidden) return null;

  return (
    <a
      href={whatsapp.general()}
      target="_blank"
      rel="noopener noreferrer"
      className="km-wa-dock"
      data-hidden={!visible}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <Icon name="whatsapp" size={20} />
      <span className="km-wa-dock__label">Ask us on WhatsApp</span>
    </a>
  );
}
