/** Public build-time receipt. No media bytes or inferred licence metadata. */
export const LOOP30_SHA256 = "807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238";
export const FISH_ORIGINAL = "https://www.youtube.com/watch?v=B30S0Vr9N9A&t=3512s";

export type FeaturedMedia = {
  src: string;
  sha256: string;
  title: string;
  uploader: string;
  licenseUrl: string;
  receipt: string;
  sourceLinkage: string;
};

export function parseFeaturedMedia(value: string | undefined): FeaturedMedia | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value) as FeaturedMedia;
    if (data.src !== "/media/ascii/loop30-v2-807bb27e.mp4" || data.sha256 !== LOOP30_SHA256) return null;
    if (data.title !== "12 Hours Stunning 4K Betta Fish with Relax Music 🐠 Relaxing Fish in Black Aquarium"
      || data.uploader !== "Animal Exploration Project") return null;
    if (!/^https:\/\/creativecommons\.org\/licenses\/by\/(1\.0|2\.0|2\.5|3\.0|4\.0)\/$/.test(data.licenseUrl)) return null;
    if (![data.receipt, data.sourceLinkage].every(text => typeof text === "string" && text.trim().length > 8)) return null;
    return data;
  } catch { return null; }
}

export async function verifyFeaturedBytes(media: FeaturedMedia, signal: AbortSignal): Promise<void> {
  const response = await fetch(media.src, { signal });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("video/mp4")) throw new Error("Featured fish video is unavailable.");
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== media.sha256) throw new Error("Featured fish video failed its source checksum.");
}
