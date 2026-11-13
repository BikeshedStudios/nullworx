import { afterEach, describe, expect, it, vi } from "vitest";
import { FISH_CREDIT, LOOP30_BYTES, LOOP30_SHA256, parseFeaturedMedia, verifyFeaturedBytes } from "../../components/white-journey/featured-media";

// CC fixture metadata exercises compatibility; it does not assert a CC grant.
const fixture = {
  src: "/media/ascii/loop30-v2-807bb27e.mp4", sha256: LOOP30_SHA256,
  title: "12 Hours Stunning 4K Betta Fish with Relax Music 🐠 Relaxing Fish in Black Aquarium",
  uploader: "Animal Exploration Project", licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  receipt: "fixture-only-license-receipt", sourceLinkage: "fixture-only-source-linkage",
};
const directFixture = {
  src: fixture.src, sha256: LOOP30_SHA256, title: fixture.title, uploader: fixture.uploader,
  licenseBasis: "direct-permission", credit: FISH_CREDIT, integrity: "server-sha256",
  receipt: "owner-direct-permission-2026-11-13-loop30-v2",
  sourceLinkage: "owner-direct-permission-2026-11-13-loop30-v2",
};

afterEach(() => vi.unstubAllGlobals());

describe("featured ASCII deployment receipt", () => {
  it("keeps clean and incomplete deployments procedural", () => {
    for (const value of [undefined, "invalid", "null", "[]", "{}", JSON.stringify({ ...fixture, receipt: "" }), JSON.stringify({ ...fixture, licenseUrl: "" })]) {
      expect(parseFeaturedMedia(value)).toBeNull();
    }
  });
  it("preserves legacy CC receipts and requires an exact CC BY version", () => {
    expect(parseFeaturedMedia(JSON.stringify(fixture))).toEqual(fixture);
    for (const version of ["1.0", "2.0", "2.5", "3.0", "4.0"]) {
      const explicit = { ...fixture, licenseBasis: "cc-by", licenseUrl: `https://creativecommons.org/licenses/by/${version}/` };
      expect(parseFeaturedMedia(JSON.stringify(explicit))).toEqual(explicit);
    }
    for (const change of [{ licenseBasis: "unknown" }, { licenseUrl: "https://example.com/license" }, { licenseUrl: "https://creativecommons.org/licenses/by/" }]) {
      expect(parseFeaturedMedia(JSON.stringify({ ...fixture, ...change }))).toBeNull();
    }
  });
  it("accepts direct permission with public credit and retained operator receipt IDs", () => {
    expect(parseFeaturedMedia(JSON.stringify(directFixture))).toEqual(directFixture);
    for (const change of [{ credit: "" }, { credit: "Unknown creator" }, { integrity: "unchecked" }, { receipt: "" }, { receipt: "/private/correspondence" }, { sourceLinkage: "" }, { licenseUrl: fixture.licenseUrl }, { licenseUrl: null }]) {
      expect(parseFeaturedMedia(JSON.stringify({ ...directFixture, ...change }))).toBeNull();
    }
  });
  it("rejects substitute footage or altered identity for either permission basis", () => {
    for (const valid of [fixture, directFixture]) for (const change of [{ sha256: "substitute" }, { src: "https://example.com/fish.mp4" }, { src: "/media/ascii/substitute.mp4" }, { uploader: "Unknown" }, { title: "Other footage" }]) {
      expect(parseFeaturedMedia(JSON.stringify({ ...valid, ...change }))).toBeNull();
    }
  });
  it("preflights server-verified direct media without reading or downloading a body", async () => {
    const response = new Response(null, { headers: { "content-type": "video/mp4", "content-length": String(LOOP30_BYTES) } });
    const body = vi.spyOn(response, "arrayBuffer");
    const fetcher = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetcher);
    const signal = new AbortController().signal;
    await verifyFeaturedBytes(parseFeaturedMedia(JSON.stringify(directFixture))!, signal);
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(fixture.src, { method: "HEAD", signal });
    expect(body).not.toHaveBeenCalled();
  });
  it("rejects unavailable, wrong-MIME and wrong-size direct media", async () => {
    for (const response of [new Response(null, { status: 404 }), new Response(null, { headers: { "content-type": "text/html", "content-length": String(LOOP30_BYTES) } }), new Response(null, { headers: { "content-type": "video/mp4", "content-length": "4" } }), new Response(null, { headers: { "content-type": "video/mp4" } })]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
      await expect(verifyFeaturedBytes(parseFeaturedMedia(JSON.stringify(directFixture))!, new AbortController().signal)).rejects.toThrow(/Featured fish video/);
    }
  });
  it("retains full-file hash rejection for legacy CC media", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("substitute video", { headers: { "content-type": "video/mp4" } }));
    vi.stubGlobal("fetch", fetcher);
    await expect(verifyFeaturedBytes(parseFeaturedMedia(JSON.stringify(fixture))!, new AbortController().signal)).rejects.toThrow("Featured fish video failed its source checksum.");
    expect(fetcher.mock.calls[0][1].method).toBe("GET");
  });
});
