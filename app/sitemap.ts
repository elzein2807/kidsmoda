import type { MetadataRoute } from "next";
import { SITE, AGE_GROUPS } from "@/lib/config";
import { getAllProductSlugs } from "@/lib/commerce/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await getAllProductSlugs();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/girls", priority: 0.9 },
    { path: "/boys", priority: 0.9 },
    { path: "/new-in", priority: 0.8 },
    { path: "/sale", priority: 0.8 },
    { path: "/our-store", priority: 0.7 },
    { path: "/size-guide", priority: 0.6 },
    { path: "/delivery", priority: 0.6 },
    { path: "/returns", priority: 0.6 },
    { path: "/faq", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
  ];

  const ageRoutes = (["girls", "boys"] as const).flatMap((g) =>
    AGE_GROUPS.map((a) => ({ path: `/${g}/${a.id}`, priority: 0.7 })),
  );

  return [
    ...staticRoutes,
    ...ageRoutes,
    ...slugs.map((slug) => ({ path: `/product/${slug}`, priority: 0.7 })),
  ].map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: r.priority,
  }));
}
