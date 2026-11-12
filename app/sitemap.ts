import type { MetadataRoute } from "next";
import { assertDiscoveryManifest, getIndexableEffects, getIndexablePages } from "@/lib/discovery/eligibility";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  assertDiscoveryManifest();

  const pages = getIndexablePages().map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: new Date(`${page.lastModified}T00:00:00.000Z`),
  }));
  const effects = getIndexableEffects().map((effect) => ({
    url: absoluteUrl(effect.canonicalPath),
    lastModified: new Date(`${effect.lastModified}T00:00:00.000Z`),
  }));

  return [...pages, ...effects];
}
