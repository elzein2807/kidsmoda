import type { Metadata } from "next";
import { WorldPage } from "@/components/shop/WorldPage";

export const metadata: Metadata = {
  title: "Boys — 0 to 14 years",
  description:
    "Boys clothing at Kids Moda, Hadath. Polos, denim, hoodies and shoes from 0 to 14 years. Delivery all over Lebanon, cash on delivery.",
  alternates: { canonical: "/boys" },
};

export default async function BoysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <WorldPage gender="boys" searchParams={await searchParams} />;
}
