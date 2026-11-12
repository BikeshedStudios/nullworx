import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { DISCOVERY_MANIFEST } from "@/lib/discovery/manifest";
import { getIndexableEffects, getIndexablePages } from "@/lib/discovery/eligibility";

describe("sitemap and robots", () => {
  it("publishes exactly the approved canonical URLs", () => {
    const entries = sitemap();
    const expected = [
      ...getIndexablePages().map((page) => page.path),
      ...getIndexableEffects().map((effect) => effect.canonicalPath),
    ].map((path) => (path === "/" ? "https://nullworx.space" : `https://nullworx.space${path}`));

    expect(entries).toHaveLength(10);
    expect(entries.map((entry) => entry.url)).toEqual(expected);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length);
    expect(entries.every((entry) => entry.url === "https://nullworx.space" || entry.url.startsWith("https://nullworx.space/"))).toBe(true);
    expect(entries.map((entry) => entry.url)).not.toContain("https://nullworx.space/effects/digital-wake");
  });

  it("does not submit noindex, utility or unapproved routes", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const path of [
      "/effects/digital-wake",
      "/lab/forge-factory-01",
      "/tools/fin-editor-012.html",
      "/about",
      "/privacy",
      "/licenses",
      "/robots.txt",
      "/sitemap.xml",
    ]) {
      expect(urls, path).not.toContain(`https://nullworx.space${path}`);
    }
  });

  it("uses fixed content dates instead of the current build time", () => {
    const entries = sitemap();
    const dateStrings = entries.map((entry) =>
      entry.lastModified instanceof Date
        ? entry.lastModified.toISOString()
        : new Date(entry.lastModified ?? 0).toISOString(),
    );
    const expectedDates = [
      ...getIndexablePages().map((page) => page.lastModified),
      ...getIndexableEffects().map((effect) => effect.lastModified),
    ].map((date) => date + "T00:00:00.000Z");
    expect(dateStrings).toEqual(expectedDates);
    expect(new Set(dateStrings).size).toBe(2);
  });

  it("emits a crawl policy with the canonical sitemap and private utility exclusions", () => {
    const policy = robots();
    expect(policy.sitemap).toBe("https://nullworx.space/sitemap.xml");
    const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
    expect(rules).toHaveLength(1);
    expect(rules[0]!.userAgent).toBe("*");
    expect(rules[0]!.allow).toBe("/");
    expect(rules[0]!.disallow).toEqual(["/lab/", "/media/", "/tools/"]);
  });

  it("keeps the manifest effect count stable while only approved effects are submitted", () => {
    expect(DISCOVERY_MANIFEST.effects).toHaveLength(8);
    expect(sitemap()).toHaveLength(3 + 7);
  });
});
