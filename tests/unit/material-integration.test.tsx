import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { AshfallType, SeamErosion, SedimentReveal } from "@/components/material-effects/material-components";
import { EFFECTS } from "@/lib/effect-registry";
import { MATERIAL_STUDIES, MATERIAL_SOURCE_FILES, materialUsage } from "@/lib/material-studies";
import { DEFAULT_MATERIAL_OPTIONS, normalizeMaterialOptions } from "@/components/material-core/types";
const acceptedHashes: Record<string, string> = {
  "components/material-core/trigger-clock.ts": "07704d6c0e6208a02b5835ba176e1bd92ce0bb4f10d6d820e1511a83c8122403",
  "components/material-core/coverage-mask.ts": "bf3bb7f5f66e28c510cc77eebcf5ee4a9da1172c217788619cce898d17310444",
  "components/material-core/compositor.ts": "22fa859d6efae08fbe1d0077157f61ba501bd085b093d0590f3280f5ef29373a",
  "components/material-core/source-raster.ts": "f85ce6ba3d877eb1a11826aa363ff19e22faea825e6536c4f72d17b26efaf74c",
  "components/material-effects/material-surface.module.css": "1405a33a9c8821f3ddbb97d90f1610ecf4c06f5a9688ddd2ab7c7ff53ffc011a",
};
describe("owner-approved material integration", () => {
 it("preserves the accepted clock, coverage, compositor, raster and surface implementations byte for byte", () => {
  for (const [file, hash] of Object.entries(acceptedHashes)) expect(createHash("sha256").update(readFileSync(file)).digest("hex"), file).toBe(hash);
 });
 it("keeps the additive customization seam at the accepted defaults", () => {
  expect(DEFAULT_MATERIAL_OPTIONS).toEqual({ intensity: 1, density: 1 });
  expect(normalizeMaterialOptions()).toEqual({ intensity: 1, density: 1 });
  expect(normalizeMaterialOptions({ intensity: 4, density: 0 })).toEqual({ intensity: 1.6, density: 0.6 });
  for (const study of MATERIAL_STUDIES) {
   const usage = materialUsage(study.id);
   expect(usage).toContain('intensity={1.00}');
   expect(usage).toContain('density={1.00}');
  }
 });
 it("adds exactly the three approved routes and complete copyable source closures", () => {
  expect(EFFECTS).toHaveLength(8);
  for (const study of MATERIAL_STUDIES) {
   expect(EFFECTS.some(effect => effect.slug === study.slug)).toBe(true);
   expect(materialUsage(study.id)).toContain(`<${study.component}`);
  }
  for (const file of MATERIAL_SOURCE_FILES) expect(readFileSync(`components/${file}`, "utf8").length).toBeGreaterThan(50);
 });
 it("exposes real semantic text, sections and alt text before Canvas is ready", () => {
  expect(renderToStaticMarkup(<AshfallType lines={["Real", "type."]} />)).toContain("Real");
  expect(renderToStaticMarkup(<SeamErosion />)).toContain("Hero section");
  const image = renderToStaticMarkup(<SedimentReveal />);
  expect(image).toContain("/material-wave-a/mineral-study.webp");
  expect(image).toContain("Original generated raster");
  expect(image).not.toContain("<svg");
 });
});
