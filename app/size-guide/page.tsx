import type { Metadata } from "next";
import { AGE_GROUPS } from "@/lib/config";
import { PageHeader } from "@/components/editorial/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/ui/Icon";
import { whatsapp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Kids Moda size guide — age, height and chest measurements from 0 to 14 years.",
  alternates: { canonical: "/size-guide" },
};

/** Height and chest in cm, the two measurements that actually decide a fit. */
const SIZES: Record<string, { size: string; height: string; chest: string }[]> = {
  "0-2": [
    { size: "3M", height: "56 – 62", chest: "42" },
    { size: "6M", height: "62 – 68", chest: "44" },
    { size: "9M", height: "68 – 74", chest: "46" },
    { size: "12M", height: "74 – 80", chest: "48" },
    { size: "18M", height: "80 – 86", chest: "50" },
    { size: "24M", height: "86 – 92", chest: "52" },
  ],
  "2-5": [
    { size: "2Y", height: "88 – 94", chest: "53" },
    { size: "3Y", height: "94 – 100", chest: "55" },
    { size: "4Y", height: "100 – 106", chest: "57" },
    { size: "5Y", height: "106 – 112", chest: "59" },
  ],
  "6-9": [
    { size: "6Y", height: "112 – 118", chest: "61" },
    { size: "7Y", height: "118 – 124", chest: "64" },
    { size: "8Y", height: "124 – 130", chest: "67" },
    { size: "9Y", height: "130 – 136", chest: "70" },
  ],
  "10-14": [
    { size: "10Y", height: "136 – 142", chest: "73" },
    { size: "11Y", height: "142 – 148", chest: "76" },
    { size: "12Y", height: "148 – 154", chest: "79" },
    { size: "13Y", height: "154 – 160", chest: "82" },
    { size: "14Y", height: "160 – 166", chest: "85" },
  ],
};

export default function SizeGuidePage() {
  return (
    <div data-world="boys">
      <PageHeader
        title="Find their size"
        crumb="Size Guide"
        world="boys"
        lede="Measure height first — it is more reliable than age. If they are between two sizes, take the larger one."
      />

      <div className="km-shell km-section-tight km-guide">
        {AGE_GROUPS.map((group) => (
          <Reveal key={group.id} className="km-guide__block">
            <h2 className="km-guide__title" data-age={group.id}>{group.label}</h2>
            <div className="km-tablewrap">
              <table className="km-table">
                <thead>
                  <tr>
                    <th scope="col">Size</th>
                    <th scope="col">Height (cm)</th>
                    <th scope="col">Chest (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES[group.id]?.map((row) => (
                    <tr key={row.size}>
                      <th scope="row">{row.size}</th>
                      <td>{row.height}</td>
                      <td>{row.chest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        ))}

        <Reveal className="km-guide__help">
          <h2 className="km-guide__title">How to measure</h2>
          <ol className="km-guide__steps">
            <li><strong>Height.</strong> Stand them against a wall without shoes and mark the top of the head.</li>
            <li><strong>Chest.</strong> Measure around the fullest part, under the arms, with the tape flat but not tight.</li>
            <li><strong>Still unsure?</strong> Send us the height on WhatsApp and we will tell you which size to take.</li>
          </ol>
          <a href={whatsapp.general()} target="_blank" rel="noopener noreferrer" className="km-btn">
            <Icon name="whatsapp" size={18} />
            Ask about a size
          </a>
        </Reveal>
      </div>
    </div>
  );
}
