import type { DiscoveryEffect } from "./schema";
const evidence = { ownerApproval: "docs/visual-frontier/PROMOTION_01.md", rights: "docs/visual-frontier/SOURCE_RIGHTS.md", install: "docs/visual-frontier/INSTALL.md", media: null };
const media = { status: "none", hostingRights: "not-applicable", indexingImpact: "none", note: null } as const;
export const FRONTIER_DISCOVERY: DiscoveryEffect[] = [
  {
    slug: "refractive-type", name: "Refractive Type", canonicalPath: "/effects/refractive-type", releaseState: "approved", indexStatus: "index",
    search: { primaryIntent: "build", primaryQuery: "react refractive 3d typography", relatedQueries: ["webgl spectral text", "three js extruded text", "react chromatic lens"], title: "Refractive Type: live spectral React typography",
      description: "Extruded React typography with physical shading and a spectral lens. Explore Spectral mass and Split signal, with live controls and complete multi-file source." },
    content: {
      summary: "Refractive Type shapes PHASE and VOID into extruded font meshes, adds physical node shading and deformation, then bends their color through a live spectral lens in one WebGL2 context.",
      useCases: ["Expressive headings in a dedicated, user-activated visual section.", "Interactive type specimens with pointer, touch and keyboard inspection.", "Optical studies that need both a full GPU mode and a lightweight live companion."],
      install: ["Copy every file in components/visual-frontier, including renderers, CSS Modules and third-party notices.", "Install three@0.187.0, three-text@0.6.5 and @types/three@0.187.0. Use the complete React example in Code & installation.", "Choose spectral-mass or split-signal. Set dispersion and deformation from 0 to 1 and give the parent an explicit height."],
      limits: ["Full mode requires WebGL2; the live Canvas2D companion is available without it. No screenshot is used.", "The approved words are PHASE and VOID. This API does not accept arbitrary text.", "Full mode is user-activated. Reduced motion starts still; hidden and offscreen drawing pauses automatically.", "Software GPUs can be slow. One full renderer may hold the shared GPU lease at a time."],
      rightsNote: "Original integration is MIT under the repository license. Three/three-text, HarfBuzz and supporting libraries retain their notices; Space Grotesk is SIL OFL and libtess is SGI-B-2.0. No third-party media or OGL runtime is included.",
    }, evidence, media, lastModified: "2026-11-14",
  },
  {
    slug: "impossible-material", name: "Impossible Material", canonicalPath: "/effects/impossible-material", releaseState: "approved", indexStatus: "index",
    search: { primaryIntent: "build", primaryQuery: "react impossible material webgl", relatedQueries: ["three js sdf raymarch", "folded mineral node material", "react procedural chrome"], title: "Impossible Material: procedural React chrome and mineral",
      description: "Turn braided chrome and folded mineral in a live React playground. Two WebGL2 variants, tension and iridescence controls, plus complete source and live fallback." },
    content: {
      summary: "Impossible Material pairs a braided toroidal signed-distance field with four laminated, displaced mineral ribbons. The two variants use real raymarching and physical node materials, with procedural studio light.",
      useCases: ["Interactive material specimens with chrome and mineral directions.", "Dedicated visual sections where users can opt into a full GPU study.", "Procedural product or editorial accents that do not require stock media."],
      install: ["Copy the complete components/visual-frontier directory, including compiled GLSL, original sculpt source, CSS and notices.", "Install three@0.187.0, three-text@0.6.5 and @types/three@0.187.0 for the shared source closure.", "Choose quicksilver or folded-mineral. Set tension and iridescence from 0 to 1; preserve cleanup and motion preference handling."],
      limits: ["Quicksilver uses a compiled 110-step ray marcher; Folded mineral uses four physical ribbon layers.", "Full mode requires WebGL2 and is explicitly user-activated. Canvas2D provides a labelled live companion.", "Device pixel ratios and internal pixel counts are capped. Reduced motion starts in a still state.", "Software rendering can be slow; only one full study is allocated at a time. No external media or runtime compiler is used."],
      rightsNote: "Original sculpt, reflection rig and integration are MIT under the repository license. Three retains its MIT notice. Shader Park generated boilerplate retains its shipped MIT grant; its conflicting Apache package metadata is recorded in the complete third-party notice. No stock media is used.",
    }, evidence, media, lastModified: "2026-11-14",
  },
];
