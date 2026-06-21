import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexableEnvironment } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const production = isIndexableEnvironment();

  return {
    rules: production
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/", "/dashboard", "/clients", "/devis", "/factures", "/notifications", "/parametres", "/profil"],
        }
      : {
          userAgent: "*",
          disallow: "/",
        },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  };
}
