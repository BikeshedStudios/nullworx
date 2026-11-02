import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { AshfallType, SeamErosion, SedimentReveal } from "@/components/material-effects/material-components";
import { EFFECTS } from "@/lib/effect-registry";
import { MATERIAL_STUDIES, MATERIAL_SOURCE_FILES, materialUsage } from "@/lib/material-studies";
const acceptedHashes: Record<string, string> = {
  "components/material-core/types.ts": "2fc335e3133fff8edeea35bb8864f2a5e99675942125f15e35c129f171012356",
  "components/material-core/trigger-clock.ts": "07704d6c0e6208a02b5835ba176e1bd92ce0bb4f10d6d820e1511a83c8122403",
  "components/material-core/coverage-mask.ts": "bf3bb7f5f66e28c510cc77eebcf5ee4a9da1172c217788619cce898d17310444",
  "components/material-core/compositor.ts": "22fa859d6efae08fbe1d0077157f61ba501bd085b093d0590f3280f5ef29373a",
  "components/material-core/source-raster.ts": "f85ce6ba3d877eb1a11826aa363ff19e22faea825e6536c4f72d17b26efaf74c",
  "components/material-core/use-material.ts": "430f0503d9bba9a9b1889c1bb1f7ef5116f4ed07b07fd7481598e3621a0312b9",
  "components/material-effects/ashfall-type.ts": "067bbc5b5f9f7cb09a26a585ab7433b1c202ac61c8a990e5befa4a43f96bac59",
  "components/material-effects/seam-erosion.ts": "dcdeeb5f9203072f0daf6c8ed46224a825565f15bbc6b7419b816828be366b61",
  "components/material-effects/sediment-reveal.ts": "f18630a923d34af50b21eaf38b8e5f0d0a19f79fc6832dbe3d452182fb1ad2ec",
  "components/material-effects/material-surface.module.css": "1405a33a9c8821f3ddbb97d90f1610ecf4c06f5a9688ddd2ab7c7ff53ffc011a",
};
describe("owner-approved material integration", () => {
 it("preserves accepted renderer, source, clock and coverage implementations byte for byte", () => {
  for (const [file, hash] of Object.entries(acceptedHashes)) expect(createHash("sha256").update(readFileSync(file)).digest("hex"), file).toBe(hash);
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
