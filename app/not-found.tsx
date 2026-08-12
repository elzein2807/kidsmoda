import Link from "next/link";
import { Ribbon } from "@/components/motion/Ribbon";
import { Icon } from "@/components/ui/Icon";
import { Reveal, MaskLine } from "@/components/motion/Reveal";

/** 404 — a wrong turn, not a failure. Always offers a way back into the shop. */
export default function NotFound() {
  return (
    <div className="km-shell km-section km-notfound" data-world="girls">
      <div className="km-notfound__ribbon" aria-hidden="true">
        <Ribbon variant="arc" width={9} opacity={0.55} />
      </div>

      <Reveal>
        <p className="km-eyebrow">404</p>
        <h1 className="km-hero-type km-notfound__title">
          <MaskLine>Not on the rail.</MaskLine>
        </h1>
        <p className="km-lede km-notfound__copy">
          That page has moved or never existed. The clothes are still here though.
        </p>
        <div className="km-notfound__actions">
          <Link href="/girls" className="km-btn">Shop Girls <Icon name="arrow-right" size={18} /></Link>
          <Link href="/boys" className="km-btn">Shop Boys <Icon name="arrow-right" size={18} /></Link>
          <Link href="/new-in" className="km-btn km-btn--outline">New in</Link>
          <Link href="/" className="km-btn km-btn--ghost">Home</Link>
        </div>
      </Reveal>
    </div>
  );
}
