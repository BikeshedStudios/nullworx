# NULLWORX — Live Playground UX 01A

Magnetic Focus only. Ready for local owner review; no other component was migrated.

Baseline and current HEAD: `aa38f55554176b2185bc4ddd046d513470d5bee1`. The working tree was clean before this changeset. No commit, push, merge, deployment or publication was performed.

## Preview

The final production build is running at <http://127.0.0.1:3100/effects/magnetic-focus>.

Example shared state: <http://127.0.0.1:3100/effects/magnetic-focus?mf=1&label=Make+it+yours&intensity=0.42&paused=0&preview=mobile>.

To restart locally after stopping that server:

```sh
pnpm build
pnpm start --port 3100
```

## Changeset

| File | Change |
| --- | --- |
| `lib/playground.ts` | Small typed settings, validation, URL and usage contract. No rendering/evaluation system. |
| `lib/magnetic-playground.ts` | Magnetic defaults, control metadata, validation, URL serialization and complete client TSX generation. |
| `components/forge-factory-01/use-playground.ts` | Reusable settings state, URL/history restoration, reset and share-copy fallback. |
| `app/lab/forge-factory-01/gallery.tsx` | Reuses the real MagneticFocus and existing source loader/viewer. Adds free-form labels, keeps presets, adds intensity, pause/replay/reset, preview sizing and share controls. |
| `app/lab/forge-factory-01/gallery.module.css` | Scoped controls and preview-frame sizing in the existing typography and palette. |
| `components/white-journey/source-code.tsx` | Optional per-study instructions. Copy feedback follows the current code, avoiding stale success feedback after edits. Existing callers retain their instructions. |
| `tests/unit/magnetic-playground.test.ts` | Validation, malformed/duplicate/oversized URL inputs, round trips and string escaping. |
| `tests/e2e/magnetic-playground.spec.ts` | Real edits, pointer intensity, presets, pause/replay/reset, clipboard success/denial, history, sharing, keyboard, touch, mobile widths and axe checks. |
| `tests/distribution/playground-consumers.mjs` | Fresh pinned Next.js/Vite projects populated from actual browser clipboard output; typecheck/build and browser assertions. |
| `docs/LIVE_PLAYGROUND_UX_01A.md` | Review, receipts, limits and rollback instructions. |

The three Magnetic Focus source files, Forge source loader, other effect implementations, typography definitions, dependencies, sitemap/discovery files, launch tests, approved Signature Hero designs and product files are unchanged from baseline. Signature Hero's exact approved image bytes and private-source boundaries pass the existing tests. Bento Duo's Gumroad checkout and Buy Me a Coffee links pass their existing tests.

## Behavior and installation

The preview renders the actual React button. Both the preview wrapper and generated TSX inherit `overflowWrap: "anywhere"`, so an 80-character unbroken label wraps without changing the published component/CSS. Desktop and mobile frames fit the available width; mobile caps at 390px. This is a responsive container preview, not a device emulator.

Replay recenters/remounts the button and resumes pointer interaction without changing label/intensity. Reset restores defaults and the activation count. Reduced motion overrides movement, including after replay; the button remains activatable.

The generated example includes `"use client"`, a relative component import, current label/intensity/paused props, and a working activation handler. Preview size is a playground setting rather than a component prop. Empty/invalid draft labels use the documented default in both preview and generated code.

The on-page installation path is the one verified here: copy all three source tabs into `components/forge-factory-01/`, save Usage as root-level `MagneticFocusDemo.tsx`, import its named `MyInterface` export into the page, and retain the MIT notice. No npm package, animation dependency, Tailwind setup or alias is required. Verified versions: Node 24.20.0, pnpm 12.15.0, React 19.3.1, TypeScript 5.9.3, Next.js App Router 16.4.3 and Vite 8.3.7. No additional installation command is advertised.

Shared URLs use a fixed same-origin `/effects/magnetic-focus` path and a versioned allowlist: `mf=1`, label, intensity, paused and preview. Validation rejects malformed percent encoding, oversized queries, ambiguous duplicate fields, invalid enums, non-finite/out-of-range numbers, and blank/control-character/oversized labels. Invalid fields fall back to defaults; invalid versions or malformed/oversized queries fall back entirely. Unknown fields never select a source or execute code. Label text is serialized as a JSON string expression in TSX.

## Verification receipts

Local receipts are retained in [`../evidence/live-playground-01a/`](../evidence/live-playground-01a/), which is intentionally gitignored.

