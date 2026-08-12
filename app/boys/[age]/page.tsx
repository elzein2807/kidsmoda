import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldPage } from "@/components/shop/WorldPage";
import { AGE_GROUPS, ageGroupById } from "@/lib/config";

const LABEL = "Boys";

export function generateStaticParams() {
  return AGE_GROUPS.map((a) => ({ age: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ age: string }>;
}): Promise<Metadata> {
  const { age } = await params;
  const group = ageGroupById(age);
  if (!group) return { title: LABEL };
  return {
    title: `${LABEL} ${group.label}`,
    description: `${LABEL} clothing for ${group.label.toLowerCase()} at Kids Moda, Hadath. Sizes ${group.sizes.join(", ")}. Delivery all over Lebanon.`,
    alternates: { canonical: `/boys/${age}` },
  };
}

export default async function AgePage({
  params,
  searchParams,
}: {
  params: Promise<{ age: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { age } = await params;
  if (!ageGroupById(age)) notFound();
  return <WorldPage gender="boys" age={age} searchParams={await searchParams} />;
}
