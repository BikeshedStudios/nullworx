import { describe, expect, it } from "vitest";
import { DISCOVERY_MANIFEST } from "@/lib/discovery/manifest";
import {
  createPageMetadata,
  effectMetadata,
  galleryMetadata,
  homeMetadata,
  notFoundMetadata,
} from "@/lib/discovery/metadata";
import { absoluteUrl, siteOrigin } from "@/lib/site";

function canonical(metadata: ReturnType<typeof homeMetadata>): string {
  const value = metadata.alternates?.canonical;
  return typeof value === "string" ? value : String(value);
}

function robotsContent(metadata: ReturnType<typeof homeMetadata>): string {
  const robots = metadata.robots;
  if (!robots || typeof robots === "string") return "";
  return [robots.index === true ? "index" : "noindex", robots.follow === true ? "follow" : "nofollow"].join(", ");
}

function titleText(metadata: ReturnType<typeof homeMetadata>): string {
  const title = metadata.title;
  if (typeof title === "string") return title;
  if (!title) return "";
  if ("absolute" in title && typeof title.absolute === "string") return title.absolute;
  if ("default" in title && typeof title.default === "string") return title.default;
  return "";
}

describe("discovery metadata", () => {
  it("uses the authorized Nullworx origin for canonical URLs", () => {
    expect(siteOrigin).toBe("https://nullworx.space");
    expect(absoluteUrl("/")).toBe("https://nullworx.space");
    expect(absoluteUrl("/effects")).toBe("https://nullworx.space/effects");
    expect(absoluteUrl("/effects/magnetic-focus")).toBe("https://nullworx.space/effects/magnetic-focus");
  });

  it("makes the homepage and gallery indexable with self-canonicals", () => {
    const home = homeMetadata();
    const gallery = galleryMetadata();
    expect(canonical(home)).toBe("https://nullworx.space");
    expect(canonical(gallery)).toBe("https://nullworx.space/effects");
    expect(robotsContent(home)).toBe("index, follow");
    expect(robotsContent(gallery)).toBe("index, follow");
    expect(home.title).toEqual({ absolute: "nullworx.space — UI Forge React effects" });
    expect(gallery.title).toEqual({ absolute: "UI Forge effect gallery — nullworx.space" });
  });

  it("sets unique, page-specific titles and descriptions", () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const effect of DISCOVERY_MANIFEST.effects) {
      const metadata = effectMetadata(effect.slug);
      const title = titleText(metadata);
      expect(title, effect.slug).toBeTruthy();
      expect(metadata.description, effect.slug).toBeTruthy();
      expect(String(metadata.description).length).toBeGreaterThanOrEqual(80);
      expect(String(metadata.description).length).toBeLessThanOrEqual(180);
      titles.add(String(title));
      descriptions.add(String(metadata.description));
    }
    expect(titles.size).toBe(DISCOVERY_MANIFEST.effects.length);
    expect(descriptions.size).toBe(DISCOVERY_MANIFEST.effects.length);
  });

  it("indexes only approved effect pages and keeps Digital Wake noindex", () => {
    for (const effect of DISCOVERY_MANIFEST.effects) {
      const metadata = effectMetadata(effect.slug);
      expect(canonical(metadata)).toBe(absoluteUrl(effect.canonicalPath));
      if (effect.indexStatus === "index") {
        expect(robotsContent(metadata), effect.slug).toBe("index, follow");
      } else {
        expect(robotsContent(metadata), effect.slug).toBe("noindex, follow");
      }
    }
    expect(robotsContent(effectMetadata("digital-wake"))).toBe("noindex, follow");
  });

  it("does not advertise Open Graph or Twitter images that are not published", () => {
    for (const metadata of [homeMetadata(), galleryMetadata(), effectMetadata("magnetic-focus")]) {
      expect(metadata.openGraph?.images).toBeUndefined();
      expect(metadata.twitter?.images).toBeUndefined();
      expect(JSON.stringify(metadata)).not.toContain("opengraph-image");
      expect(JSON.stringify(metadata)).not.toContain("twitter-image");
    }
  });

  it("keeps 404 metadata out of the index without inventing a canonical URL", () => {
    const metadata = notFoundMetadata();
    expect(metadata.alternates).toBeUndefined();
    expect(robotsContent(metadata)).toBe("noindex, nofollow");
  });

  it("strips query strings from explicit route canonicals by construction", () => {
    const metadata = createPageMetadata({
      title: "UI Forge effect gallery — nullworx.space",
      description:
        "Browse eight live React effect studies: magnetic buttons, glyph morphs, prism text, video ASCII, material dissolves and the experimental Digital Wake.",
      path: "/effects",
    });
    expect(canonical(metadata)).toBe("https://nullworx.space/effects");
    expect(canonical(metadata)).not.toContain("?");
  });
});
