import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/space-mono/latin-400.css";
import "@fontsource/space-mono/latin-700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_PUBLISHER, SITE_TAGLINE, siteOrigin } from "@/lib/site";

const DEFAULT_TITLE = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  category: "technology",
  authors: [{ name: SITE_PUBLISHER }],
  creator: SITE_PUBLISHER,
  publisher: SITE_PUBLISHER,
  formatDetection: { telephone: false, address: false, email: false },
  // Fail closed: routes must opt in through the reviewed discovery metadata.
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true, noimageindex: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    url: siteOrigin,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#F1EDE7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
