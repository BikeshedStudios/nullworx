export type FoilMaterial = "spectral" | "brushed" | "oxide";
export type FoilState = "folded" | "annealed";
export interface FoilContent {
  title: string;
  subtitle: string;
  specimen: string;
  materials: {
    id: FoilMaterial;
    name: string;
    description: string;
    code: string;
  }[];
  states: Record<FoilState, { name: string; description: string }>;
}
export const foilContent: FoilContent = {
  title: "Light,\ngiven form.",
  subtitle: "A study in surfaces that refuse to sit still.",
  specimen: "FR—001",
  materials: [
    {
      id: "spectral",
      name: "Spectral foil",
      description:
        "A layered interference finish. Colour separates at the edge; the centre holds its silver.",
      code: "Al / 01",
    },
    {
      id: "brushed",
      name: "Brushed alloy",
      description:
        "Directional grain trades colour for a broader, quieter reflection.",
      code: "Ni / 02",
    },
    {
      id: "oxide",
      name: "Oxide bloom",
      description:
        "A violet patina with a teal grazing highlight. A surface shaped by its light.",
      code: "Ti / 03",
    },
  ],
  states: {
    folded: {
      name: "Tension",
      description:
        "Folded under tension. Sharp contours concentrate the highlight into a narrow band.",
    },
    annealed: {
      name: "Release",
      description:
        "Released into an open form. The reflection broadens as the layers separate.",
    },
  },
};
export function clampLight(value: number) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 50;
}
