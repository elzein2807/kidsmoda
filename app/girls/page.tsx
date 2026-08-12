import type { Metadata } from "next";
import { WorldPage } from "@/components/shop/WorldPage";

export const metadata: Metadata = {
  title: "Girls — 0 to 14 years",
  description:
    "Girls clothing at Kids Moda, Hadath. Dresses, sets, knitwear and shoes from 0 to 14 years. Delivery all over Lebanon, cash on delivery.",
  alternates: { canonical: "/girls" },
};

export default async function GirlsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <WorldPage gender="girls" searchParams={await searchParams} />;
}
