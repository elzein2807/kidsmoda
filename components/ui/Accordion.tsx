"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * ACCORDION — native details semantics without the browser's default arrow.
 * Height animates via grid-template-rows, which is smooth and needs no
 * measurement, and collapses instantly under reduced motion.
 */
export function Accordion({
  items,
}: {
  items: { id: string; title: string; content: string; open?: boolean }[];
}) {
  const [open, setOpen] = useState<string[]>(items.filter((i) => i.open).map((i) => i.id));

  const toggle = (id: string) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  return (
    <div className="km-accordion">
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <section key={item.id} className="km-accordion__item">
            <h3 className="km-accordion__heading">
              <button
                type="button"
                className="km-accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={`km-acc-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <Icon name={isOpen ? "minus" : "plus"} size={16} />
              </button>
            </h3>
            <div id={`km-acc-${item.id}`} className="km-accordion__panel" data-open={isOpen}>
              <div className="km-accordion__inner">
                {item.content.split("\n").map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
