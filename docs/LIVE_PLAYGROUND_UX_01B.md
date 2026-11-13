# NULLWORX — Live Playground UX 01B

Local owner review only. Extends the owner-approved Magnetic Focus 01A architecture to Glyph Morph and Prism Text. No push, merge, deployment or publication is authorized or performed.

## Run and review

The production build is running locally:

- Glyph Morph: <http://127.0.0.1:3102/effects/glyph-morph>
- Prism Text: <http://127.0.0.1:3102/effects/prism-text>
- Magnetic Focus regression: <http://127.0.0.1:3102/effects/magnetic-focus>

Shared examples:

- <http://127.0.0.1:3102/effects/glyph-morph?gm=1&text=BUILD+YOUR+OWN&durationMs=2000&frameMs=80&seed=123&paused=0&preview=mobile>
- <http://127.0.0.1:3102/effects/prism-text?pt=1&text=Live+review.&speed=1.5&intensity=0.65&paused=0&preview=mobile>

Worktree: `/home/swirky/DevHub/experiments/nullworx-live-playgrounds-01b`. Branch: `feat/ui-forge-live-playgrounds-01b`. Restart there with `pnpm build` followed by `pnpm start --port 3102` after stopping the current preview. The server log is `evidence/live-playground-01b/preview-server.log`.

## Verified baseline and discrepancy

The original worktree is `/home/swirky/DevHub/experiments/nullworx-live-playgrounds-01`, on `feat/ui-forge-live-playgrounds-01` at `aa38f55554176b2185bc4ddd046d513470d5bee1`.

Fresh ordinary and cache-disabled git status both showed **three modified files and seven untracked files**, exactly the ten paths in the 01A report. The index was empty; none of the modified paths had assume-unchanged/skip-worktree flags. The retained patch SHA-256 matched its receipt, and `git apply --reverse --check` passed. All 23 Magnetic settings unit tests and seven Magnetic browser tests passed before checkpointing.

The earlier report of only two untracked tests is therefore inconsistent with the verified current worktree. No commit contains the missing implementation: it was present as working files. The historical command/location that produced the two-file report is unavailable; its precise cause cannot be established. The full file inventory, hashes, status, HEAD, branches/worktrees and patch check establish the baseline without relying on that report.

A temporary git index captured **only those ten verified files**. The resulting local checkpoint is `07885072f7edb033b23e97fc3dd2d10af15356da`, named `checkpoint/live-playground-01a-keep`, with parent `aa38f55`. The 01B branch/worktree was created from this checkpoint. The original HEAD, index, status and all ten file hashes remain unchanged. No reset, clean or stash was used. Other existing worktree refs are unchanged.

Evidence caveat: the initial baseline browser run used the existing 01A test's fixed output directory, refreshing its clipboard, axe and Magnetic screenshot receipts. The earlier 01A report, verification JSON, patch, e2e logs/results, consumer logs/results and launch/build receipts were retained. Subsequent 01B Magnetic runs use a separate receipt directory via `PLAYGROUND_01A_RECEIPTS`. Browser-tool artifacts created during this task were moved into ignored evidence. No source or unrelated WIP was discarded.

## Changeset

| File | Change |
| --- | --- |
| `lib/glyph-playground.ts` | Typed Glyph settings, control metadata, defaults, validation, versioned URLs and deterministic complete TSX. |
| `lib/prism-playground.ts` | Typed Prism settings, control metadata, defaults, validation, versioned URLs and deterministic complete TSX. |
| `lib/playground.ts` | Shared bounded URL parser, text validator, numeric parser and slider normalization helpers. The Magnetic contract is unchanged. |
| `components/forge-factory-01/playground-controls.tsx` | Shared text/preset, range, pause/resume/replay/reset, sharing and preview-size controls. |
| `app/lab/forge-factory-01/gallery.tsx` | One settings state per effect using the existing hook. Validated values feed both actual component props and generated code. Reuses the source viewer and allowlisted source loader. |
| `app/lab/forge-factory-01/gallery.module.css` | Responsive frames with explicit caps after the shared wrapper rule, 44px controls and slider touch targets, full-width mobile action groups. Existing effect backgrounds and type styles retained. |
| `lib/discovery/manifest.ts` | Two Prism prose corrections: its included CSS already honors reduced motion. Routes, membership, metadata and dates are unchanged. |
| `tests/unit/text-playgrounds.test.ts` | 55 settings/URL/string-escaping/TSX syntax checks. |
| `tests/e2e/text-playgrounds.spec.ts` | 14 browser tests covering live controls, exact code/source copies, reload/history/fallbacks, timing, motion, reset and four widths. |
| `tests/e2e/magnetic-playground.spec.ts` | Optional receipt-directory override; existing assertions unchanged. |
| `tests/distribution/text-playground-consumers.mjs` | Fresh pinned Next/Vite installation of actual clipboard examples and byte-verified source/CSS. |
| `docs/LIVE_PLAYGROUND_UX_01B.md` | Owner review, receipts, behavior, constraints and rollback. |

