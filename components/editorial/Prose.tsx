import { Reveal } from "@/components/motion/Reveal";

/**
 * PROSE — the reading surface for policy and information pages.
 * Line length is capped by the token measure so long text stays readable.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <div className="km-prose km-measure">{children}</div>
    </Reveal>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <dl className="km-faq">
        {items.map((item) => (
          <div key={item.q} className="km-faq__item">
            <dt className="km-faq__q">{item.q}</dt>
            <dd className="km-faq__a">{item.a}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
