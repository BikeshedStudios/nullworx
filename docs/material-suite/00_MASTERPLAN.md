# UI FORGE — MATERIAL EFFECTS MASTERPLAN V1

**Status:** PLAN / FIVE RED-TEAM PASSES / NO IMPLEMENTATION AUTHORIZED BY THIS DOCUMENT ALONE  
**Date:** 2026-11-01  
**Repository:** `BikeshedStudios/nullworx`  
**Verified remote main:** `2bac60e6b2de8f2fb74a3881502ce3c7a9154019` (at planning time)  
**Owner scope:** implement all nine candidate visual effects, in bounded independent proofs; preserve accepted effects and local WIP.  
**Owner art rules:** no SVG in new effects; existing matte white/purple/teal UI Forge stays untouched; visuals must feel like real content/material transformation, not stock overlays.

## 0. Outcome and non-goals

**North star:** ordinary React text, image, bento media or section surfaces behave like distinctive digital/physical materials during interaction. The *source itself* must change — fill, alpha, color, shadows and material boundary — rather than spraying particles over unchanged content.

**Nine effects in scope:**
1. **Ashfall Type** — text becomes rising, wind-advected ash/paper fragments.
2. **Seam Erosion** — a section boundary breaks apart to expose the next section.
3. **Kintsugi Fracture** — image/media cracks into irregular shards with thin glowing seams.
4. **Paper Peel** — raster media curls/peels like physical paper, revealing a true reverse/underlay.
5. **Molten Media** — image A transforms into image B through a physical-looking liquid/heat boundary.
6. **Ink Capillary** — text/media bleeds outward through branching capillary ink paths.
7. **Ghost Type Trails** — source-authored typography sheds delayed coherent echoes in depth, without duplicating live accessibility text.
8. **Datamosh Handoff** — former image motion contaminates the incoming image using deliberate frame feedback.
9. **Sediment Reveal** — an image/media region erodes into layered, source-colored dust/grit and exposes another surface.

All nine must each receive one proof and individual verdict. **This is not permission to integrate all nine as production-ready effects.** The owner's visual decision is authoritative; technically passing effects can be REVISE, PARK or KILL.

**Non-goals:** remake Holographic Foil, repair Particle Morph, modify accepted ASCII Waves/Digital Wake, ship a generic effects engine, copy Codrops art/media, introduce `Three.js`/R3F/GSAP to every effect, generate vector/SVG artwork, produce a SaaS/editor, redesign homepage.

## 1. The ten-stack reasoning (explicit)

1. **Socratic:** What is the actual job? Make existing design surfaces feel materially alive, not increase the effect count. Ask of every demo: what source is changing, where is its original pixel coverage removed, and what is the visible consequence?
2. **Hegelian (thesis / antithesis / synthesis):** Thesis: implement nine visually rich effects. Antithesis: a unified mega-renderer makes them feel generic, tightly coupled and expensive. Synthesis: one *small* core for source capture, timelines, masks, scheduling and test receipts; nine independent rendering behaviors and visual gates.
3. **Popperian:** Kill if the resulting frame is indistinguishable from overlay, wipe, blur, alpha-fade or a static screenshot. For Ashfall specifically, a disappearing source pixel must correspond to material leaving the source; for Paper Peel, the sheet must actually curve and occlude an underlay.
4. **Causal inference:** Compare (a) current baseline, (b) trivial control with opacity/crossfade/blur, (c) candidate, on the same art, geometry, timing and viewport. Attribution is impossible if animation, composition, assets and lighting all change at once. Only change one visual mechanism per proof.
5. **Systems architecture:** Separate `driver → phase machine → source/mask → material renderer → compositor → fallback`. Common types and lifecycles; effect-specific math/rendering. No silent screenshotting of arbitrary DOM.
6. **Cybernetics:** Expose phase, progress, live pixel-coverage difference, active particles/shards, draw time and fallback reason in dev mode. Observability is for diagnosis, not endless tuning.
7. **Bayesian calibration:** Current confidence: high that component-local ash/erosion/melt can be rendered; medium for coherent paper/fracture/ink; lower for convincing datamosh and legible ghost text across browsers. Update confidence with 5–10 s recorded motion at fixed art and blinded side-by-side, not green CI.
8. **Information theory/MDL:** Prefer a few meaningful controls and deterministic presets to 20 sliders/3 graphics runtimes. If an effect needs 1000 lines of scaffolding just to resemble a blur, rethink the representation.
9. **Design of Experiments:** Lock fixtures; record the same motion path (forward, hold, reverse, re-entry); test one physical-looking mechanism at a time; use identical comparison scripts and browser environment. Pair with a CSS-only control.
10. **Adversarial testing:** Attempt broken cases: rapid scroll reversal, multiple simultaneous effects, hidden tab, resize mid-play, 320 px, reduced motion, missing texture, WebGL loss, slow CPU, alpha seams, repeated mount/unmount, touch interaction and global scroll/listener leaks.

