import type { MaterialSource } from "../material-core/types";

/** Owner-approved defaults. Comparisons always share the exact same source. */
export const MATERIAL_PRESETS = {
  ashfall: { kind: "text", lines: ["Nothing", "stays."], color: "#72509d" },
  seam: { kind: "section", color: "#7752a3" },
  sediment: { kind: "raster", src: "/material-wave-a/mineral-study.webp", alt: "Original generated raster: a fractured dark mineral sculpture with distressed metallic texture, restrained violet and teal reflections, and a directional shadow on warm limestone." },
} as const satisfies Record<string, MaterialSource>;
