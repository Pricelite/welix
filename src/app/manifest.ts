import type { MetadataRoute } from "next";
import { getSiteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const name = getSiteName();

  return {
    name,
    short_name: name,
    description: "CRM premium pour artisans avec devis, clients, facturation et pilotage commercial.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f6fb",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    scope: "/",
  };
}
