import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Header from "@/components/Header";
import { absoluteUrl, defaultSocialImage, serializeJsonLd, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: siteConfig.origin,
  title: {
    default: siteConfig.title,
    template: "%s | Javier Raut",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.origin }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "Javier Raut",
    "software engineer",
    "full-stack developer",
    "data systems",
    "infrastructure",
    "Philippines",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [defaultSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [defaultSocialImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import AnalyticsTracker from "@/components/AnalyticsTracker";

import MainWrapper from "@/components/MainWrapper";
import MotionProvider from "@/components/MotionProvider";
import NextLoader from "@/components/NextLoader";
import ScrollProgress from "@/components/ScrollProgress";

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: siteConfig.name,
      url: siteConfig.origin.toString(),
      image: absoluteUrl("/IMG_20260730_122436.jpg"),
      email: siteConfig.email,
      jobTitle: "Software Engineer",
      sameAs: [siteConfig.github, siteConfig.linkedin],
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "University of Science and Technology of Southern Philippines",
      },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: siteConfig.origin.toString(),
      name: `${siteConfig.name} — Software Engineer`,
      description: siteConfig.description,
      inLanguage: "en",
      creator: { "@id": absoluteUrl("/#person") },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(globalJsonLd) }}
        />
        <noscript>
          <style>{`.project-card { opacity: 1 !important; transform: none !important; clip-path: none !important; }`}</style>
        </noscript>
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-50 -translate-y-24 rounded-[0.75rem] bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-[var(--background)] focus:translate-y-0"
        >
          Skip to content
        </a>
        <NextLoader />
        <AnalyticsTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <MotionProvider>
            <ScrollProgress />
            <Header />
            <MainWrapper>{children}</MainWrapper>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