| Command/check | Final result | Receipt |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | PASS; dependency manifests/lockfiles unchanged | Session tool output |
| `pnpm lint`, `pnpm typecheck` | PASS | Session tool output; `verification.json` |
| `pnpm test` | 74 passed, 1 pre-existing media-dependent skip; 11 files passed | Session tool output; `verification.json` |
| `pnpm validate:effects` | 8 effects valid | Session tool output; `verification.json` |
| `pnpm validate:registry` | Three-file canonical closure valid | Session tool output; `verification.json` |
| `pnpm build` | PASS | `build.log` |
| `pnpm check:secrets` | PASS, source and built client assets | Session tool output; `verification.json` |
| Targeted Playwright run below | 26 passed, zero failures/skips | `e2e.log`, `e2e-results.json` |
| `node tests/distribution/playground-consumers.mjs` | Fresh Next.js and Vite installs/typechecks/builds/interactions pass, including copied 80-character label usage | `consumers.log`, `consumer-results.json` |
| `pnpm test:launch` (unchanged) | 169/169 built checks, 109/109 HTTP checks, 90/90 visual checks; 16 accessibility states with zero findings | `launch.log`, `launch/digital-wake-accessibility.json` |
| Protected-file diff and `git diff --check` | PASS | `verification.json` |

Clipboard proof uses the browser's real Clipboard API. [`copied.json`](../evidence/live-playground-01a/copied.json) contains the actual copied TSX, long-label TSX, all three source files and the validated shared URL. Each source file is checked byte-for-byte against the repository before being pasted into the independent fixtures. Consumer build logs, installed files and screenshots are retained at the temporary directory recorded in `consumer-results.json`.

Browser assertions cover keyboard Enter/Space, visible focus, touch activation, bounded pointer movement at the edited intensity, pause/resume/replay, initial/live reduced motion, URL fallbacks and history, clipboard denial, and no horizontal overflow. Site axe scans at 1440/390/320px and both consumer scans at 1280/390/320px have zero WCAG 2 A/AA and 2.1 AA violations. Final runtime inspection confirms the shared label, intensity, mobile frame, generated TSX and verified install text agree.

To reproduce the browser and clipboard proof after `pnpm build`:

```sh
pnpm exec playwright test tests/e2e/magnetic-playground.spec.ts tests/e2e/forge-factory-01.spec.ts tests/e2e/distribution.spec.ts tests/e2e/signature-hero.spec.ts
node tests/distribution/playground-consumers.mjs
LAUNCH_REPORT_DIR="$PWD/evidence/live-playground-01a/launch" pnpm test:launch
```

The fixture proof deliberately tests manual clipboard installation. The existing public GitHub/shadcn transport suite and full distribution-site matrix were not rerun; the public three-file source closure is unchanged.

## Failures, skips and limits

No final automated test failures. The existing Digital Wake accepted-footage unit test skips because `public/media/local/fish-data.json` is absent. No media was provisioned.

Chrome DevTools MCP could not launch its headed browser because this environment has no display/X server. Playwright supplied browser/runtime evidence instead. Manual browser inspection reports zero console errors and two CSS preload warnings, saved in `browser-console.txt`; network evidence is in `browser-network.txt`. Test-runner logs also contain Node's `NO_COLOR`/`FORCE_COLOR` warning.

Browser verification used Chromium on Linux and emulated touch/mobile viewports. Physical devices, screen readers and other browsers were not tested. Automated axe checks do not establish complete accessibility compliance. The initial unit run is retained as `unit-initial.log`; the final run includes the two additional malformed-encoding cases and is summarized in `verification.json`.

## Exact diff and rollback

[`../evidence/live-playground-01a/changes.patch`](../evidence/live-playground-01a/changes.patch) includes every changed/new source, test and review file against the baseline, including this document. Generated receipts are outside the patch. The working tree is left uncommitted for review.

To roll back this slice, stop the local port-3100 preview, then run from the repository root:

```sh
git apply --reverse --check evidence/live-playground-01a/changes.patch
git apply --reverse evidence/live-playground-01a/changes.patch
git status --short
```

The check must pass before applying the reversal. If a reviewer has edited these files since the receipt, inspect those changes first. The reverse patch restores the three modified existing files and removes the seven added files; it leaves ignored evidence/dependencies/build output alone. Rebuild before starting the restored baseline preview. No destructive reset or clean command is needed.
