import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "Javier Raut | Software Engineer",
    template: "%s | Javier Raut",
  },
  description:
    "Backend and infrastructure engineer building dependable software, self-hosted systems, and applied AI projects.",
};

import AnalyticsTracker from "@/components/AnalyticsTracker";

import MainWrapper from "@/components/MainWrapper";
import NextLoader from "@/components/NextLoader";

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
          <Header />
          <MainWrapper>{children}</MainWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
