import type { NextConfig } from "next";

// Extraemos el hostname del proyecto Supabase desde la variable de entorno
// para autorizar a Next.js a optimizar imágenes que vienen de Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

// =========================================================
// HEADERS DE SEGURIDAD
// Se aplican a todas las rutas. Endurecer aquí mejora la postura
// general contra XSS, clickjacking, MIME sniffing, etc.
// =========================================================

const securityHeaders = [
  {
    // Impide que tu sitio sea embebido en iframes ajenos (anti-clickjacking).
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Impide que el navegador adivine el MIME type (anti-tipo-confusion).
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Limita qué info de referrer se manda al navegar a otros sitios.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Desactiva APIs sensibles del navegador que la app NO usa.
    // Si en el futuro añadimos geolocation o webcam directa, ajustar aquí.
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
    ].join(", "),
  },
  {
    // HSTS — fuerza HTTPS en producción. Vercel ya lo añade, pero es seguro
    // declararlo explícitamente.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Content Security Policy — controla de dónde se pueden cargar recursos.
    // 'unsafe-inline' y 'unsafe-eval' son necesarios para Next.js sin nonces.
    // Se puede endurecer más adelante con un middleware que genere nonces.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: blob:${supabaseHost ? ` https://${supabaseHost}` : ""}`,
      `connect-src 'self'${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
      "media-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