## 2. Verified stack and reusable research

As checked on GitHub main: Next.js 16.4.3, React 19.3.1, TypeScript, `motion` 14.7.1, Vitest, Playwright, existing WebGL2/Canvas ASCII and Digital Wake implementations. `pnpm verify` runs lint, typecheck, registry validation, unit tests, Next build and secret scan. Existing production registry in `lib/effect-registry.ts`. **Do not register lab candidates there.**

| Source | Verified useful content | Licence/decision |
|---|---|---|
| https://github.com/codrops/SeamTransitions | 11 scroll-driven seam transitions incl. ink bleed, crumble, fray, kintsugi, sediment | Repo says MIT for code; demo uses GSAP/ScrollSmoother. Rebuild minimal behavior on `motion`/existing WebGL, do not vendor bundled GSAP or sample photos. |
| https://github.com/codrops/LookbookHoverEffects | 8 jagged/melting/folding/glass/channel-style image swaps | Repo MIT code; GSAP separately licensed; photos/fonts separate. Inspect algorithms, not blindly import demo distribution. |
| https://github.com/NourMtir0722/Paperlab | Actual 3D paper deformer and `damage` separate from flame/ash | Apache-2.0 with NOTICE; heavy `three` + R3F and GSAP peer requirements. Benchmark isolated minimal algorithm, **no blanket install**. |
| https://github.com/evoluteur/flow-fields | Canvas Perlin/curl field motion and thin trails | MIT. Good small-scale transport reference for Ashfall/Sediment/Ghost. |
| https://github.com/odedbahiri-arch/recstudio-particles | GPGPU particle target sampling and curl transport | MIT; Three.js vendored in upstream demo. Reference only unless native implementation is inadequate. |
| https://github.com/niccolofanton/data-mosh | True-ish encoder-analogue motion vector, feedback, residual data-mosh pipeline | MIT code, third-party assets excluded. Use lean demo for motion-buffer technique; restrict licensing claims to verified code. |
| https://github.com/whatisjery/atelier-ui | DOM/WebGL alignment and shared canvas architecture | Some components are paid/proprietary even though many are MIT; design reference only, never wholesale install. |

**Before copying any file**: pin upstream commit SHA, read LICENSE/NOTICE for exact file, enumerate bundled media/fonts/GSAP, record source URL, SPDX, modifications and notices. Maintain `THIRD_PARTY_NOTICES.md` as required. Anything unverified must be original implementation or excluded. Technical research does not authorize actual copying.

## 3. Common architecture — small and strictly bounded

### Explicit supported surfaces

- `text`: actual font-ready raster text supplied explicitly (single line initial target; multi-line after measured acceptance), CSS DOM mirror remains semantic and accessible.
- `image`: PNG/JPEG/WebP, rights-safe local fixtures; image orientation/color profile and alpha handled.
- `media-pair`: two raster sources with matched viewport/crop semantics.
- `section`: authored background raster/solid field + separate ordinary DOM content; do not claim arbitrary DOM pixel capture.

**No SVG anywhere in the new effects, including library transitive rendering, hidden `foreignObject`, masks or placeholder illustrations.** Existing project assets unchanged.

### State/time separation

```ts
type MaterialPhase = 'idle' | 'windup' | 'active' | 'settling' | 'complete' | 'error';
type MaterialTrigger =
  | { type: 'scroll-threshold'; enter: number; rearmBelow: number }
  | { type: 'hover' | 'click' | 'manual' };
type MaterialClock = {
  phase: MaterialPhase;
  phaseElapsedMs: number;
  totalElapsedMs: number;
  runId: number;
  playbackRate: number;
  paused: boolean;
};
type MaterialSource =
  | { kind: 'text'; text: string; font: string; color: string; shadow?: string }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'image-pair'; from: string; to: string; alt: string };
```

