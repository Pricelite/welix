import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const routes = [
    "",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/reinitialiser-mot-de-passe",
  ];

  return routes.map((route) => ({
    changeFrequency: route === "" ? "weekly" : "monthly",
    lastModified: new Date(),
    priority: route === "" ? 1 : 0.6,
    url: `${baseUrl}${route}`,
  }));
}
