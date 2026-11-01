# UI Forge — Component Material FX 01
**Status:** IMPLEMENTATION PLAN / NOT BUILT / NOT OWNER-APPROVED  
**Repository:** `BikeshedStudios/nullworx`  
**Source base:** `main` at `2bac60e6b2de8f2fb74a3881502ce3c7a9154019` (verify/fetch again before implementation)  
**Scope:** Three partial-component modifiers — ASCII Parallax Diffusion, Scroll Smoosh, Edge Fray  
**Authority:** Owner selected this scope, prohibited SVG, rejected Batch A; implementation requires separate visual acceptance.

## Product hypothesis and falsification

> An existing headline or bento-image area can partially dissolve, smear or fray in response to scrolling, while its *real* DOM structure, accessibility, hit-testing and navigation remain intact.

The experience must look like material being transformed **from the content itself**, not a filter/particle layer hovering above it. The resulting component should be reusable in normal React layouts and work with scroll forward/backward.

**Smallest falsification surface:** One large single-line headline and one bento card, with the same three effects selectable side by side. No generic page builder, no full-screen shader gallery, no universal DOM screenshotting.

**Owner visual gate:** Each effect must impress in its first ~5 seconds. Technical PASS cannot override an owner KILL. Deliver actual motion recordings, not a screenshot-only verdict.

### Hard constraints

- **NO SVG in new effects:** no inline SVG, SVG masks, paths, filters, `foreignObject`, or SVG-based rasterization, including via hidden screenshot libraries. Existing unrelated UI Forge markup stays unchanged.
- Do not change approved `main` effects: Magnetic Focus, Glyph Morph, Prism Text, ASCII Waves, Digital Wake.
- Preserve the original `components/white-journey/original-ascii/renderer.ts` and its glyph atlas. Study/reuse techniques via *new focused modules*, not by rewriting the owner-accepted renderer.
- React 19, TypeScript, Next 16, CSS Modules, WebGL2/Canvas2D where useful, existing `motion`. No new large rendering framework, paid service, or unlicensed assets.
- Avoid bloated UI: use a unified light/offwhite, purple, teal workbench; 3 presets initially, a few working controls; no inert controls.
- Keep real HTML for semantic content, selection, keyboard navigation, and links. Visual overlays are `pointer-events:none` and `aria-hidden`.
- Isolated branch/worktree; no production registry addition, merge, push, release, or deployment without separate owner authorization. Plan is the only authorized GitHub publication at this stage.
- Never `git reset --hard`, `git clean`, delete WIP, or overwrite historical branches.

## Confirmed repository integration points

Read before editing:
- `package.json`: `motion`, `pnpm verify` and browser test tooling already exist.
- `lib/effect-registry.ts`: only approved effect routes are registered; **do not change this for a lab proof**.
- `app/effects/[slug]/page.tsx`: established production effect routing; avoid until approved.
- `components/white-journey/effect-cards.tsx`: production catalog; do not touch.
- `components/white-journey/original-ascii/renderer.ts`: existing glyph rendering source of truth; read, do not modify.
- `app/globals.css`: approved offwhite/purple/teal theme; reuse design tokens.
- `ADDING_AN_EFFECT.md`: existing effect registry/verification conventions.
Confirm all paths against the local checkout and record any differences before implementation.

## Technical contract: explicit supported surfaces

V1 supports **one-line headings**, **explicitly supplied raster images** (PNG/JPEG/WebP), and **decorative parts of a bento card**. Not arbitrary live DOM screenshotting.

- The owner supplies explicit text or a raster source; do not attempt to capture live complex DOM through `html2canvas`/SVG.
- The native heading/link/image remains the accessible and layout-owning element.
- Effect layer uses aligned Canvas/WebGL texture or a contained raster layer; isolate a bounded affected region (e.g. the right 35%).
- Hide/reveal only the visually substituted part of the original using scoped CSS `mask-image` gradients or an equivalent non-SVG mechanism; **no double text**, visible seam, ghosted duplicated baseline or inaccessible replacement. Restore intact original on renderer failure.
- Avoid clipping the effect prematurely: define an intentional overflow margin for fragments while keeping viewport horizontal overflow safe.
- Raster text source must match real layout (font load, kerning, size, line-height, letter spacing) sufficiently to survive close inspection. Start single line; treat multiline, variable-font reflow and complex shaping as unsupported until tested.
- Measure source rect, resize and device-pixel-ratio changes; clamp backing texture size and use a bounded pixel/particle budget.
- All scroll-to-render state is scoped to the component. Provide a manually controlled progress path so screenshots/tests can precisely replay any frame.

### Shared motion state

