import { SITE_COLLECTION_NAME, SITE_DESCRIPTION, SITE_LANGUAGE, SITE_NAME, SITE_PUBLISHER, SOURCE_REPOSITORY, absoluteUrl } from "@/lib/site";
import { DISCOVERY_MANIFEST, getDiscoveryEffect } from "./manifest";
import { BENTO_DUO } from "@/lib/bento-duo";

type JsonLd = Record<string, unknown>;

export const MIT_LICENSE_URL = "https://opensource.org/license/mit";
export const WEBSITE_ID = absoluteUrl("/#website");
export const ORGANIZATION_ID = absoluteUrl("/#organization");
export const COLLECTION_ID = absoluteUrl("/effects#collection");

export function organizationStructuredData(): JsonLd {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_PUBLISHER,
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
  const approved = DISCOVERY_MANIFEST.effects.filter(effect => effect.releaseState === "approved");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": COLLECTION_ID,
    name: SITE_COLLECTION_NAME,
    description: "UI Forge, the React effects kit by Bikeshed Studios at nullworx.space.",
    publisher: { "@id": ORGANIZATION_ID },
    url: absoluteUrl("/effects"),
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: approved.length,
      itemListElement: approved.map((effect, index) => ({
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
        publisher: { "@id": ORGANIZATION_ID },
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

export function bentoDuoStructuredData(): JsonLd {
  const url = absoluteUrl(BENTO_DUO.path);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": url + "#product",
        name: "Nullworx Bento Duo 01 — Orbit Bento 02 + Foil Reactor",
        description: "Two independently installable React and TypeScript bento compositions, with MIT-licensed source and Next.js/Vite examples.",
        url,
        image: BENTO_DUO.kits.map(kit => kit.desktop.src),
        brand: { "@type": "Brand", name: "Nullworx" },
        seller: { "@type": "Organization", name: SITE_PUBLISHER },
        offers: {
          "@type": "Offer",
          url: BENTO_DUO.checkoutUrl,
          price: BENTO_DUO.price.toFixed(2),
          priceCurrency: BENTO_DUO.priceCurrency,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Bento Duo 01", item: url },
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
