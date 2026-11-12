import { describe, expect, it } from "vitest";
import { LOOP30_SHA256, parseFeaturedMedia } from "../../components/white-journey/featured-media";

// Test-only receipt; this is not source-specific hosting clearance.
const fixture = {
  src: "/media/ascii/loop30-v2-807bb27e.mp4", sha256: LOOP30_SHA256,
  title: "12 Hours Stunning 4K Betta Fish with Relax Music 🐠 Relaxing Fish in Black Aquarium",
  uploader: "Animal Exploration Project", licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  receipt: "fixture-only-license-receipt", sourceLinkage: "fixture-only-source-linkage",
};
describe("featured ASCII deployment receipt", () => {
  it("keeps clean and incomplete deployments procedural", () => {
    for (const value of [undefined, "invalid", "{}", JSON.stringify({ ...fixture, receipt: "" }), JSON.stringify({ ...fixture, licenseUrl: "" })]) {
      expect(parseFeaturedMedia(value)).toBeNull();
    }
  });
  it("requires the accepted source, same-origin version path and explicit CC version", () => {
    expect(parseFeaturedMedia(JSON.stringify(fixture))).toEqual(fixture);
    for (const change of [{ sha256: "substitute" }, { src: "https://example.com/fish.mp4" }, { uploader: "Unknown" }, { licenseUrl: "https://example.com/license" }]) {
      expect(parseFeaturedMedia(JSON.stringify({ ...fixture, ...change }))).toBeNull();
    }
  });
});
