import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_PUBLISHER, absoluteUrl } from "@/lib/site";
import { assertDiscoveryManifest } from "./eligibility";
import { getDiscoveryEffect, getDiscoveryPage } from "./manifest";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  noFollow?: boolean;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
}

function robotsFor(noIndex: boolean, noFollow: boolean): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: !noFollow,
      nocache: true,
      googleBot: {
        index: false,
        follow: !noFollow,
        noimageindex: true,
      },
    };
  }
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  noFollow = false,
  type = "website",
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);

  return {
    title: { absolute: title },
    description,
    publisher: SITE_PUBLISHER,
    alternates: {
      canonical,
    },
    robots: robotsFor(noIndex, noFollow),
    openGraph: {
      type,
      locale: "en_US",
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export function homeMetadata(): Metadata {
  assertDiscoveryManifest();
  const page = getDiscoveryPage("/");
  if (!page || page.indexStatus !== "index") throw new Error("Homepage is not approved for indexing.");
  return createPageMetadata({
    title: page.search.title,
    description: page.search.description,
    path: page.path,
  });
}

export function galleryMetadata(): Metadata {
  assertDiscoveryManifest();
  const page = getDiscoveryPage("/effects");
  if (!page || page.indexStatus !== "index") throw new Error("Gallery is not approved for indexing.");
  return createPageMetadata({
    title: page.search.title,
    description: page.search.description,
    path: page.path,
  });
}

export function effectMetadata(slug: string): Metadata {
  assertDiscoveryManifest();
  const effect = getDiscoveryEffect(slug);
  if (!effect) {
    return {
      title: `Effect not found — ${SITE_NAME}`,
      robots: robotsFor(true, true),
    };
  }
  return createPageMetadata({
    title: effect.search.title,
    description: effect.search.description,
    path: effect.canonicalPath,
    noIndex: effect.indexStatus !== "index",
    modifiedTime: effect.lastModified,
  });
}

/** 404s must never claim a canonical URL for content that does not exist. */
export function notFoundMetadata(): Metadata {
  return {
    title: `Page not found — ${SITE_NAME}`,
    description: "This nullworx.space route does not exist. Explore the effect gallery or return to the homepage.",
    robots: robotsFor(true, true),
  };
}

export { SITE_DESCRIPTION };
