import { MATERIAL_PRESETS } from "../components/material-effects/presets";
import type { MaterialKind } from "../components/material-core/types";

export const MATERIAL_STUDIES = [
  { id: "ashfall", slug: "ashfall-type", name: "Ashfall Type", component: "AshfallType", family: "TYPE / MATERIAL", control: "CSS opacity fade", source: MATERIAL_PRESETS.ashfall,
    description: "A headline gives way to a quiet, rising current. Every fragment begins where the ink ends." },
  { id: "seam", slug: "seam-erosion", name: "Seam Erosion", component: "SeamErosion", family: "SECTION / MATERIAL", control: "CSS straight wipe", source: MATERIAL_PRESETS.seam,
    description: "An edge loses its hold. Small pieces leave the hero, opening a new ground beneath it." },
  { id: "sediment", slug: "sediment-reveal", name: "Sediment Reveal", component: "SedimentReveal", family: "IMAGE / MATERIAL", control: "CSS tiled grain dissolve", source: MATERIAL_PRESETS.sediment,
    description: "Stone, grit and dust follow different paths. A textured mineral study leaves in layers, revealing another surface." },
] as const;

/** Complete import closure: the shared driver conditionally imports all three approved renderers. */
export const MATERIAL_SOURCE_FILES = [
  "material-effects/material-components.tsx", "material-effects/presets.ts",
  "material-effects/material-surface.tsx", "material-effects/material-surface.module.css",
  "material-effects/ashfall-type.ts", "material-effects/seam-erosion.ts", "material-effects/sediment-reveal.ts",
  "material-core/types.ts", "material-core/trigger-clock.ts", "material-core/source-raster.ts",
  "material-core/coverage-mask.ts", "material-core/compositor.ts", "material-core/use-material.ts",
] as const;

export type MaterialCustomization = {
  lines: readonly [string, string];
  color: string;
  intensity: number;
  density: number;
};

export function materialUsage(kind: MaterialKind, customization?: Partial<MaterialCustomization>) {
  const study = MATERIAL_STUDIES.find(study => study.id === kind)!;
  const lines = customization?.lines ?? MATERIAL_PRESETS.ashfall.lines;
  const intensity = Math.min(1.6, Math.max(0.4, customization?.intensity ?? 1));
  const density = Math.min(1.4, Math.max(0.6, customization?.density ?? 1));
  const props = kind === "ashfall" ? `lines={${JSON.stringify(lines)}} color="${customization?.color ?? MATERIAL_PRESETS.ashfall.color}" intensity={${intensity.toFixed(2)}} density={${density.toFixed(2)}}`
    : kind === "seam" ? `color="${customization?.color ?? MATERIAL_PRESETS.seam.color}" intensity={${intensity.toFixed(2)}} density={${density.toFixed(2)}}`
      : `src="${MATERIAL_PRESETS.sediment.src}" alt="Fractured dark mineral on warm limestone" intensity={${intensity.toFixed(2)}} density={${density.toFixed(2)}}`;
  return `"use client";
import { ${study.component} } from "@/components/material-effects/material-components";

// Copy the listed files into components/, preserving both subdirectories.
// Use React 19.3, CSS Modules and the font variables below.
// pnpm add @fontsource/instrument-serif@5.3.0 @fontsource/space-mono@5.3.0
// Sediment: copy the licensed local image to public/material-wave-a/ as well.
export function MaterialSection() {
  return (
    <>
    <section data-scroll-lane style={{ height: 1700 }}>
      <div style={{ position: "sticky", top: 84 }}>
        <${study.component} ${props} />
      </div>
    </section>
    <section id="field-notes"><h2>Your next section</h2></section>
    </>
  );
}

/* Your global CSS:
@import "@fontsource/instrument-serif/latin-400.css";
@import "@fontsource/instrument-serif/latin-400-italic.css";
@import "@fontsource/space-mono/latin-400.css";
:root { --font-display: "Instrument Serif", serif; --font-mono: "Space Mono", monospace; }
*/`;
}
