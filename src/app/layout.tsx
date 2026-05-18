import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Montserrat Black (900) — usada solo para titulares grandes
const montserratDisplay = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["900"],
});

const siteUrl = getSiteUrl();

// ⚠️ En Next.js 15+ themeColor, viewport, colorScheme van en su propio export.
export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "expo·lab — comunidad de fotógrafos",
    template: "%s · expo·lab",
  },
  description:
    "Una comunidad para fotógrafos. Sube tu trabajo, descubre el de otros y construye tu archivo visual.",
  applicationName: "expo·lab",
  keywords: [
    "fotografía",
    "comunidad",
    "fotógrafos",
    "análogo",
    "digital",
    "portfolio",
  ],
  authors: [{ name: "expo·lab" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: "expo·lab",
    title: "expo·lab — comunidad de fotógrafos",
    description:
      "Una comunidad para fotógrafos. Sube tu trabajo, descubre el de otros y construye tu archivo visual.",
  },
  twitter: {
    card: "summary_large_image",
    title: "expo·lab — comunidad de fotógrafos",
    description:
      "Una comunidad para fotógrafos. Sube tu trabajo, descubre el de otros y construye tu archivo visual.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // PWA — configuración específica de Apple (Android usa el manifest)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "expo·lab",
  },
  // Evita que iOS detecte teléfonos/direcciones automáticamente
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${montserratDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
