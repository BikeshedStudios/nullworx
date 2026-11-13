import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LocalVideoField } from "../../components/white-journey/local-video-field";
import { parseFeaturedMedia, LOOP30_SHA256 } from "../../components/white-journey/featured-media";
import { asciiDefaults } from "../../lib/ascii-playground";

const read = (file: string) => readFileSync(file, "utf8");
describe("permanent accepted product baselines", () => {
  it("keeps Signature Hero live and free of static image previews", () => {
    const page = read("app/kits/signature-hero/page.tsx");
    const playground = read("components/signature-hero/playground.tsx");
    expect(page).toContain("SignaturePlayground");
    expect(page).not.toMatch(/from "next\/image"|<Image\b|signature-hero-01\/.*\.png/);
    expect(playground).toContain("<SignatureHero");
    expect(playground).toContain('data-viewport={viewport}');
    expect(existsSync("public/signature-hero-01")).toBe(false);
    expect(read("ops/deploy/check-public-assets.mjs")).not.toContain("signature-hero-01/");
  });
  it("homepage mounts the automatic media adapter and retains the exact approved receipt", () => {
    expect(read("app/page.tsx")).toContain("<HomeKoiField />");
    expect(read("components/white-journey/home-koi-field.tsx")).toContain('mode = "auto"');
    const receipt = parseFeaturedMedia(read("ops/deploy/ascii-featured-media.json"));
    expect(receipt).toMatchObject({ src: "/media/ascii/loop30-v2-807bb27e.mp4", sha256: LOOP30_SHA256, licenseBasis: "direct-permission", integrity: "server-sha256", credit: "Animal Exploration Project (@AnimalEP)" });
    expect(LOOP30_SHA256).toBe("807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238");
  });
  it("featured video renders Dense selected at 8px; Fine and Original stay selectable", () => {
    const html = renderToStaticMarkup(createElement(LocalVideoField, { source: "/media/ascii/loop30-v2-807bb27e.mp4", featured: true, onReset() {} }));
    expect(html).toContain('data-detail="dense"');
    expect(html).toMatch(/<option value="8" selected="">Dense<\/option>/);
    expect(html).toContain('<option value="12">Fine</option>');
    expect(html).toContain('<option value="16">Original</option>');
  });
  it("playground settings own their defaults independently of the homepage", () => {
    const html = renderToStaticMarkup(createElement(LocalVideoField, { source: "blob:local", featured: false, settings: { ...asciiDefaults("video"), cellSize: 12 }, onReset() {} }));
    expect(html).toContain('data-detail="fine"');
    expect(asciiDefaults("procedural").mode).toBe("procedural");
  });
  it("public tree and tracked source never include restricted footage or premium archives", () => {
    const visit = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? visit(join(directory, entry.name)) : [join(directory, entry.name)]);
    expect(visit("public").filter(file => /\.(mp4|webm|mov|zip|tgz|map)$/i.test(file))).toEqual([]);
    expect(read("ops/deploy/build-release.sh")).toContain("test:product");
    expect(read("ops/deploy/build-release.sh")).toContain("media=${3:-ascii-loop30-direct-permission}");
    expect(read("ops/deploy/smoke-browser.mjs")).toContain('"data-detail", "dense"');
  });
});
