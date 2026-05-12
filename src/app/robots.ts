import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Genera /robots.txt.
 * Permite indexar todo el contenido público, bloquea rutas de auth/settings.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/register",
          "/verify-email",
          "/settings/",
          "/upload",
          "/saved",
          "/auth/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
