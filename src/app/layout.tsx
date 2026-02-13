import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Javier Raut | Portfolio",
  description: "Backend and DevOps Enthusiast",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <NextLoader />
        <AnalyticsTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Header />
          <MainWrapper>{children}</MainWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
