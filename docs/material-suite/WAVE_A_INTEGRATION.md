# Approved Wave A integration

The owner approved **Ashfall Type**, **Seam Erosion** and **Sediment Reveal** for
main on 2026-11-02. This supersedes the earlier experiment report's engineering
REVISE recommendations. The only requested artistic change is the source image
shared by CSS Tiled Grain Dissolve and Sediment Reveal.

## Plan and boundaries

Base: `2bac60e6b2de8f2fb74a3881502ce3c7a9154019` (`origin/main`).
Approved experiment: `7d7bf382201b7600f284c78b42779233768a100e`.
Masterplan: `e5098ee1094d006678f44665b466f69843b38b0f`.
Branch: `integration/material-wave-a-release-01`.
Worktree: `/home/swirky/DevHub/experiments/ui-forge-material-wave-a-release-01`.
The suggested branch/worktree already contained WIP and was preserved.

Preflight inventories all eight existing worktrees, their HEADs, status,
tracked/staged diff hashes and modified/untracked file hashes. Original Wave A is
clean at its approved commit. Factory, Batch A/B, material-fx/ASCII Diffusion,
Holographic Foil WIP, the earlier integration WIP and both main consolidation
checkouts remain preserved. The post-work preservation receipt checks the same
files and hashes. The baseline bundle measurement uses a separate detached
worktree, never an existing checkout's build directory.

The eleven accepted material source/CSS files are copied byte-for-byte. They
include the Canvas2D raster source, disjoint coverage mask, compositor, bounded
particle renderers, one-shot clock, lifecycle hook and authored surface markup.
There are no shader changes or new WebGL contexts. Defaults remain 380ms wind-up,
2500ms breakup, 5400ms total, trigger 0.62, rearm below 0.20 after completion,
40ms delta clamp and the existing colors/text. Three depth/stratum bands,
source-damage behavior, fallback, reduced motion and cleanup are unchanged.

Only production wrappers, settings/source UI, registry/cards, installation copy,
tests, documentation and the replacement asset are added. No new engine,
dependency, homepage layout or accepted-effect implementation is changed.
Unapproved experiments are excluded from canonical routes and imports.

## Artwork

The old `public/material-wave-a/strata.png` is an original procedural PNG with
flat landscape shapes; it is not an SVG file. The new image is a detailed raster
mineral specimen on warm limestone, with fractured metallic faces, granular
texture, directional light, contact shadow and restrained violet/teal reflection.
It is original built-in imagegen output, without a reference photograph or
external stock asset. A final framing-only correction leaves the complete object
inside the narrow mobile center crop. The historical artwork, intermediate
raster and generation originals remain preserved locally.

Shipped asset: `public/material-wave-a/mineral-study.webp`, 1619 × 971,
191,302 bytes, SHA-256
`7821ec1ef7053b25259421e746a533e001702df081a113ac38db24bb0542edba`.
See [SOURCE_RIGHTS.md](SOURCE_RIGHTS.md) and [ARTWORK_PROMPT.txt](ARTWORK_PROMPT.txt).
All original/CSS/candidate comparisons use this one source through the same
approved center-cover capture. Before/after browser evidence substitutes only
the historical image response, preserving the integrated CSS algorithm and crop.

Exact changed-file inventory: [CHANGED_FILES.txt](CHANGED_FILES.txt).

## Production integration and reuse

Routes: `/effects/ashfall-type`, `/effects/seam-erosion`,
`/effects/sediment-reveal`. The registry contains exactly eight canonical effects.
Each new route includes play/pause/resume, reset, exact-time inspection,
original/CSS/material comparison, semantic source fallback and the actual
copyable source closure. The public React components expose typed text/color or
local image/alt props and optional controller/status/comparison props. Gallery
navigation establishes the route at the top before the scroll clock mounts.

The installation example includes both component directories, React 19.3,
CSS Modules, explicit font imports/variables, an authored sticky scroll lane and
a real destination for the surface links. Sediment's source asset must also be
copied to `public/material-wave-a/`. These are the accepted authored surfaces;
arbitrary DOM screenshots, rich-text capture and automatic destruction of an
arbitrary section are outside their contract.

## Verification and hostile review

Reproduction:

```sh
pnpm install --frozen-lockfile
pnpm media:provision --experiments /home/swirky/DevHub/experiments
pnpm verify
E2E_PORT=3332 pnpm exec playwright test --reporter=line
pnpm start --port 3331
node scripts/review-material-integration.mjs capture
node scripts/review-material-integration.mjs measure
# Start the separately built base worktree on 3333, then:
node scripts/review-material-integration.mjs bundle
git diff --check
```

`pnpm verify` passes lint, typecheck, eight-entry registry validation, all 19
unit tests with the existing media provisioned, optimized build and the source /
built-client credential scan. The complete Playwright suite passes all 18 tests.
Browser checks cover exact source-alpha removal,
no visible DOM duplicate, valid fragment births, deterministic reconstruction,
completion, five threshold jitters/reversal, resize/DPR, keyboard/links,
390/320px, reduced motion, context loss, image failure and resource release.
New route tests check cards, metadata, comparison settings, clipboard/source
closure and exclusion of unapproved routes. Existing Forge/ASCII/Wake tests use
the hash-verified accepted local media, without publishing it.

