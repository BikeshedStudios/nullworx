import { describe, expect, it } from "vitest";
import { DISCOVERY_MANIFEST } from "@/lib/discovery/manifest";
import {
  effectStructuredData,
  galleryStructuredData,
  homeStructuredData,
  serializeJsonLd,
} from "@/lib/discovery/structured-data";

describe("structured data", () => {
  it("describes the site and organization without inventing a search action", () => {
    const data = homeStructuredData();
    const graph = data["@graph"] as Array<Record<string, unknown>>;
    expect(graph.map((node) => node["@type"])).toEqual(["Organization", "WebSite"]);
    const website = graph.find((node) => node["@type"] === "WebSite")!;
    expect(website.name).toBe("nullworx.space");
    expect(graph.find(node => node["@type"] === "Organization")?.name).toBe("Bikeshed Studios");
    expect(website.alternateName).toBeUndefined();
    expect(website.url).toBe("https://nullworx.space");
    expect(website.potentialAction).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain("SearchAction");
  });

  it("lists only the approved visible collection on the gallery page", () => {
    const data = galleryStructuredData();
    expect(data["@type"]).toBe("CollectionPage");
    const list = data.mainEntity as Record<string, unknown>;
    expect(list["@type"]).toBe("ItemList");
    expect(list.numberOfItems).toBe(7);
    const items = list.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(7);
    expect(data.name).toBe("UI Forge");
    expect(items.some(item => String(item.url).includes("digital-wake"))).toBe(false);
    expect(items.every((item) => String(item.url).startsWith("https://nullworx.space/effects/"))).toBe(true);
  });

  it("matches visible effect copy and does not invent ratings, offers or reviews", () => {
    for (const effect of DISCOVERY_MANIFEST.effects) {
      const data = effectStructuredData(effect.slug);
      if (effect.indexStatus === "noindex") {
        expect(data, effect.slug).toBeNull();
        continue;
      }
      expect(data, effect.slug).not.toBeNull();
      const graph = data!["@graph"] as Array<Record<string, unknown>>;
      const source = graph.find((node) => node["@type"] === "SoftwareSourceCode")!;
      expect(source.name).toBe(effect.name);
      expect(source.description).toBe(effect.search.description);
      expect(source.url).toBe(`https://nullworx.space${effect.canonicalPath}`);
      expect(source.license).toBe("https://opensource.org/license/mit");
      expect(source.codeRepository).toBe("https://github.com/BikeshedStudios/nullworx");
      const serialized = JSON.stringify(data);
      expect(serialized).not.toContain("aggregateRating");
      expect(serialized).not.toContain("offers");
      expect(serialized).not.toContain("review");
    }
  });

  it("uses only the rights-reviewed mineral image where it belongs", () => {
    const sediment = effectStructuredData("sediment-reveal");
    const graph = sediment!["@graph"] as Array<Record<string, unknown>>;
    const source = graph.find((node) => node["@type"] === "SoftwareSourceCode")!;
    expect(source.image).toBe("https://nullworx.space/material-wave-a/mineral-study.webp");

    const magnetic = effectStructuredData("magnetic-focus");
    const magneticSource = (magnetic!["@graph"] as Array<Record<string, unknown>>).find(
      (node) => node["@type"] === "SoftwareSourceCode",
    )!;
    expect(magneticSource.image).toBeUndefined();
  });

  it("provides a truthful breadcrumb trail", () => {
    const data = effectStructuredData("ascii-waves");
    const graph = data!["@graph"] as Array<Record<string, unknown>>;
    const breadcrumb = graph.find((node) => node["@type"] === "BreadcrumbList")!;
    const items = breadcrumb.itemListElement as Array<Record<string, unknown>>;
    expect(items.map((item) => item.name)).toEqual(["Home", "Effects", "ASCII Waves"]);
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  it("escapes script-breaking characters before HTML injection", () => {
    const serialized = serializeJsonLd({
      value: "</script><script>alert(1)</script> & \u2028",
    });
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<script>");
    expect(serialized).not.toContain("&");
    expect(serialized).toContain("\\u003c");
    expect(JSON.parse(serialized)).toEqual({
      value: "</script><script>alert(1)</script> & \u2028",
    });
  });
});
