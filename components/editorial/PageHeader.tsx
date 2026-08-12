import Link from "next/link";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

/** Shared header for editorial and policy pages. */
export function PageHeader({
  title,
  lede,
  crumb,
  world = "neutral",
}: {
  title: string;
  lede?: string;
  crumb: string;
  world?: string;
}) {
  return (
    <header className="km-pagehead" data-world={world}>
      <div className="km-pagehead__wash" aria-hidden="true" />
      <div className="km-shell-wide km-pagehead__inner">
        <Reveal className="km-pagehead__text">
          <nav className="km-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{crumb}</span>
          </nav>
          <h1 className="km-page-type">
            <MaskLine>{title}</MaskLine>
          </h1>
          {lede && <p className="km-pagehead__copy">{lede}</p>}
        </Reveal>
      </div>
    </header>
  );
}
