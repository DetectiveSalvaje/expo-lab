import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Genera /sitemap.xml dinámico con páginas estáticas + perfiles + publicaciones.
 * Google y otros buscadores lo usan para indexar.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const supabase = await createClient();

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // Perfiles públicos
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
    url: `${siteUrl}/u/${p.username}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Publicaciones públicas
  const { data: photos } = await supabase
    .from("photos")
    .select("id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const photoPages: MetadataRoute.Sitemap = (photos ?? []).map((p) => ({
    url: `${siteUrl}/p/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...profilePages, ...photoPages];
}