Minimal data shape, not a requirement for a framework:
```ts
type MaterialMotion = {
  progress: number;      // clamped 0..1, monotonic with scroll input
  velocity: number;      // signed, bounded, px/s or normalized documented units
  direction: -1 | 0 | 1;
  active: boolean;       // intersection, visibility, reduced-motion state
};
type Region = { edge: "left" | "right"; width: number }; // fraction 0..1
```

Use `motion` `useScroll({ target, offset })` when applicable, with a bounded `useSpring` for smoothing. Avoid React state updates every animation frame; use refs/motion subscriptions plus a single owned `requestAnimationFrame` loop. Unsubscribe and release resources on unmount. Offscreen content stops work. Reduced-motion must retain readable content and a static fallback.

## Effect A — ASCII Parallax Diffusion (priority 1)

**Look:** As a headline enters/leaves the viewport, its right ~35% breaks into source-colored glyph fragments. Fragments move in 2–3 depth bands, shearing in the scroll direction, dispersing and fading. Reverse scroll precisely rebuilds the identical headline.

Algorithm sketch:
1. Rasterize explicitly supplied heading text to offscreen Canvas2D after font readiness. Sample source luminance/alpha/color; derive glyph cells and stable seeds.
2. Cache source cells and their baseline positions. Respect initial text glyph shapes; don't emit glyphs from empty pixels.
3. Use a spatially continuous dissolution boundary within `Region`, seeded deterministically. Make `progress=0` visually identical to original, `progress=1` visibly diffused only in target region.
4. For each valid sampled cell compute source-derived glyph, position, color, alpha and bounded offset. Displace according to signed scroll direction/depth with deterministic seeded variation; no frame-to-frame random jitter.
5. Composite with the original masked DOM. Avoid alpha/brightness seam or a second duplicate heading. `progress=0` and reverse recovery must reproduce the baseline.
6. The accepted ASCII renderer should remain unmodified. It is a video-wide full-screen renderer and may not be directly reusable for partial text; reuse atlas or glyph-selection *ideas* where useful, not a rewrite or imported heavyweight engine.

**First API target (illustrative, not already implemented):**
```tsx
<AsciiDiffusionText
  text="NOTHING STAYS STILL."
  trigger="scroll"
  region={{ edge: "right", width: 0.35 }}
  density="fine"
  depth={3}
  strength={0.8}
  reversible
/>
```

**Kill/revise:** looks like random characters on top of unmodified text, loses text identity, visibly doubles source text, irreversible/erratic motion, or fails 320px.

## Effect B — Scroll Smoosh (priority 2)

**Look:** Real headline pixel strips stretch/lag in the direction of scroll. Faster scrolling creates greater localized deformation; on stop they spring back. No mere CSS scaleX or blur.

Implement a bounded strip-based Canvas texture displacement or small authored WebGL shader. Map signed velocity to displacement with saturation, critically damped spring return, and explicit max distortion. Use the same source text, alignment and region mask from Proof A; avoid coupling Smoosh to the glyph renderer. Stop and reverse quickly without overshoot spikes.

**Controls:** sensitivity, viscosity, max displacement, recovery. **Kill/revise:** simply looks like `scaleX`, blur, or bad kerning, flickers at rest, or can remain deformed after scroll stops.

## Effect C — Edge Fray (priority 3)

**Look:** The right or left edge of a bento card's **raster image / decorative media** frays into source-colored pixels and glyphs drifting from that edge. Text, buttons, links, focus ring and layout are unchanged.

Sample the valid image texture near the chosen edge. Emit a bounded, seeded fragment field, with edge distance and progress determining which source pixels detach. Use clipped or masked original media plus a pointer-transparent overlay. Support source image loading failures and image aspect ratio. Do not fragment unrelated DOM.

**Controls:** side, fray width, fragment size, drift, fade. **Kill/revise:** appears as static noise at the border, lacks source color/edge correspondence, obscures a CTA, or causes layout changes.

## Experiments and variants

Build **the same test stage**, not three giant independent editors:
- Hero: one striking single-line headline, fixed text and font, 1440/390/320 captures.
- Bento: an original, rights-safe locally authored raster artwork with heading, body, clickable CTA.
- Tabs to switch A/B/C; a real scroll lane and deterministic manual progress slider using the **same renderer/update path**.
- Keep controls to region width, intensity and one effect-specific knob; expose reset. Default presets need to be visually authored, not just valid numeric values.
- One active effect at a time; no stacked effect performance attribution.
- Include a visible debug toggle (only in lab) for region boundary/source rect, active cell count, current progress and signed velocity.

### Suggested file budget (adjust after inspection)