This is an evidence-based hostile self-review, not a claim of independent human
review. The single repair cycle addresses:

| Finding | Severity | Repair / evidence |
| --- | --- | --- |
| Gallery navigation carried a scroll offset into a new route, starting the clock before the user reached its introduction | High | Route-only layout effect sets the starting position before source/clock mount; browser test requires top-of-route and IDLE. Approved clock and motion files remain identical. |
| Mineral silhouette touched the 320px crop edge | High | One framing-only imagegen edit; final desktop/mobile screenshots use the unchanged crop implementation. |
| Candidate/static PNG byte equality failed | Test defect | First freeze at time zero. Check per-channel difference ≤1 for the accepted compositor's extra premultiplied-alpha copy; CSS/static raster equality remains exact. Keep pixel data in a disposed browser JSHandle. |
| Evidence reader's 1MiB process buffer was too small for the historical PNG | Evidence tooling defect | Explicit bounded 4MiB buffer for the pinned original. Initial failure log is retained. |

The final re-review checks the repaired route, full-object crop, source/CSS
conservation, default presets, imports, registry links, rights, cleanup,
recordings and measured bundle/performance receipts. Original owner approvals
are preserved; sediment front/fragment geometry is not artistically redesigned.

Local evidence lives under `evidence/material-wave-a-release-01/`, including the
review index, per-effect/per-width phase screenshots, CSS before/after images,
actual slow/fast scroll WebM recordings, video decode/time-advance checks,
raw performance samples, GPU/browser environment, CDP listener/resource receipts,
baseline build/bundle comparison, source audit and preservation hashes.
Evidence and provisioned video remain ignored and local.

Fresh-context JavaScript response totals (Node gzip per script, excluding
HTML/CSS/images): base main homepage and Glyph Morph each 174,550 gzip bytes;
integration each 180,749 (+6,199, 3.55%); Sediment 182,763. These are measured
response closures, not an estimate from one entry chunk. The new 191KB image is
separate. No package or lockfile changes accompany this increase.

## Measured production performance

Single isolated runs in Chromium / ANGLE SwiftShader, DPR 1; no video capture,
tests or readback polling during these final samples.

| Effect | Width | FPS | Median frame ms | p95 frame ms | p95 draw ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| ashfall | 1440 | 55.76 | 16.70 | 33.30 | 18.60 |
| seam | 1440 | 58.17 | 16.70 | 16.80 | 6.90 |
| sediment | 1440 | 57.60 | 16.70 | 16.80 | 7.50 |
| ashfall | 390 | 59.82 | 16.70 | 16.80 | 14.50 |
| seam | 390 | 60.00 | 16.70 | 16.80 | 3.00 |
| sediment | 390 | 60.00 | 16.70 | 16.70 | 3.50 |
| ashfall | 320 | 59.63 | 16.70 | 16.80 | 6.80 |
| seam | 320 | 59.82 | 16.70 | 16.80 | 4.80 |
| sediment | 320 | 59.82 | 16.70 | 16.70 | 5.00 |

Desktop 60 FPS is not claimed. All emulated mobile widths exceeded 30 FPS.
CDP confirms owned scroll and visibility listeners return 1 → 0 and every
material resource counter returns to zero after navigation, for every effect
and width. A diagnostic timing run overlapped a static contact-sheet capture;
it is preserved separately and excluded from this final table.

Final hostile re-review: no unresolved Critical/High integration issue. All
eleven accepted source/CSS files remain byte-identical, repaired route entry is
IDLE, the final raster fits the mobile crop, and 12 recorded scroll runs complete
with valid source births and no residual particles. All 12 WebM files decode and
advance. Capture logs contain 12 existing Next CSS-preload warnings and no
console/page errors. The performance limits below remain explicit.

## Limits, merge gate and rollback

Performance receipts use headless Chromium/ANGLE SwiftShader at DPR 1. They are
software-rendered viewport simulations, not physical mobile/GPU, Safari or OS
sleep measurements. The original fine-ash/laminar motion and any accepted
performance limitations remain. Cleanup claims concern owned resources/listeners
and scheduling, not a heap-based proof that all browser memory is reclaimed.
Existing framework preload warnings, if present, remain in the raw console log.

PR CI must pass before merge. Never bypass protection or force push. Read-only
checks found no branch protection/rulesets, deployment history or repository
deployment workflow at audit time; the only workflow verifies PRs and main.
No deploy is requested or performed. External automation outside repository
visibility cannot be established by this audit.

Use the repository-supported merge-commit policy so rollback is a normal
reviewed revert: branch from current main, run
`git revert -m 1 <wave-a-merge-sha>`, verify, push and open a revert PR. Do not reset
or force-push main. The exact PR, CI, merged main SHA and post-merge verification
are recorded in the final local release receipt and delivery report.
