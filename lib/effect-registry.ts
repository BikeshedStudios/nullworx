import { FORGE_STUDIES } from "./forge-studies";
export const EFFECTS = [
  ...FORGE_STUDIES.map((effect) => ({
    ...effect,
    status: "Preview",
    technology: "REACT + CSS",
  })),
  {
    id: "ascii",
    slug: "ascii-waves",
    name: "ASCII Waves",
    family: "VIDEO / WEBGL",
    status: "Preview",
    technology: "WEBGL2",
    description:
      "The original character renderer. Source-colored video, Fine density, pointer waves and motion controls.",
  },
  {
    id: "wake",
    slug: "digital-wake",
    name: "Digital Wake",
    family: "MOTION / PARTICLES",
    status: "Experimental / Beta",
    technology: "WEBGL2 + CANVAS",
    description:
      "A delicate fish-bound wake. Manual caudal-fin regions, measured relative motion, and two expressive presets.",
  },
] as const;
export function findEffect(slug: string) {
  return EFFECTS.find((effect) => effect.slug === slug);
}
