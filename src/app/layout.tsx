import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "expo·lab — comunidad de fotógrafos",
    template: "%s · expo·lab",
  },
  description:
    "Una comunidad para fotógrafos. Sube tu trabajo, descubre el de otros y construye tu archivo visual.",
  metadataBase: new URL("https://expo-lab.vercel.app"),
  openGraph: {
    title: "expo·lab",
    description:
      "Una comunidad para fotógrafos. Sube tu trabajo, descubre el de otros y construye tu archivo visual.",
    type: "website",
    locale: "es_ES",
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