The scroll threshold **triggers** playback; it does *not* determine each rendered frame. `idle → windup → active → settling → complete`. Once active, reverse scrolling cannot scrub animation backward, retrigger it or reveal source content prematurely. Only after `complete` can an explicit Reset or a hysteresis-based rearm (exit below the lower threshold) start a new run. Each effect documents its intended restart behavior; use a one-shot default for cinematic effects. Manual time control in the lab is for reproducible inspection, not a production scroll contract. Offscreen/hidden tab may pause the internal clock; **no giant catch-up delta** on return. Reduced motion jumps to a useful, readable stable state, avoiding disappearance of essential content.

### Source integrity and material conservation

A single authoritative coverage/damage function controls original alpha, fragmentation and source shadow/color channels. Generic formula is `sourceCoverage = clamp(1 - damage, 0, 1)`; particle/shard visibility is derived from the corresponding damaged cells. Do not fade an overlay while the source survives beneath it.

Text shadow cannot be left as a separate intact DOM shadow when glyphs disappear. Use a bounded representation of text style in the raster/texture source, mask foreground+shadow as a unit, or supply an honest limitation/fallback. Any copied text remains inaccessible to assistive tech; the real semantic DOM text is kept once. Strict pointer-events none on visual overlay, original links/controls not covered.

### Spatial representation

Each effect selects its cheapest sufficient representation:
- 2D raster + mask + particles: Ashfall, Seam Erosion, Ink Capillary, Ghost Type, Sediment.
- Raster displacement + feedback: Molten Media, Datamosh Handoff.
- Triangulated/irregular shard mesh: Kintsugi Fracture.
- Deformable paper grid/mesh: Paper Peel.

No global generic node graph; keep WebGL resources within a bounded owner or a deliberately shared **single workbench context** if measured. Do not spin up nine always-active canvases in the production page. Lazy mount one preview at a time.

### Suggested small shared modules

```
components/material-core/
  types.ts                 # contracts, not framework
  trigger-clock.ts         # state machine + hysteresis
  source-raster.ts         # explicit text and raster source, font readiness
  coverage-mask.ts         # coherent source removal / compositing
  viewport-driver.ts       # scroll/visibility/resize/reduced motion
  resource-scope.ts        # canvas/WebGL lifecycle + cleanup
  evidence-hooks.ts        # dev-only state/FPS/snapshot instrumentation
components/material-effects/
  ashfall-type/
  seam-erosion/
  kintsugi-fracture/
  paper-peel/
  molten-media/
  ink-capillary/
  ghost-type-trails/
  datamosh-handoff/
  sediment-reveal/
app/lab/material-suite-01/
  page.tsx
  workbench.tsx            # A/B, original, candidate, CSS control
  lab.module.css
tests/material-suite/
  fixtures/                 # authored rights-safe raster art
  unit/
  e2e/
  visual/
docs/material-suite/
  00_MASTERPLAN.md
  SOURCE_RIGHTS.md
  VISUAL_RUBRIC.md
  wave-A.md
  wave-B.md
  wave-C.md
  05_RED_TEAM_LOG.md
```

**Not all modules should be created upfront.** Build as needed, shared only when used by 2+ effects and proven identical. Avoid touching `lib/effect-registry.ts`, homepage, existing original ASCII renderer and Digital Wake logic during experiments.

## 4. Per-effect rendering contracts and falsification gates

### E01 — Ashfall Type (first, establishes source coverage + clock)

**Surface:** hero heading and optional bento title. **Trigger:** scrolling crosses threshold (e.g., 0.62) with rearm below e.g. 0.25, exposed as authored settings. **Timeline:** idle → ~brief anticipation/windup → fracture → upward ash transport → settle/complete; exact durations tuned by reference footage, not declared as mandatory defaults.

**Visual:** intact typography incl. source color and shadow, intermittent char/paper edge, tiny source-derived fragments rotate and buoyantly rise with coherent wind field, camera-space depth bands (size, blur and velocity difference) and a slight perspective drift. No fire needed: ash semantics are adequate. Fragments spawn from *removed source cells* and evolve independently after birth; disappearance and debris causally correspond. Preserve a crisp readable initial state and actual disappearance, never duplicated text underneath.

