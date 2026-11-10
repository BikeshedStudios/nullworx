import { SITE_COLLECTION_NAME, SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, SOURCE_REPOSITORY, absoluteUrl } from "@/lib/site";
import { DISCOVERY_MANIFEST, getDiscoveryEffect } from "./manifest";

type JsonLd = Record<string, unknown>;

export const MIT_LICENSE_URL = "https://opensource.org/license/mit";
export const WEBSITE_ID = absoluteUrl("/#website");
export const ORGANIZATION_ID = absoluteUrl("/#organization");
export const COLLECTION_ID = absoluteUrl("/effects#collection");

export function organizationStructuredData(): JsonLd {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    sameAs: [SOURCE_REPOSITORY],
  };
}

export function websiteStructuredData(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: SITE_COLLECTION_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LANGUAGE,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function homeStructuredData(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationStructuredData(), websiteStructuredData()],
  };
}

export function galleryStructuredData(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": COLLECTION_ID,
    name: "React effect gallery",
    description: "Eight live procedural React effect studies from Nullworx.",
    url: absoluteUrl("/effects"),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: DISCOVERY_MANIFEST.effects.length,
      itemListElement: DISCOVERY_MANIFEST.effects.map((effect, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: effect.name,
        url: absoluteUrl(effect.canonicalPath),
      })),
    },
  };
}

export function effectStructuredData(slug: string): JsonLd | null {
  const effect = getDiscoveryEffect(slug);
  if (!effect || effect.indexStatus !== "index") return null;
  const url = absoluteUrl(effect.canonicalPath);
  const image = effect.media.status === "included" ? absoluteUrl("/material-wave-a/mineral-study.webp") : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#source`,
        name: effect.name,
        description: effect.search.description,
        url,
        codeRepository: SOURCE_REPOSITORY,
        programmingLanguage: "TypeScript",
        runtimePlatform: "Web browser",
        license: MIT_LICENSE_URL,
        isPartOf: { "@id": COLLECTION_ID },
        ...(image ? { image } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Effects", item: absoluteUrl("/effects") },
          { "@type": "ListItem", position: 3, name: effect.name, item: url },
        ],
      },
    ],
  };
}

/** JSON.stringify does not escape HTML; do it before injecting into a script tag. */
export function serializeJsonLd(value: JsonLd): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