## Behavior and installation

Glyph defaults: `HELLO WORLD`, duration 840ms, cadence 38ms, seed 17, running, desktop frame. Controls expose duration 200–5000ms in 20ms steps, cadence 20–160ms and integer seeds 0–2147483647. Replay remounts the actual component with the same seed and settings. Its existing pause behavior shows settled readable text; resume starts the same seeded sequence. Reduced motion always shows final text, including after replay.

Prism defaults: `Somewhere else.`, speed 1, intensity 0.75, running, desktop frame. Speed spans 0.25–2.5 in 0.05 steps; intensity spans 0–1 in 0.01 steps. The real component converts speed to sweep duration and intensity to saturation. Pause freezes the current sweep; resume continues it. Reset restores defaults and restarts the preview. Its existing CSS disables animation for reduced motion.

Both support freeform text up to 80 UTF-16 code units. Blank, control-character or invalid text uses the effect default in both preview and generated code. The text field retains an editable blank draft, as in 01A. Reset restores default text, controls, motion, preview size and generated code. Desktop frames cap at 720px, mobile frames at 390px; both shrink to fit. Frames are responsive containers rather than device emulators. Preview size and the transient replay key are playground state, not emitted component props.

Sharing uses fixed same-origin effect paths, a versioned allowlist (`gm=1` or `pt=1`) and only supported fields. Reload and browser history restore settings. Malformed encoding, duplicate versions and queries over 2048 characters fall back completely; duplicate/invalid individual fields fall back independently. Unknown fields cannot select sources or execute code. TSX string props use JSON string expressions. No eval, executable user JSX, fabricated JavaScript/Tailwind version or unsupported generated props are used.

Copy the **three Glyph files** (`glyph-morph.tsx`, `glyph-morph.module.css`, `use-reduced-motion.ts`) or **two Prism files** (`prism-text.tsx`, `prism-text.module.css`) into `components/forge-factory-01/`. Save Usage as root-level `GlyphMorphDemo.tsx` or `PrismTextDemo.tsx`, and import its named `MyInterface` export into the application page. Keep relative imports and the repository MIT notice. Both examples include `"use client"` and require React + TypeScript + CSS Modules, with no additional runtime package or alias. Fresh fixtures verified React 19.3.1, TypeScript 5.9.3, Next.js 16.4.3 and Vite 8.3.7.

All three free effect implementations, their CSS and shared reduced-motion hook are byte-identical to the 01A checkpoint. The source viewer, fixed source loader and Magnetic settings contract/hook are unchanged. ASCII/material playgrounds, seven approved effect routes, Signature Hero designs, Bento Duo checkout, Buy Me a Coffee links, Fish staging/media boundaries, dependency manifests and public distribution closure are preserved.

## Verification matrix

Receipts are local and intentionally ignored under [`../evidence/live-playground-01b/`](../evidence/live-playground-01b/).

| Requirement/check | Result | Receipt |
| --- | --- | --- |
| Baseline/checkpoint isolation and original WIP | PASS | `baseline/baseline.json`, `baseline/e2e.log`, `preservation.json` |
| Magnetic Focus regression | PASS: 23 unit + 7 browser tests | `unit.log`, `e2e-results.json`, `magnetic-regression/` |
| Glyph live text, duration, cadence, seed, replay, pause/resume | PASS, including deterministic frames and edited timing | `e2e.log`, `timing-repeat.log` (3 consecutive passes) |
| Prism live text, speed, saturation, pause/resume | PASS: computed CSS and frozen/resumed sweep | `e2e.log`, `browser-runtime.json` |
| Generated TSX matches settings; reset restores defaults | PASS for all three effects | `unit.log`, `e2e.log`, `copied-*.json` |
| Shared URL reload/history; invalid/oversized inputs | PASS | `e2e.log`, `unit.log` |
| Keyboard, visible focus, touch, initial/live reduced motion | PASS in Chromium/emulated touch | `e2e.log`, `responsive-review.json` |
| No page/text overflow at 320/390/768/1440px | PASS, both preview sizes and 80-character strings | `e2e.log`, `review-*.png` |
| Site Glyph/Prism accessibility scans | PASS: zero findings at four widths | `axe-glyph-morph-*.json`, `axe-prism-text-*.json` |
| Clipboard TSX + complete source/CSS in independent Next/Vite | PASS: fresh installs, typechecks, production builds, runtime, reduced motion, four widths, zero axe findings/errors | `consumers.log`, `consumer-results.json` |
| `pnpm lint`, `pnpm typecheck` | PASS | `lint.log`, `typecheck.log` |
| `pnpm test` | PASS: 129 passed, 1 existing media-dependent skip, 12 files | `unit.log` |
| `pnpm validate:effects`, `pnpm validate:registry` | PASS: 8 registered effects, unchanged 3-file public closure | `effects.log`, `registry.log` |
| `pnpm build`, `pnpm check:secrets` | PASS, including built client assets | `build.log`, `secrets.log` |
| Targeted Playwright suite | PASS: 40 tests, zero failures/skips | `e2e.log`, `e2e-results.json` |
| `pnpm test:launch` | PASS: 169 built + 109 HTTP + 90 visual checks; 16 accessibility states, zero findings | `launch.log`, `launch-final/digital-wake-accessibility.json` |
| Approved 10-URL sitemap, 7 effect routes | PASS: exact manifest parity and HTTP checks | `launch.log` |
| Signature Hero bytes/privacy, Bento Duo, support links | PASS | `e2e.log`, `preservation.json` |
| Protected-file diff, whitespace, patch reversal check | PASS | `preservation.json`, `verification.json` |