**Implementation:** font-ready Canvas text raster; alpha + source-color/lighting channels; source damage texture seeded along irregular boundary, physically coherent wind vector, curl field, drag/buoyancy/gravity term, deterministic seed/replay, bounded particle pool and dt clamp. Draw 2D visual first; use WebGL only if particle/compositing profile demands it.

**Control proof:** simple alpha dissolve with the same duration and same headline. **Kill:** source remains behind fragments; wind is static confetti; rapid scroll changes the timeline; missing shadows; fragmented text doesn't look like text.

### E02 — Seam Erosion

**Surface:** background/section seam between fixed hero and following page; **no automatic destruction of hero links**. Scroll enters trigger window; progressive damage creates actual missing border, falling/lofting raster crumbs and immediate reveal of second section. Distinguish physically authored seam from generic linear-mask reveal. Build a clean seam with one erosion mechanism first, no 11 preset clones.

**Implementation:** 1D boundary field indexed by horizontal position + low-frequency distortion + high-frequency chips; mesh/image coverage mask; owned particle births only where boundary recedes; section stacking/clip. CSS-only wipe baseline. **Kill:** readable as `clip-path` wipe with noise; blocks nav; causes horizontal overflow or jump.

### E03 — Kintsugi Fracture

**Surface:** raster image in a card. Draw a finite planar Voronoi/hand-authored fracture map without SVG. Each shard owns polygon vertices/UVs and a stable centroid; drive crack reveal, tiny z separation and seam lighting. Thin luminous joints must read as discontinuity between *same source image shards*, not graphic lines painted atop intact pixels. Keep shard count bounded, seam width not dominating. Fall back to static image.

**Control:** simple crack-line overlay. **Kill:** looks like glass-shatter stock transition, cracks don't align with displaced content, triangle overlaps, geometry cracks at 320 px.

### E04 — Paper Peel

**Surface:** authored raster art front and optionally reverse; underlay is genuine secondary content. **Representation:** bounded deformable rectangular grid with UV-preserving roll/curl, paper thickness cue, coherent backface shading and cast/contact shadow; drag/scroll can control peel; clamp tilt. No fake CSS `rotateY` pretending paper bends. Use 2D/GLSL bend only if continuity and shadows hold; else isolated lightweight three implementation AFTER benchmark and dependency gate.

**Control:** rotated flat rectangle. **Kill:** stretches print, floats without contact shadow, clips corners, hidden underlay is the same artwork, requires hard-to-ship R3F stack for mediocre result.

### E05 — Molten Media

**Surface:** source image A to destination image B. Smooth, spatially nonuniform boundary follows color/temperature-like flow. Image A's coverage recedes exactly where B emerges, local displacement evolves during melt; no ghosted duplicate layers and no persistent image damage after completion. Motion trigger: hover/tap/explicit action, **not** forced pointer takeover.

**Control:** plain crossfade with same source imagery. **Kill:** only animated UV wobble plus opacity crossfade; shimmer or brightness blooms mask weak source change; tap never reveals the second state.

### E06 — Ink Capillary

**Surface:** raster typography or media edge. Simulate anisotropic spreading through a fixed sparse flow/permeability field (paper grain), with coherent thin branches and pooling. Front edge grows by path connectivity, not random circle stamps. Actual ink color/density changes happen in covered pixels; optional controlled bleed of original source edges. Reduced motion shows settled image/text.

**Control:** blur + expanding mask. **Kill:** resembles Gaussian blur, spider-web overlay or random tendrils unrelated to source. Bound compute by fixed low-res simulation and upscale with disciplined filtering.

### E07 — Ghost Type Trails

**Surface:** actual typography, with live DOM semantic mirror, visual texture echo history. Delay/decay follow coherent typography transformations. Depth from offset, scaling, color attenuation and optical focus, not just stacked transparent words. Continuous motion only while active (not perpetual nuisance), stable return state.

**Control:** CSS text-shadow / duplicate spans. **Kill:** looks like repeated text shadow or smear, illegible baseline, affects focus/selection, jarring frame reset.

### E08 — Datamosh Handoff

