import type { FrontierKind, Values, Variant } from "@/components/visual-frontier/types";

export const FRONTIER_STUDIES = [
  { id: "refractive", slug: "refractive-type", name: "Refractive Type", family: "TYPOGRAPHY / OPTICS", status: "Source included", technology: "THREE / WEBGL2",
    description: "Extruded font meshes, physical node shading and a live spectral lens. A1 Spectral mass / PHASE · A2 Split signal / VOID.",
    subtitle: "Language, in another state.", variants: ["Spectral mass", "Split signal"], labels: ["Dispersion", "Deformation"], defaults: [.5, .45] },
  { id: "impossible", slug: "impossible-material", name: "Impossible Material", family: "MATERIAL / GEOMETRY", status: "Source included", technology: "THREE / WEBGL2",
    description: "Braided chrome SDF raymarching and displaced mineral ribbons. C1 Quicksilver · C2 Folded mineral.",
    subtitle: "Familiar matter. Unfamiliar physics.", variants: ["Quicksilver", "Folded mineral"], labels: ["Tension", "Iridescence"], defaults: [.5, .55] },
] as const;

// Complete consumer closure. Only these reviewed files are exposed by the source endpoint.
export const FRONTIER_SOURCE_FILES = [
  "frontier.tsx", "frontier.module.css", "types.ts", "runtime.ts", "gpu-session.ts",
  "renderers/light.ts", "renderers/environment.ts", "renderers/node-renderer.ts",
  "renderers/refractive.ts", "renderers/harfbuzz-data.ts", "renderers/font-data.ts",
  "renderers/material.ts", "renderers/mineral.ts", "renderers/quicksilver.ts",
  "renderers/quicksilver.compiled.json", "renderers/quicksilver.sculpt.js",
  "LICENSE", "THIRD_PARTY_NOTICES.md", "OFL-SpaceGrotesk.txt",
] as const;
export function frontierUsage(kind: FrontierKind, variant: Variant, values: Values, paused: boolean) {
  const type = kind === "refractive-type";
  const name = type ? "RefractiveType" : "ImpossibleMaterial";
  const variantName = type ? variant ? "split-signal" : "spectral-mass" : variant ? "folded-mineral" : "quicksilver";
  return `"use client";\n\nimport { ${name} } from "./components/visual-frontier/frontier";\n\nexport function MyInterface() {\n  return (\n    <div style={{ height: 520, width: "100%" }}>\n      <${name}\n        variant="${variantName}"\n        ${type ? "dispersion" : "tension"}={${values[0]}}\n        ${type ? "deformation" : "iridescence"}={${values[1]}}\n        mode="full"\n        paused={${paused}}\n      />\n    </div>\n  );\n}\n`;
}
