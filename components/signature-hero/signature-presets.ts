import type { LivingTypeColors, LivingTypeMaterial } from "./living-type/living-type-recipe";

export const SIGNATURE_PRESETS = {
  carbon: {
    name: "Carbon", note: "01 / AFTER HOURS", background: "#171916", ink: "#eeeee5",
    muted: "#b1b4a7", accent: "#d5ed8b", line: "#474b40", weight: 800, tracking: -0.025,
    colors: ["#f4f5d5", "#abb59a", "#475c3b", "#d5ed8b"] as LivingTypeColors,
    material: { speed: 0.16, distortion: 0.7, swirl: 0.25, grainMixer: 0.1, grainOverlay: 0.06, scale: 1.3, rotation: 25 },
  },
  porcelain: {
    name: "Porcelain", note: "02 / IN GOOD LIGHT", background: "#f0ede5", ink: "#30271f",
    muted: "#6f655c", accent: "#9d3c26", line: "#c3b9ac", weight: 800, tracking: -0.035,
    colors: ["#532c20", "#a7492d", "#ca986c", "#713322"] as LivingTypeColors,
    material: { speed: 0.12, distortion: 0.55, swirl: 0.15, grainMixer: 0.15, grainOverlay: 0.1, scale: 1.5, rotation: 340 },
  },
  cobalt: {
    name: "Cobalt", note: "03 / ELECTRIC HOURS", background: "#152db3", ink: "#f1f1e6",
    muted: "#c0cef3", accent: "#effa9c", line: "#687bdd", weight: 600, tracking: -0.02,
    colors: ["#f4f4dd", "#b0c6ef", "#6a8bda", "#f1f3d4"] as LivingTypeColors,
    material: { speed: 0.2, distortion: 0.4, swirl: 0.55, grainMixer: 0.04, grainOverlay: 0.03, scale: 1.6, rotation: 290 },
  },
} satisfies Record<string, { name: string; note: string; background: string; ink: string; muted: string; accent: string; line: string; weight: number; tracking: number; colors: LivingTypeColors; material: LivingTypeMaterial }>;

export type SignaturePreset = keyof typeof SIGNATURE_PRESETS;

/** Copy is plain React text. Only the living wordmark has an ASCII restriction. */
export const DEFAULT_SIGNATURE_COPY = {
  brand: "Form & Field",
  eyebrow: "Independent minds. Distinctive outcomes.",
  wordmark: "FORM",
  counterline: "with feeling.",
  description: "We turn a point of view into a presence. Strategy, identity and digital experiences for people moving things forward.",
  primaryLabel: "Start a conversation",
  secondaryLabel: "Selected work",
  discipline: "Strategy / Identity / Digital",
  location: "An independent design practice",
  availability: "Open for good collaborations",
  navContactLabel: "Let’s talk",
  editionLabel: "A PRACTICE IN GOOD FORM",
  indexLabel: "01 / POINT OF VIEW",
  asideFirst: "Less ordinary.",
  asideSecond: "More enduring.",
};

export type SignatureCopy = typeof DEFAULT_SIGNATURE_COPY;

export function supportedWordmark(value: string): string {
  const text = value.trim();
  // The composition is tuned for 2–12 characters. Invalid input keeps a readable hero.
  return /^[A-Za-z0-9][A-Za-z0-9 .&'!?+\-/]{1,11}$/.test(text) ? text : "FORM";
}
