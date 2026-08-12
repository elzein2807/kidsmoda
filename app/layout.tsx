import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";

import "@/styles/globals.css";
import { SITE, STORE } from "@/lib/config";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { Opening } from "@/components/motion/Opening";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppDock } from "@/components/layout/WhatsAppDock";
import { StoreProvider } from "@/components/shop/StoreProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SearchOverlay } from "@/components/shop/SearchOverlay";

/**
 * DISPLAY — Fraunces. Variable optical size lets headlines set tight and
 * expressive while small display text stays readable. `SOFT` is nudged up a
 * little for warmth; `WONK` stays off so the letterforms never turn cute.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

/** INTERFACE — Inter. Tabular numerals carry every price and dashboard figure. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "kids fashion Lebanon",
    "children clothing Beirut",
    "boys clothes Lebanon",
    "girls clothes Lebanon",
    "Hadath kids store",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: SITE.locale,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FBF7F0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Runs before first paint so the homepage never flashes behind the opening.
 * Chooses the right variant for the visitor: full, short (slow device or
 * slow network), reduced (prefers-reduced-motion), or none (already seen it
 * this session).
 */
const INTRO_SCRIPT = `
(function(){
  try {
    if (sessionStorage.getItem('km-intro-seen')) return;
    var d = document.documentElement;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { d.setAttribute('data-intro','reduced'); return; }
    var c = navigator.connection || {};
    var slow = (navigator.hardwareConcurrency || 8) <= 4 ||
               /(^|-)(2g|slow-2g)$/.test(c.effectiveType || '') || c.saveData === true;
    d.setAttribute('data-intro', slow ? 'short' : 'full');
  } catch (e) { /* never block the page on the intro */ }
})();
`;

/** Organization + LocalBusiness — Kids Moda is a physical shop in Hadath. */
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: `+${STORE.whatsapp}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE.street,
    addressLocality: STORE.district,
    addressRegion: STORE.city,
    addressCountry: "LB",
  },
  openingHours: ["Mo-Sa 09:30-19:30"],
  currenciesAccepted: "USD, LBP",
  paymentAccepted: "Cash on Delivery",
  sameAs: [STORE.instagramUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the pre-paint script below stamps data-intro on
    // <html> before React hydrates, which is the whole point of it.
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body>
        <StoreProvider>
          <a href="#km-main" className="km-skip">
            Skip to content
          </a>

          <MotionRoot />
          <Opening />

          <Header />
          <main id="km-main" tabIndex={-1}>
            {children}
          </main>
          <Footer />

          <WhatsAppDock />
          <CartDrawer />
          <SearchOverlay />
        </StoreProvider>

        <Script
          id="km-org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </body>
    </html>
  );
}
