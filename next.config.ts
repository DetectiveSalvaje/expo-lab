import type { NextConfig } from "next";

// Extraemos el hostname del proyecto Supabase desde la variable de entorno
// para autorizar a Next.js a optimizar imágenes que vienen de Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const nextConfig: NextConfig = {
  // Subimos el límite de Server Actions para permitir fotos hasta 10 MB.
  // Default de Next.js: 1 MB.
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
};

export default nextConfig;