**Surface:** two image/video textures with authorized rights. Simulate inter-frame motion-prediction with held reference frame, blockwise motion displacement and quantized residual; explicitly describe as 'codec-inspired' unless actual encoded-frame perturbation is implemented. In controlled A→B handoff, old motion contaminates new image in a visually traceable way. Reset buffer deterministically on replay. Hard cap feedback history and memory.

**Control:** digital glitch RGB offset with same media. **Kill:** generic random glitch, no temporal carry-over, visual result depends entirely on a particular third-party demo video, unbounded buffer growth, photosensitive excessive flashing.

### E09 — Sediment Reveal

**Surface:** raster photo or card media with optional underlay. Split into a few meaningful sediment strata (coarse flecks, mid grains, fine dust), sampled from source pixels; drive crack/erosion boundary with coherent gravity/wind and depth-dependent settling. Material removed from exact image pixels as debris leaves. Avoid generic particle morph look.

**Control:** noise dissolve. **Kill:** generic confetti/noise over an unchanged photo, all grains same shape/motion, no material layering or final reveal.

## 5. Implementation waves — ALL NINE accounted for

All nine are planned, but Codex must not implement them in a single unbounded run. Each proof is separable; owner can reject individually.

**Wave A: Source conservation + physical departure**
- A1 Ashfall Type (timeline + masking + wind as foundation)
- A2 Seam Erosion (boundary growth + source removal)
- A3 Sediment Reveal (multi-scale debris + image conservation)

**Wave B: Material geometry and migration**
- B1 Kintsugi Fracture (irregular polygon shards)
- B2 Paper Peel (deformation, backface, shadows)
- B3 Ink Capillary (branch propagation, permeability)

**Wave C: Temporal/electronic transformations**
- C1 Molten Media (A/B source transition)
- C2 Ghost Type Trails (history and typography depth)
- C3 Datamosh Handoff (feedback/reference frame management)

Ordering is deliberately dependency-aware, **not** a promise that every candidate will pass. If owner KILLs a member, preserve evidence and continue to the next planned candidate; do not silently rebuild the killed effect. No more than one technical repair cycle and one independent re-review per proof. New worktree per wave to preserve local experiments; new branch from pinned origin/main or an approved local foundation commit (do not merge unapproved effects into each other). If a shared primitive is necessary, cherry-pick only that isolated reviewed primitive, with receipt.

### Wave-level contracts

- First action: read local `AGENTS.md`, `git status`, expected main commit, `pnpm-lock.yaml`, existing accepted effects; snapshot source/WIP hashes. Stop before any worktree collision.
- Create isolated lab routes: `/lab/material-wave-a-01`, `/lab/material-wave-b-01`, `/lab/material-wave-c-01`; select only one active renderer at a time; provide a genuine scroll lane and manual time preview.
- Per effect: 1 truly authored hero fixture, 1 bento/media fixture where appropriate, 1 simple control implementation, 1 candidate, actual slow/fast/reverse 5–10 s browser video.
- Controls: max 3 meaningful controls until owner approves the effect; use 2 excellent defaults rather than preset explosion.
- No source images generated or copied implicitly; local fixtures with explicit provenance; no network dependencies inside running effect.

## 6. Tests/receipts and visual rubric

### Technical invariants (unit/browser)

- **Pixel conservation:** pixels removed from authoritative source coverage correspond to visual fragments/shards/ink; outside-mask source remains unaffected. Compare mask coverage against pixel output; include alpha and shadow/style representation.
- **Clock semantics:** crossing `enter` once causes one windup and complete animation even if scrolling reverses mid-run. Re-arm only after completion and below lower threshold; trigger jitter cannot create duplicate runs. Pause in background without large catch-up.
- **Determinism:** frozen time/seed/source/viewport reconstructs the same output; external input shouldn't seed randomness per frame.
- **Accessibility:** semantic text and accessible links remain DOM; new visuals are aria-hidden and pointer-transparent; reduced-motion shows a readable stable end/initial pose; no flashing hazards.
- **Resilience:** resize mid-run, font reflow, DPR changes, lost WebGL context, asset failure, offscreen cleanup, repeated mount/unmount, multiple cards simultaneous, 320 px mobile and keyboard/touch.
- **Performance:** record actual FPS, median/p95 frame time, GPU vendor/renderer, canvas resolution, memory symptoms, render budget/degradation strategy. Use 60 FPS desktop and 30 FPS constrained-path as **targets**, not claims; reject sustained jank per realistic device evidence.
- **CI:** run `pnpm verify`, targeted `pnpm exec playwright test ...`, and `git diff --check`; collect source/LICENSE scan. Passing CI is *not* a visual endorsement.

