import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard, checkout and a customer's own order must never be indexed
      disallow: ["/admin", "/admin/", "/checkout", "/order/", "/api/", "/search"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