Actual copied examples include escaped text, paused/running variants and 80-character strings. Each source file is compared byte-for-byte before installation. Consumer files, logs and screenshots remain at the temporary directory recorded by `consumer-results.json`; its hashes identify the installed inputs. No parent application CSS or import aliases are supplied to those components.

| Effect | Before at 1440px | After at 1440px | After at 390px |
| --- | --- | --- | --- |
| Glyph | [01A](../evidence/live-playground-01b/baseline/before-glyph-morph-1440.png) | [01B](../evidence/live-playground-01b/review-glyph-morph-1440.png) | [Mobile](../evidence/live-playground-01b/review-glyph-morph-390.png) |
| Prism | [01A](../evidence/live-playground-01b/baseline/before-prism-text-1440.png) | [01B](../evidence/live-playground-01b/review-prism-text-1440.png) | [Mobile](../evidence/live-playground-01b/review-prism-text-390.png) |

Before/after captures also cover 320px and 768px. `baseline/before.json` records the old controls/code; `responsive-review.json` records the new controls/code and actual 44px input heights.

Reproduce after building:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:effects
pnpm validate:registry
pnpm build
pnpm check:secrets
PLAYGROUND_01A_RECEIPTS=evidence/live-playground-01b/magnetic-regression E2E_REPORT=evidence/live-playground-01b/e2e-results.json pnpm exec playwright test tests/e2e/text-playgrounds.spec.ts tests/e2e/magnetic-playground.spec.ts tests/e2e/forge-factory-01.spec.ts tests/e2e/distribution.spec.ts tests/e2e/signature-hero.spec.ts
node tests/distribution/text-playground-consumers.mjs
LAUNCH_REPORT_DIR="$PWD/evidence/live-playground-01b/launch-final" pnpm test:launch
```

## Limits and unresolved issues

No final automated failures. The existing Digital Wake footage test skips because `public/media/local/fish-data.json` is absent; no media was provisioned. Chromium on Linux and emulated touch were verified; physical devices, screen readers and other browsers were not tested. Axe does not establish complete accessibility compliance.

Chrome DevTools MCP cannot start without an X display. Playwright supplied runtime/console/network evidence. Manual browser inspection recorded zero errors and two CSS preload warnings; requests succeeded. Test logs also contain the existing `NO_COLOR`/`FORCE_COLOR` warning.

Initial failed assertions and traces are retained in `initial-failures/` and `timing-assertion-failure/`: CSS numeric serialization needed a tolerance, and timer tests needed a paused clock plus assertions that wait for React effects. `preview-width-failure/` records a CSS cascade defect: the shared wrapper's later rule could override the desktop frame cap. Frame rules now follow the wrapper, and tests wait for computed CSS and measured width after each size change. The effect source files were not changed. The public GitHub/shadcn transport suite and full distribution-site matrix were not rerun; their source closure is unchanged. The fresh manual installation fixtures were run instead.

Owner hands-on verdict is pending. 01A remains KEEP; 01B has no production authorization.

## Exact changes and rollback

The local 01B commit is on `feat/ui-forge-live-playgrounds-01b`; its parent is the exact `0788507` checkpoint. The full commit ID, changed paths and status are recorded in `evidence/live-playground-01b/git-state.json`. `changes.patch` includes only the 12 paths listed above relative to that checkpoint. `verification.json` records its hash and successful reverse check.

The safest rollback leaves both review trees intact and opens the checkpoint in another local worktree:

```sh
git worktree add --detach ../nullworx-live-playgrounds-01a-review checkpoint/live-playground-01a-keep
```

Use an unused destination. Install/build there and start on an unused port. The original 01A preview is also available at <http://127.0.0.1:3101/effects/magnetic-focus> while its process remains running. To reverse the 01B changes on its own clean branch later, use `git revert` with the 01B commit ID from `git-state.json`; inspect any later edits first. No reset, clean, stash, branch deletion or worktree removal is needed.