### Visual review gate

Every effect must be shown in one **same-art A/B/C** contact sheet/recording:
- A: original content static;
- B: trivial control (CSS fade/blur/wipe);
- C: candidate effect.

Record at 1440, 390, 320 pixels; 100%-scale crop and motion video with start/windup/active/settling/end. Critique: (1) source physically changed? (2) beautiful default in ≤5 s? (3) unique from trivial CSS control? (4) clean source and shadows? (5) coherent motion? (6) responsive layout? (7) acceptable perf? (8) reusable on real product surface? Owner has final KEEP/REVISE/KILL.

**Release gate:** no new public registry entries, production homepage cards, npm publishing or merge without owner explicit visual approval. A good source proof is not a released product.

## 7. Five sequential red-team rounds and resulting revisions

### Red Team R1 — Artistic falsification

**Attack:** We can pass tests with fade + noise + a particle overlay, reproduce Batch A's mediocrity nine times.
**Failure evidence to seek:** real DOM source remains visible beneath fragments; presets hide weakness via glow; no baseline control.
**Revision adopted:** require unified damage/source coverage and direct B-vs-C trivial control comparison for all nine; record actual videos and owner gate; cap controls until visual acceptance.
**Retest:** for Ashfall verify identical pixels can't exist both intact and detached; for Molten candidate must outperform a crossfade; for Ghost candidate must outperform CSS text-shadow.

### Red Team R2 — Architecture/dependency assault

**Starting point after R1:** Every effect now needs stronger source masks, real fixtures and A/B/C evidence. The extra infrastructure itself could become the new problem.
**Attack:** A generic material graph, full Paperlab/R3F install, GSAP ScrollSmoother and nine mounted canvases devastate bundle size and interoperability.
**Failure evidence:** Next dev/build dependency conflicts; 9 contexts; loss of 320 px; third-party peer version collisions.
**Revision adopted:** spatial-representation-specific renderers; minimal shared clock/source/coverage only; lazy mount one active effect; reuse existing Motion; isolated Paper Peel feasibility spike before adding a geometry library; no GSAP requirement or DOM screenshot engine.
**Retest:** check dependency diff/lockfile, active WebGL context count, build size change, perf measurements and no heavy package imports from other effect entrypoints.

### Red Team R3 — Concurrency, scroll and lifecycle

**Starting point after R2:** We removed the mega-renderer and kept a small shared clock/source/compositor. That minimal clock becomes a single potential failure point if timing semantics are underspecified.
**Attack:** Reverse scrolling halfway through ash/curl produces frame rewind, double spawn, visible text beneath, stale state after tab sleep, repeat trigger storms.
**Failure evidence:** jump across phases, particle memory leak, incomplete source removal, 'one-way' animation glitches.
**Revision adopted:** explicit one-shot phase machine with hysteresis, runId, internal elapsed clock, dt clamp, pause/resume, single trigger authority; source masks include color and shadow; distinguish manual scrub lab from production behavior.
**Retest:** threshold cross ×5 rapidly, scroll reverse during windup/active, hide tab, resize during active, reenter after COMPLETE; exactly one completed run per arming.

### Red Team R4 — Legal/asset/security/provenance

**Starting point after R3:** Source capture and the unified damage compositor now work from declared raster assets. Their source provenance, transitive dependencies and upload pathways become the next attack surface.
**Attack:** MIT label on Codrops repo is mistaken for licensing GSAP bundle/photos/fonts; Paperlab NOTICE dropped; demo sources cross contaminated; untrusted uploads or canvas-taint break render/export.
**Failure evidence:** copied bundled media/GSAP without separate rights; lack of source-pin SHA; untracked binary files in PR; network image loads without CORS; accidental npm package licensing issues.
**Revision adopted:** source/asset ledger per effect with pinned upstream SHA, SPDX, source path, notices and modifications; author locally cleared fixtures; explicit local-only user media, validated file size/type/byte cap, no external uploads; safe error when CORS/taint occurs. No vendoring unreviewed full demos.
**Retest:** scan git diff and built client for secrets, notices, copied dependencies, third-party license mismatch, invalid images and fallback handling.

