import type { Metadata } from "next";

const DEFAULT_SITE_ORIGIN = "https://portfolio.jmraut.dev";

function getSiteOrigin() {
  const configuredOrigin = process.env.SITE_URL?.trim();

  try {
    return new URL(configuredOrigin || DEFAULT_SITE_ORIGIN);
  } catch {
    return new URL(DEFAULT_SITE_ORIGIN);
  }
}

export const siteConfig = {
  name: "Javier Raut",
  title: "Javier Raut | Software Engineer",
  description:
    "Software engineer building dependable products, data systems, infrastructure, and operational tools.",
  origin: getSiteOrigin(),
  locale: "en_US",
  email: "mailto:javier.raut@gmail.com",
  github: "https://github.com/KvassAndVodka",
  linkedin: "https://www.linkedin.com/in/raut-javier-m/",
} as const;

export const defaultSocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Javier Raut — Software Engineer",
} as const;

export function absoluteUrl(pathOrUrl: string) {
  return new URL(pathOrUrl, siteConfig.origin).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const socialImage = image
    ? { url: absoluteUrl(image), alt: `${title} preview` }
    : defaultSocialImage;
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    title,
    description,
    url: path,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [socialImage],
    ...(type === "article"
      ? { type, publishedTime, modifiedTime, authors: [siteConfig.name] }
      : { type }),
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