```
app/lab/material-fx-01/
  page.tsx
  workbench.tsx
  lab.module.css
components/material-fx/
  scroll-driver.ts
  text-raster.ts
  region-mask.ts
  ascii-diffusion.tsx
  scroll-smoosh.tsx
  edge-fray.tsx
  presets.ts
  material-fx.module.css
tests/unit/material-fx.test.ts
tests/e2e/material-fx.spec.ts
docs/COMPONENT_MATERIAL_FX_01_REPORT.md
```

This is a **budget, not an obligation**: fewer modules are better if meaningful boundaries stay testable. Do not add a universal animation runtime or generic DOM serializer.

## Bounded sprint sequence

| Gate | Change | Acceptance / stop |
|---|---|---|
| 0 — Preflight | Inspect `AGENTS.md`, git status, baseline hashes; make isolated worktree from plan commit. | No worktree collision, no changed original WIP. |
| 1 — Scroll + stage | Functional scroll progress/velocity, manual progress, hero and bento stage. | Same state path for scroll and slider; no runaway renders. |
| 2 — A: ASCII Diffusion | Source-aware glyph sampling, masked DOM, deterministic depth breakup. | Right region visibly dissolves; zero duplicate text; reverse reconstruction. |
| 3 — B: Smoosh | Velocity-coupled strips and spring recovery. | Slow vs fast scroll visibly different; rest returns intact. |
| 4 — C: Edge Fray | Raster-edge sampling with source-color fragment births. | Only media edge frays; CTA remains active; mask stays bounded. |
| 5 — Verify + review | Unit/browser/evidence/perf, one hostile review, Critical/High repair, single re-review. | `OWNER_MATERIAL_FX_VISUAL_REVIEW_READY` / `PARTIAL_PROOF` / `BLOCKED`. |

**Scope cuts:** If time or quality is constrained, finish A properly and mark B/C `NOT_IMPLEMENTED` or `PARTIAL_PROOF`. Never label placeholder tabs as finished effects. Do not open-endedly expand controls.

## Acceptance tests (objective)

1. `progress=0`: source intact; `progress=1`: affected region transformed, rest unchanged.
2. Determinism: same input `(progress, seed, source size, region)` yields same state/frame. Forward → back recovers without missing pixels or retained opacity.
3. Mask correctness: no glyph origins outside valid source alpha and selected region; fragment overlays do not capture pointer events; link/keyboard activation works while effect is active.
4. Smoosh uses scroll velocity rather than only progress. Test positive/negative velocity, pause, stop, and bounded recovery.
5. Edge Fray uses colors from its own source image; no particles spawned from the header or text sections.
6. Font readiness, resize, scroll range changes, DPR/canvas resizing, WebGL unavailable (if WebGL used), offscreen pause, context loss recovery, reduced motion, teardown/remount.
7. No SVG/new `foreignObject` paths or third-party screenshot libraries. Existing site assets outside new effect scope untouched.
8. Visually review 1440px, 390px, 320px plus actual recordings of slow forward, fast forward, stop, reverse. Tests passing **do not** prove beauty.
9. Capture real hardware/browser, FPS, median/p95 frame time, memory/resource symptoms, and fallback state. Don't claim a 60-FPS pass from a theoretical target. Avoid per-frame full DOM remeasure or CPU full-resolution readbacks.
10. Regressions: all prior five production effects render as before, and `main`/other experiments remain untouched.

**Commands:** `pnpm verify`, targeted `pnpm exec playwright test tests/e2e/material-fx.spec.ts`, `git diff --check`. Use repository-specific scripts after inspecting them.

### Visual acceptance thresholds

- A: within five seconds, visible source-derived ASCII decomposition followed by clean exact reassembly.
- B: unmistakable scroll-energy-linked stretching without generic blur.
- C: physically coherent source-edge breakup, not border noise.
- If failed: `REVISE` or `KILL` regardless of test count. Keep individual independent verdicts.

## Evidence and final deliverables

- Running URL `http://127.0.0.1:<verified-port>/lab/material-fx-01`, exact start command.
- A/B/C actual browser recordings and 1440/390/320 screenshots.
- Code changeset, baseline file hashes, test logs, performance receipt, known limitations.
- `docs/COMPONENT_MATERIAL_FX_01_REPORT.md` with PLAN → CHANGESET → VERIFY → HOSTILE REVIEW → VERDICT and per-effect technical verdict.
- Only owner can assign final visual KEEP. Do not push code, merge, or deploy without follow-up permission.

## Final kill condition

If the proposed effects do not feel like a **real component breaking apart while its interface still works**, do not try to salvage them with more gradients, glow, random particles or controls. Report the visual failure and stop.

**Default build order:** A → B → C. **Next owner action:** inspect motion clips and assign KEEP / REVISE / KILL.