### Red Team R5 — Product value and release pressure

**Starting point after R4:** We now have a formally clean, repeatable, licensed architecture. This can still produce nine boring demos with impeccable receipts.
**Attack:** We build all nine, call them KEEP and ship a bloated playground without any effect a serious developer would want to use.
**Failure evidence:** effects cannot be applied to real headers/cards, only authored demos; 30 sliders per effect; performance budget unmeasured; owners cannot tell why candidate beats baseline.
**Revision adopted:** exactly nine **bounded proofs**, not nine promised products; two realistic component surfaces, composable input contracts, minimal controls, and per-effect independent owner approval; wave completion is evidence/report, not registry merge. Default kill rule: technically correct but aesthetically mediocre → PARK/KILL.
**Retest:** independent user can replace a fixture image/headline without modifying shader source; 320 px usable; candidate demonstrably better than trivial baseline; owner gives a reasoned KEEP.

## 8. Final red-team ledger (after R5)

| Main risk | Severity before → after | Remaining uncertainty | Control |
|---|---|---|---|
| Slop/fake visual quality | Critical → High | Subjective look still unproven | Same-art CSS baseline and owner video review |
| DOM shadow/source ghost | Critical → Medium | Browser font and CSS differences | Unified source coverage, font fixtures, text/shadow test |
| Nine-effect engine sprawl | Critical → Medium | Paper Peel geometry could need heavy dependency | Single-context lazy rendering, dependency gate, isolated feasibility |
| Scroll race/rewind | High → Low-medium | Safari/mobile lifecycle | explicit clock, hysteresis, lifecycle browser tests |
| License contamination | High → Medium | Third-party asset metadata might be incomplete | pinned source+asset ledger and fail-closed import |
| Runtime perf/mobile | High → Medium-high | Device GPU unverified | measured p95, degrade tiers, real device owner review |
| All nine mistaken for owner-approved | Critical → Low | Requires human taste | no registry/merge without explicit KEEP |

*These are qualitative risk judgments, not measured probabilities or guarantees. Five rounds were performed as adversarial design review of this plan; no implementation/evaluation has been run yet.*

## 9. Sprint handoff and continuation logic

For a Codex/Qwen/DeepSeek executor:
1. Read this document completely and local `AGENTS.md`. Record exact starting branch/commit and existing WIP hashes; stop at collisions.
2. Implement **Wave A only** (three independent effects) and report actual owner-facing previews. Do not jump to Wave B if Wave A is still incomplete; no automatic KEEPs.
3. Each effect: define fixture/control/candidate; implement source removal; measure; one hostile review → fix Critical/High → one re-review; CLOSE.
4. Preserve evidence artifacts in ignored local directories. Keep authored, license-safe test fixtures in tracked test assets if rights verified.
5. End Wave A with link, exact git status, affected paths, tests and one `OWNER_MATERIAL_WAVE_A_REVIEW_READY` verdict. No push/merge/deploy.
6. Wave B and C use separate follow-up execution windows; keep all nine on plan, with each proof receiving an independent verdict and owner inspection.

### Example CLI setup (run only after checking branch/worktree collisions)

```bash
SOURCE="$HOME/DevHub/experiments/ui-forge-main-consolidation-01"
TARGET="$HOME/DevHub/experiments/ui-forge-material-wave-a-01"
git -C "$SOURCE" status --short
git -C "$SOURCE" fetch --no-tags origin refs/heads/main:refs/remotes/origin/main
if test -e "$TARGET"; then
  echo 'STOP: target exists, preserve WIP'
else
  git -C "$SOURCE" worktree add -b experiment/material-wave-a-01 "$TARGET" origin/main
fi
```

Do not run destructive cleanup commands. No commits/pushes in the owner's existing WIP unless explicitly authorized; local review commits on the isolated experimental branch may be made when helpful and reported accurately.

## 10. Final verdict

**SMALL EXPERIMENT × 9, delivered as 3 independent waves.**

*Build the entire nine-effect research roadmap but release nothing by default.* Start Ashfall Type to prove material/source conservation, then transfer only proven low-level primitives. UI Forge should be a collection of unusually convincing, reusable interactions — not a counter of effects with green CI.