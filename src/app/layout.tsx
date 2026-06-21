import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { getDefaultOgImage, getSiteName, getSiteUrl, isIndexableEnvironment } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${getSiteName()} | CRM premium pour artisans`,
    template: `%s | ${getSiteName()}`,
  },
  description:
    "Welix aide les artisans à gérer clients, devis, facturation et abonnement dans une interface premium prête pour la production.",
  applicationName: getSiteName(),
  keywords: ["CRM artisan", "devis artisan", "facturation artisan", "Supabase", "Stripe", "Welix"],
  authors: [{ name: "Welix" }],
  category: "business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: getSiteName(),
    title: `${getSiteName()} | CRM premium pour artisans`,
    description:
      "Un SaaS premium pour centraliser les clients, générer des devis et piloter l'activité artisanale.",
    url: getSiteUrl(),
    images: [
      {
        url: getDefaultOgImage(),
        width: 1200,
        height: 630,
        alt: "Aperçu de Welix",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${getSiteName()} | CRM premium pour artisans`,
    description:
      "Centralise les clients, les devis, la facturation et le pilotage commercial dans un CRM premium.",
    images: [getDefaultOgImage()],
  },
  robots: isIndexableEnvironment()
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
      },
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={manrope.variable}>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
