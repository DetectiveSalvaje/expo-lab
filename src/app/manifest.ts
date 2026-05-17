import type { MetadataRoute } from "next";

/**
 * Web App Manifest — convierte el sitio en una PWA instalable.
 * Next.js sirve este archivo en /manifest.webmanifest y agrega
 * automáticamente <link rel="manifest"> al <head>.
 *
 * Usuarios desde Safari (iOS) o Chrome (Android) verán la opción
 * "Agregar a pantalla de inicio" y la app abre en modo standalone
 * (sin barra del navegador, splash con el icono, etc).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "expo·lab — comunidad de fotógrafos",
    short_name: "expo·lab",
    description:
      "Una comunidad para fotógrafos. Sube tu trabajo, descubre el de otros y construye tu archivo visual.",
    start_url: "/feed",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0e0e",
    theme_color: "#0e0e0e",
    lang: "es",
    dir: "ltr",
    categories: ["photo", "social", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
