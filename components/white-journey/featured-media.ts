/** Public build-time receipt. Private permission correspondence is never bundled. */
export const LOOP30_SHA256 = "807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238";
export const LOOP30_BYTES = 12_862_251;
export const FISH_ORIGINAL = "https://www.youtube.com/watch?v=B30S0Vr9N9A&t=3512s";
export const FISH_CREDIT = "Animal Exploration Project (@AnimalEP)";

type FeaturedSource = {
  src: string;
  sha256: string;
  title: string;
  uploader: string;
  receipt: string;
  sourceLinkage: string;
};

type CreativeCommonsMedia = FeaturedSource & {
  /** Omitted only by receipts from the original CC-only implementation. */
  licenseBasis?: "cc-by";
  licenseUrl: string;
};

type DirectPermissionMedia = FeaturedSource & {
  licenseBasis: "direct-permission";
  credit: typeof FISH_CREDIT;
  integrity: "server-sha256";
  licenseUrl?: never;
};

export type FeaturedMedia = CreativeCommonsMedia | DirectPermissionMedia;

export function parseFeaturedMedia(value: string | undefined): FeaturedMedia | null {
  if (!value) return null;
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const receipt = data as Record<string, unknown>;
    if (receipt.src !== "/media/ascii/loop30-v2-807bb27e.mp4" || receipt.sha256 !== LOOP30_SHA256) return null;
    if (receipt.title !== "12 Hours Stunning 4K Betta Fish with Relax Music 🐠 Relaxing Fish in Black Aquarium"
      || receipt.uploader !== "Animal Exploration Project") return null;
    if (![receipt.receipt, receipt.sourceLinkage].every(text => typeof text === "string" && text.trim().length > 8)) return null;
    if (receipt.licenseBasis === "direct-permission") {
      // IDs refer to retained operator evidence, never private paths or messages.
      if (![receipt.receipt, receipt.sourceLinkage].every(id => typeof id === "string" && /^[a-z0-9][a-z0-9._:-]{8,159}$/i.test(id))) return null;
      if ("licenseUrl" in receipt || receipt.credit !== FISH_CREDIT || receipt.integrity !== "server-sha256") return null;
    } else {
      if (receipt.licenseBasis !== undefined && receipt.licenseBasis !== "cc-by") return null;
      if (typeof receipt.licenseUrl !== "string" || !/^https:\/\/creativecommons\.org\/licenses\/by\/(1\.0|2\.0|2\.5|3\.0|4\.0)\/$/.test(receipt.licenseUrl)) return null;
    }
    return receipt as FeaturedMedia;
  } catch { return null; }
}

export async function verifyFeaturedBytes(media: FeaturedMedia, signal: AbortSignal): Promise<void> {
  // The direct-permission release hashes the exact file on the server before
  // staging/activation and serves it read-only at its pinned version path. A HEAD
  // preflight checks availability without downloading 12.9 MB before video loads.
  const serverVerified = media.licenseBasis === "direct-permission";
  const response = await fetch(media.src, { signal, method: serverVerified ? "HEAD" : "GET" });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("video/mp4")) throw new Error("Featured fish video is unavailable.");
  if (serverVerified) {
    if (Number(response.headers.get("content-length")) !== LOOP30_BYTES) throw new Error("Featured fish video does not match its deployment receipt.");
    return;
  }
  // Retain the original byte verification for existing CC deployment receipts.
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== media.sha256) throw new Error("Featured fish video failed its source checksum.");
}
