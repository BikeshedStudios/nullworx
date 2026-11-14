import { SITE_NAME, SITE_COLLECTION_NAME, SITE_DESCRIPTION, SOURCE_REPOSITORY, siteOrigin } from "@/lib/site";
import { FRONTIER_DISCOVERY } from "./visual-frontier";
import { DiscoveryManifestSchema, type DiscoveryEffect, type DiscoveryManifest } from "./schema";

/**
 * The single reviewed source for indexability, canonical paths, page copy and
 * release evidence. The effect registry remains authoritative for component
 * metadata and source locations; this manifest may only reference those slugs.
 *
 * Indexing is fail-closed. An entry marked "index" must pass every evidence gate
 * in lib/discovery/eligibility.ts, or the build fails instead of publishing.
 */
const rawManifest = {
  site: {
    name: SITE_NAME,
    collectionName: SITE_COLLECTION_NAME,
    origin: siteOrigin,
    language: "en",
    repository: SOURCE_REPOSITORY,
  },
  pages: [
    {
      kind: "home",
      path: "/",
      search: {
        primaryIntent: "learn",
        primaryQuery: "procedural react effects",
        relatedQueries: [
          "react visual effects library",
          "creative coding react components",
          "webgl ascii effect",
          "react animation components",
        ],
        title: "nullworx.space — UI Forge React effects",
        description:
          SITE_DESCRIPTION,
      },
      indexStatus: "index",
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "README.md",
        media: null,
      },
      lastModified: "2026-11-14",
    },
    {
      kind: "gallery",
      path: "/effects",
      search: {
        primaryIntent: "build",
        primaryQuery: "react effect library",
        relatedQueries: [
          "react visual effects",
          "react ascii component",
          "react text animation effects",
          "webgl react components",
        ],
        title: "UI Forge effect gallery — nullworx.space",
        description:
          "Explore nine approved UI Forge React effects: magnetic buttons, morphing type, ASCII and material studies, plus Refractive Type and Impossible Material.",
      },
      indexStatus: "index",
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "README.md",
        media: null,
      },
      lastModified: "2026-11-14",
    },
    {
      kind: "product",
      path: "/kits/bento-duo",
      search: {
        primaryIntent: "integrate",
        primaryQuery: "React bento grid source kit",
        relatedQueries: [
          "premium react bento components",
          "interactive bento grid source",
          "foil bento interface",
          "editorial React component kit",
        ],
        title: "Bento Duo 01 — Two interactive React bento kits | Nullworx",
        description:
          "Orbit Bento 02 and Foil Reactor: two original, editable React 19 and TypeScript bento kits with working interactions, install examples, MIT source and a one-time price.",
      },
      indexStatus: "index",
      evidence: {
        ownerApproval: "docs/bento-duo-01/README.md",
        rights: "docs/bento-duo-01/NOTICE.md",
        install: "docs/bento-duo-01/README.md",
        media: null,
      },
      lastModified: "2026-11-12",
    },
  ],
  effects: [
    {
      slug: "magnetic-focus",
      name: "Magnetic Focus",
      canonicalPath: "/effects/magnetic-focus",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "react magnetic button effect",
        relatedQueries: ["magnetic button react", "react pointer button", "react cursor interaction"],
        title: "Magnetic Focus: React magnetic button effect",
        description:
          "A pointer-attracted React button with bounded movement, soft light, keyboard and touch support, and a reduced-motion fallback.",
      },
      content: {
        summary:
          "Magnetic Focus is a small React interaction: a button leans toward the pointer inside a bounded field, then returns cleanly when the pointer leaves.",
        useCases: [
          "Primary calls to action that should feel tactile without moving off-target.",
          "Playful navigation or footer actions that reward a closer look.",
          "Keyboard and touch interfaces that need the same effect with a safe fallback.",
        ],
        install: [
          "Copy magnetic-focus.tsx, magnetic-focus.module.css and use-reduced-motion.ts into components/forge-factory-01/.",
          "Import MagneticFocus and pass a label plus an optional intensity; the usage example on this page compiles as shown.",
          "Keep the CSS Module beside the component and verify focus, Enter/Space and reduced-motion behavior.",
        ],
        limits: [
          "The pull is intentionally bounded; this is not a drag or physics simulation.",
          "Reduced-motion preference disables the visible attraction instead of hiding the control.",
          "The effect expects a browser with modern pointer and focus support.",
        ],
        rightsNote: "Application code is MIT-licensed. This study uses no third-party media.",
      },
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "README.md",
        media: null,
      },
      media: {
        status: "none",
        hostingRights: "not-applicable",
        indexingImpact: "none",
        note: null,
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "glyph-morph",
      name: "Glyph Morph",
      canonicalPath: "/effects/glyph-morph",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "react text scramble effect",
        relatedQueries: ["glyph morph react", "react text animation", "accessible text scramble"],
        title: "Glyph Morph: React text scramble effect",
        description:
          "A deterministic React text morph that resolves from scattered characters into accessible text, with a reduced-motion fallback.",
      },
      content: {
        summary:
          "Glyph Morph animates a headline through seeded character noise and lands on the real accessible text, so the final state never depends on animation.",
        useCases: [
          "Headline reveals that need a distinctive transition without losing selectable text.",
          "Status or label changes that benefit from a short burst of character noise.",
          "Editorial interfaces where the text must remain available to assistive technology.",
        ],
        install: [
          "Copy glyph-morph.tsx, glyph-morph.module.css and use-reduced-motion.ts into components/forge-factory-01/.",
          "Import GlyphMorph and pass the final text; durationMs, frameMs and seed control the deterministic sequence.",
          "Verify that the screen-reader copy and the reduced-motion state both show the final text.",
        ],
        limits: [
          "The sequence is deterministic for a given seed, text and timing; it is not random art generation.",
          "The animated glyph layer is cosmetic and hidden from assistive technology.",
          "Very long strings or very short frame intervals increase update cost; test on the target device.",
        ],
        rightsNote: "Application code is MIT-licensed. This study uses no third-party media or fonts beyond the site font packages.",
      },
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "README.md",
        media: null,
      },
      media: {
        status: "none",
        hostingRights: "not-applicable",
        indexingImpact: "none",
        note: null,
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "prism-text",
      name: "Prism Text",
      canonicalPath: "/effects/prism-text",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "react css gradient text effect",
        relatedQueries: ["animated gradient text css", "react spectrum text", "css text animation"],
        title: "Prism Text: React CSS gradient text effect",
        description:
          "Selectable CSS spectrum text with adjustable speed and saturation. No canvas, no image, and no animation dependency.",
      },
      content: {
        summary:
          "Prism Text is a pure-CSS material study: a selectable spectrum moves inside live text, with speed and saturation exposed as simple React props.",
        useCases: [
          "Expressive headings or quotes that still need normal text selection and copy.",
          "Editorial labels that benefit from a slow color drift rather than a moving layout.",
          "Interfaces that want a decorative text treatment without canvas or WebGL.",
        ],
        install: [
          "Copy prism-text.tsx and prism-text.module.css into components/forge-factory-01/.",
          "Import PrismText and pass text, speed and intensity; paused is exposed for user or preference control.",
          "Check color contrast at the chosen saturation; the included CSS freezes the sweep for reduced-motion users.",
        ],
        limits: [
          "The CSS honors prefers-reduced-motion automatically. The paused prop also supports an explicit pause control.",
          "The effect animates color, not layout, and is not a substitute for accessible contrast testing.",
          "No gradient image or canvas is used; the visible treatment is CSS.",
        ],
        rightsNote: "Application code is MIT-licensed. This study uses no third-party media.",
      },
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "README.md",
        media: null,
      },
      media: {
        status: "none",
        hostingRights: "not-applicable",
        indexingImpact: "none",
        note: null,
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "ascii-waves",
      name: "ASCII Waves",
      canonicalPath: "/effects/ascii-waves",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "video to ascii art webgl",
        relatedQueries: [
          "react ascii renderer",
          "webgl ascii shader",
          "colored ascii video",
          "ascii character field",
        ],
        title: "ASCII Waves: WebGL video-to-ASCII renderer",
        description:
          "Original procedural ASCII waves, plus a WebGL2 renderer for your browser-local video with density, pointer and playback controls.",
      },
      content: {
        summary:
          "ASCII Waves is the UI Forge character renderer at nullworx.space: a WebGL2 canvas samples source-colored video, maps it to a glyph atlas and exposes density and pointer controls.",
        useCases: [
          "Creative coding studies that need a source-colored ASCII treatment in the browser.",
          "Audio-visual or editorial pages that can provide a rights-cleared video source.",
          "Experimental interfaces that benefit from a live character field rather than a static image.",
        ],
        install: [
          "Copy renderer.ts and glyphAtlas.ts together; both files are required for the WebGL2 renderer.",
          "Create a canvas and a local or CORS-enabled video element, then call setVideo(video, true).",
          "Provision source media separately and call dispose() when the component unmounts.",
        ],
        limits: [
          "The renderer requires WebGL2; missing support and missing media show explicit fallback states.",
          "The source video is not included in the repository and is not a promise of hosted playback.",
          "Browser-local file selection stays in the browser; the application has no upload endpoint.",
        ],
        rightsNote:
          "Renderer and glyph atlas code are MIT-licensed. LOOP30 video is not included or redistributed; source-specific hosting rights remain unverified.",
      },
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "README.md",
        media: "MEDIA_PROVISIONING.md",
      },
      media: {
        status: "local-only",
        hostingRights: "unverified",
        indexingImpact: "fallback-only",
        note: "Original procedural waves run without video. Browser-local video uses the original renderer; no hosted footage or source-media rights are claimed.",
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "digital-wake",
      name: "Digital Wake",
      canonicalPath: "/effects/digital-wake",
      releaseState: "beta",
      indexStatus: "noindex",
      search: {
        primaryIntent: "learn",
        primaryQuery: "webgl particle wake effect",
        relatedQueries: ["fish particle trail", "canvas pointillism effect", "webgl particle study"],
        title: "Digital Wake: experimental WebGL particle study",
        description:
          "An experimental fish-bound particle wake with measured relative motion, manual fin regions and an explicitly Beta status.",
      },
      content: {
        summary:
          "Digital Wake is an experimental WebGL2 study that releases particles along manually defined caudal-fin regions, using measured relative motion rather than automatic anatomy detection.",
        useCases: [
          "Researching motion-led particle systems against a known source clip.",
          "Exploring ASCII, pointillism and hybrid views of the same wake.",
          "Reviewing the honest limits of manual fin-region authoring.",
        ],
        install: [
          "Treat this as a Beta reference, not a production package or a finished pointillism product.",
          "Provision the exact accepted LOOP30 video and matching sidecars through MEDIA_PROVISIONING.md.",
          "Keep manual fin-region review in the loop; arbitrary footage does not produce verified wake emission.",
        ],
        limits: [
          "The release remains Experimental/Beta; it is excluded from the sitemap and search indexing.",
          "Source-specific commercial hosting and redistribution rights for the exact video remain unverified.",
          "Manual caudal sectors do not certify anatomy, and 122 of 900 motion frames lack supported fin regions.",
        ],
        rightsNote:
          "Code is MIT-licensed. The exact LOOP30 video, masks, motion data and derivatives are local-only; source-specific hosting and redistribution rights remain unverified.",
      },
      evidence: {
        ownerApproval: "CONSOLIDATION_REPORT.md",
        rights: "LICENSE",
        install: "MEDIA_PROVISIONING.md",
        media: "MEDIA_PROVISIONING.md",
      },
      media: {
        status: "blocked",
        hostingRights: "unverified",
        indexingImpact: "blocks-index",
        note: "Beta status and unverified source-media hosting rights keep this URL out of the sitemap.",
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "ashfall-type",
      name: "Ashfall Type",
      canonicalPath: "/effects/ashfall-type",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "react text dissolve effect",
        relatedQueries: ["css text dissolve", "react material transition", "canvas text effect"],
        title: "Ashfall Type: React text dissolve effect",
        description:
          "A text surface gives way to rising fragments with Canvas2D and CSS fallbacks, while the accessible DOM stays readable.",
      },
      content: {
        summary:
          "Ashfall Type is a one-shot material study: the headline releases small fragments upward under a scroll clock, then settles into the next surface.",
        useCases: [
          "Section transitions that need a tactile, material release rather than a slide.",
          "Editorial or product reveals that can give the motion a dedicated scroll lane.",
          "Studies that need an accessible DOM fallback while canvas particles animate.",
        ],
        install: [
          "Copy components/material-effects and components/material-core into your project, preserving both directories.",
          "Use AshfallType inside the authored sticky scroll lane and keep the CSS Module imports and font variables.",
          "Test the reduced-motion and missing-context fallbacks before shipping the section.",
        ],
        limits: [
          "The clock is designed for a bounded scroll lane and one complete motion, not an infinite loop.",
          "Canvas2D and font loading affect the rendered fragments; test on the target viewport.",
          "It does not capture or dissolve arbitrary DOM; the authored surface is the contract.",
        ],
        rightsNote:
          "Code is original repository work under the MIT licence. No third-party media is used by this study.",
      },
      evidence: {
        ownerApproval: "docs/material-suite/WAVE_A_INTEGRATION.md",
        rights: "docs/material-suite/SOURCE_RIGHTS.md",
        install: "docs/material-suite/WAVE_A_INTEGRATION.md",
        media: null,
      },
      media: {
        status: "none",
        hostingRights: "not-applicable",
        indexingImpact: "none",
        note: null,
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "seam-erosion",
      name: "Seam Erosion",
      canonicalPath: "/effects/seam-erosion",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "react section transition effect",
        relatedQueries: ["css clip path transition", "react scroll animation", "canvas edge dissolve"],
        title: "Seam Erosion: React section transition",
        description:
          "An edge breaks into pieces, revealing another surface through a CSS-backed wipe and Canvas2D fragments with a readable fallback.",
      },
      content: {
        summary:
          "Seam Erosion is a section transition: a straight CSS wipe exposes the next surface while small fragments leave the original edge under a one-shot scroll clock.",
        useCases: [
          "Section changes that need a directional reveal with physical weight.",
          "Editorial layouts that can dedicate a sticky lane to the transition.",
          "Material studies that need a CSS control and an accessible source surface.",
        ],
        install: [
          "Copy components/material-effects and components/material-core into your project, preserving both directories.",
          "Place SeamErosion inside the authored sticky scroll lane and preserve the CSS Module imports.",
          "Exercise the CSS, candidate and reduced-motion states at desktop and phone widths.",
        ],
        limits: [
          "The effect needs a bounded scroll lane; it is not a drop-in page transition.",
          "The fragment behavior is tuned for the approved surface geometry.",
          "It does not infer or capture arbitrary sections from a remote page.",
        ],
        rightsNote:
          "Code is original repository work under the MIT licence. No third-party media is used by this study.",
      },
      evidence: {
        ownerApproval: "docs/material-suite/WAVE_A_INTEGRATION.md",
        rights: "docs/material-suite/SOURCE_RIGHTS.md",
        install: "docs/material-suite/WAVE_A_INTEGRATION.md",
        media: null,
      },
      media: {
        status: "none",
        hostingRights: "not-applicable",
        indexingImpact: "none",
        note: null,
      },
      lastModified: "2026-11-09",
    },
    {
      slug: "sediment-reveal",
      name: "Sediment Reveal",
      canonicalPath: "/effects/sediment-reveal",
      releaseState: "approved",
      indexStatus: "index",
      search: {
        primaryIntent: "build",
        primaryQuery: "react image dissolve effect",
        relatedQueries: ["css image reveal", "canvas grain dissolve", "react scroll image transition"],
        title: "Sediment Reveal: React image dissolve effect",
        description:
          "A mineral image dissolves in layered grain, revealing another surface with a local WebP asset and an accessible fallback.",
      },
      content: {
        summary:
          "Sediment Reveal is an image material study: three depth bands follow different paths out of a mineral surface, revealing the next ground underneath.",
        useCases: [
          "Hero image transitions that need layered depth instead of a flat fade.",
          "Editorial reveals that can use the included mineral-study raster.",
          "Material studies that need a CSS tiled-grain control and a source fallback.",
        ],
        install: [
          "Copy components/material-effects and components/material-core into your project, preserving both directories.",
          "Copy public/material-wave-a/mineral-study.webp and keep the documented local asset path.",
          "Use SedimentReveal inside the authored scroll lane and test image failure and reduced motion.",
        ],
        limits: [
          "The included raster is part of the effect contract; arbitrary image URLs are not certified.",
          "The particle bands are tuned for the approved center-cover crop and surface geometry.",
          "Image loading and canvas support affect the reveal; missing assets show the accessible fallback.",
        ],
        rightsNote:
          "Code and the mineral-study WebP are available with this repository under its MIT terms. No stock photograph or reference photograph is used.",
      },
      evidence: {
        ownerApproval: "docs/material-suite/WAVE_A_INTEGRATION.md",
        rights: "docs/material-suite/SOURCE_RIGHTS.md",
        install: "docs/material-suite/WAVE_A_INTEGRATION.md",
        media: "docs/material-suite/SOURCE_RIGHTS.md",
      },
      media: {
        status: "included",
        hostingRights: "cleared",
        indexingImpact: "none",
        note: "The shipped WebP is identified as original imagegen output and is available for reuse with the repository under its MIT terms.",
      },
      lastModified: "2026-11-09",
    },
    ...FRONTIER_DISCOVERY,
  ],
} satisfies DiscoveryManifest;

export const DISCOVERY_MANIFEST: DiscoveryManifest = DiscoveryManifestSchema.parse(rawManifest);

export function getDiscoveryPage(path: "/" | "/effects" | "/kits/bento-duo") {
  return DISCOVERY_MANIFEST.pages.find((page) => page.path === path);
}

export function getDiscoveryEffect(slug: string): DiscoveryEffect | undefined {
  return DISCOVERY_MANIFEST.effects.find((effect) => effect.slug === slug);
}

export function getDiscoveryEffectByPath(path: string): DiscoveryEffect | undefined {
  return DISCOVERY_MANIFEST.effects.find((effect) => effect.canonicalPath === path);
}
