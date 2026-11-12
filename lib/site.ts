export const SITE_NAME = "nullworx.space";
export const SITE_COLLECTION_NAME = "UI Forge";
export const SITE_PUBLISHER = "Bikeshed Studios";
export const SITE_TAGLINE = "UI Forge React effects";
export const SITE_DESCRIPTION =
  "Explore UI Forge at nullworx.space: an expressive React effects kit by Bikeshed Studios, with live typography, interaction, ASCII and material studies.";
export const SITE_LANGUAGE = "en";
export const SOURCE_REPOSITORY = "https://github.com/BikeshedStudios/nullworx";
export const OWNER_PROFILE = "https://github.com/CipherCuttle";
export const DEFAULT_SITE_ORIGIN = "https://nullworx.space";
export const CANONICAL_HOST = "nullworx.space";

export function normaliseSiteOrigin(input: string | undefined): string {
  const raw = input?.trim() || DEFAULT_SITE_ORIGIN;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS (local HTTP is allowed for development).");
  }
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a bare origin without a path, query or fragment.");
  }
  return url.origin;
}

export const siteOrigin = normaliseSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);

/** Canonical URLs use the verified deployment origin, never a request host. */
export function absoluteUrl(path = "/"): string {
  if (!path.startsWith("/")) throw new Error(`Canonical path must start with "/": ${path}`);
  // Match Next.js metadata output: the root canonical is the bare origin.
  if (path === "/") return siteOrigin;
  return new URL(path, `${siteOrigin}/`).toString();
}

export function canonicalUrl(path = "/"): string {
  return absoluteUrl(path);
}

export function isBuyMeACoffeeUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "buymeacoffee.com" || url.hostname === "www.buymeacoffee.com") &&
      url.pathname.length > 1
    );
  } catch {
    return false;
  }
}

export const DEFAULT_SUPPORT_URL = "https://buymeacoffee.com/bikeshedstudios";
export const supportUrl = isBuyMeACoffeeUrl(process.env.NEXT_PUBLIC_SUPPORT_URL)
  ? process.env.NEXT_PUBLIC_SUPPORT_URL
  : DEFAULT_SUPPORT_URL;

// A pack CTA is off by default until its Gumroad URL is verified and published.
export function isGumroadProductUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "bikeshedstudios.gumroad.com" &&
      url.pathname !== "/" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export const gumroadProductUrl = isGumroadProductUrl(process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL)
  ? process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL
  : null;

export const primaryNav = [
  { href: "/effects", label: "Effects" },
  { href: "/about", label: "About" },
] as const;

export const footerNav = [
  { href: "/effects", label: "Effects" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/licenses", label: "Licenses" },
] as const;

export const legalUpdated = "2026-10-28";
