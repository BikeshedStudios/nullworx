# NULLWORX — Live Playground UX 01C

ASCII Waves only. Local owner review; no push, merge or production deployment.

## Recovery

Recovered the intended worktree `/home/swirky/DevHub/experiments/nullworx-live-playgrounds-01c` on `feat/ui-forge-live-playgrounds-01c`, based on verified 01B commit `6c5779b569072c92112837e672c15832c288ad47`. No 01C commit had been made. Seven tracked files were modified, with nine new implementation/test/doc files and two browser-tool receipts. The original index was empty.

Both earlier 01C evidence directories survive:

- `evidence/live-playground-01c-20261113T163941Z/`
- `evidence/live-playground-01c-reuse-20261113T165312Z/`

The first contains a rejected duplicate video-adapter implementation and its archived source. The recovered current application already uses the existing adapter. The second contains lint/types/build logs, 154 unit passes with one existing skip, a 36-pass browser rerun and successful Next/Vite consumer receipts. These are **recovered historical evidence**, not results of resumed testing. Earlier failures remain in those directories. Its launch gate ends mid-output, without a final verdict. The consumer paths under `/tmp` no longer existed after reboot. No stale git lock, active build/test or preview server was found. Reflog has only the worktree-creation entries at `6c5779b`; there is no later 01C commit to recover. The crash cause is unknown.

New evidence root: [`..//home/swirky/DevHub/experiments/nullworx-live-playgrounds-01c/evidence/live-playground-01c-resumed-20261113T173750Z/`](..//home/swirky/DevHub/experiments/nullworx-live-playgrounds-01c/evidence/live-playground-01c-resumed-20261113T173750Z/). Before editing, `recovered-wip.tar.gz` captured all 18 modified/untracked files, `recovered-tracked.patch` captured the tracked diff, and `recovered-files.json` recorded hashes. `recovered-evidence-hashes.json` records 237 earlier receipt hashes; they remain in their original locations. `recovered-test-results.tar.gz` additionally preserves the legacy fixed-path screenshots. No reset, clean, stash, checkout over changes or deletion was used.

## Review and behavior

Review URL: <http://127.0.0.1:3103/effects/ascii-waves>. To restart the verified local production build: `pnpm start --port 3103` from this worktree. Build first with `pnpm build` after any application edits. Server receipt: `preview-server.log` in the new evidence root.

The journey is live preview → customize → code → copy → install → share. Desktop/mobile frames fit the available width; the mobile frame caps at 390px. Procedural waves remain available without footage or WebGL. Video mode waits for a browser-local file and retains the procedural fallback while none is selected. Clearing a video restores procedural settings in the shared playground. Global Reset restores the exact procedural defaults and clears local media through the existing adapter.

[The detailed control reuse matrix](LIVE_PLAYGROUND_UX_01C_REUSE.md) lists each authority and its missing integration. The actual boundaries are:

| Existing authority | Reused | Missing integration completed |
| --- | --- | --- |
| `ProceduralAscii`, `usePreviewActivity` | Original 2D formula, palette, responsive density, pointer ripple, one 20fps clock, visibility/reduced motion | Validated settings, shared pause/replay/reset, optional standalone controls |
| `HomeKoiField` | File picker, one object-URL owner, revoke/replace/cleanup, procedural fallback, fail-closed featured checks | Controlled mode/settings/transport, portable React lazy boundary, clear-to-procedural callback |
| `LocalVideoField` | Video events, detail presets, error/retry/context recovery, loop, seek, observers and output monitor | In-place settings updates, shared control callbacks, debounced glyph/cell changes, visible paused resize redraw |
| `AsciiWavesRenderer`, `glyphAtlas.ts` | Sole WebGL2 renderer, shaders, uniforms, atlas calibration, wave clock, snapshots, resource disposal | Immediate suspension of RAF/video callbacks; explicit one-frame redraw |
| 01A/01B `usePlayground`, control primitives and `SourceCode` | Sliders, transport, preview sizing, reset/share/copy fallback, source tabs | ASCII settings contract, validation, allowlisted URLs, generated integration and complete source closure |
| Digital Wake controls/config/engine | Inspected as reference only | No changes or migration |

Baseline `LocalVideoField` included density in its lifecycle effect dependencies, recreating the renderer when density changed. It now creates/disposes only for source/retry changes; density/ramp/settings use `setSettings()` and `resize()` on that instance. No shaders, atlas mapping, second context, animation clock or playground architecture was introduced. The original renderer class remains a class; the generated React example uses the real included `HomeKoiField` adapter.

Procedural controls: responsive/fixed density, ramp, original palette or solid color, speed, pointer enable/strength and invert. Video controls: existing Original/Fine/Dense density, ramp, color tint, wave speed, noise scale, tension/twist, pointer enable/strength and invert. Video speed changes the wave clock; footage retains its original playback rate. Unsupported procedural noise/tension/twist settings are discarded. Reduced motion overrides shared playback controls; the adapter's original explicit local Play opt-in remains available in standalone integrations.

Shared URLs contain a versioned allowlist of scalar settings. No filename, file bytes, object URL or media source is serialized. A reload requires selecting footage again. Malformed/oversized/ambiguous fields fall back through the shared validator; unknown fields cannot choose source files or execute code. The preview and generated TSX use the same normalized settings. No user code is evaluated.

## Installation

Copy the ten source/CSS tabs into `components/white-journey/`, preserving `original-ascii/`; save Usage as root-level `AsciiDemo.tsx` and render the named `MyInterface` export. Requires React, TypeScript and CSS Modules. No extra runtime dependency, alias, backend, npm package or external footage is required. Video needs WebGL2; procedural does not. Keep the repository MIT notice. Space Mono is optional, with a monospace fallback. The complete closure includes the existing fail-closed featured-media checks but no third-party footage or private source.

Fresh clipboard consumers use the existing pinned fixtures: React/React DOM 19.3.1, TypeScript 5.9.3, Next.js 16.4.3 and Vite 8.3.7; Node 24.20.0, pnpm 12.15.0. Consumer tests compare every copied file byte-for-byte before installation and compare default procedural pixels with the 01B implementation at all four widths.

## Changeset

All work remains uncommitted on the existing 01C branch at `6c5779b`; the original index is preserved. The full file manifest and patches are in the new evidence root. Recovered implementation:

- `components/white-journey/ascii-study.tsx`, `ascii-playground.tsx`, `ascii-playground.module.css`: server source closure and shared playground presentation.
- `lib/ascii-playground.ts`, `components/white-journey/procedural-settings.ts`: typed settings, defaults, validation, URL and generated TSX.
- `components/white-journey/home-koi-field.tsx`, `home-koi-field.module.css`, `local-video-field.tsx`, `procedural-ascii.tsx`: optional controlled interfaces and portable source styling, retaining standalone use.
- `components/white-journey/original-ascii/renderer.ts`: lifecycle suspension and one-frame redraw only.
- `tests/unit/ascii-playground.test.ts`, `tests/e2e/ascii-playground.spec.ts`, `tests/helpers/ascii-probe.ts`, `tests/distribution/ascii-playground-consumers.mjs`: settings, runtime/uniform/pixel, lifecycle/privacy and copied-source installation evidence.
- `tests/e2e/text-playgrounds.spec.ts`: receipt output override.
- `docs/LIVE_PLAYGROUND_UX_01C_REUSE.md`: recovered reuse inventory.

Resumed changes: fix paused resize redraw in `local-video-field.tsx`; synchronize Clear local video with shared procedural mode in `home-koi-field.tsx`; add regression assertions and pixel energy sampling to the existing browser tests/probe. `tests/discovery/visual-check.ts` and `tests/e2e/forge-factory-01.spec.ts` gain optional receipt-directory overrides to preserve previous evidence. This report completes the handoff.

## Verification

All final checks passed. These are new resumed receipts, separate from the recovered evidence. Exact command arrays, start times, exits and sampled resources are in `commands.jsonl` and `*-resources.json` in the new evidence root.

| Command/check | New result | Receipt relative to new evidence root |
| --- | --- | --- |
| `pnpm lint`, `pnpm typecheck` | PASS after final test edits | `lint-final.log`, `types-final.log` |
| `pnpm test --maxWorkers=1 --no-file-parallelism` | 154 passed, 1 existing skip; all 13 files pass, default test timeout | `unit-default-timeout.log` |
| `pnpm validate:effects`, `pnpm validate:registry` | 8 effects valid; 3-file canonical public closure valid | `effects.log`, `registry.log` |
| `pnpm build`, `pnpm check:secrets` | PASS, including built client credential scan | `build.log`, `secrets.log` |
| Playwright six-file suite, `--workers=1` | 56 passed, no skips/failures/flakes | `browser-final.log`, `final/e2e-results.json` |
| Added WebGL-unavailable/offscreen fallback check, `--workers=1` | 1 passed; 57 browser checks total across two final invocations | `fallback-browser.log`, `final/e2e-fallback.json` |
| `PLAYGROUND_01C_RECEIPTS=<new-root>/final node tests/distribution/ascii-playground-consumers.mjs` | Fresh pinned Next/Vite installs, types, builds, both modes, copy parity, local file/clear/replace, reduced motion and 4 widths PASS | `consumers.log`, `final/consumer-results.json` |
| Default procedural baseline pixel equality | Exact match to 01B at 320/390/768/1440 in both consumers | `final/consumer-results.json` |
| `pnpm test:launch`, isolated report/visual directories | 169/169 built, 109/109 HTTP, 90/90 visual; 16 accessibility states with zero findings | `launch.log`, `final/launch/` |
| Approved sitemap | Exactly 10 URLs; exact approved manifest/date parity | `launch.log` |
| Resource/privacy/lifecycle | Density/ramp edits retain 1 context, 1 program, 2 textures, 1 VAO. Clear leaves 0 programs/textures/VAOs/object URLs. No writes/media uploads/analytics or runtime errors in privacy flow | `final/video-control-output.json`, `final/lifecycle.json` |
| Paused resize | Visible nonzero pixels at each size; wave clock/video time unchanged, still 1 context, idle after draw | `final/paused-resize.json` |
| Protected files, shader literals, old receipts and patch reverse checks | PASS | `preservation.json`, `verification.json` |
| Port-3103 production preview | HTTP 200; normalized defaults and install text verified; zero console errors, 2 CSS preload warnings | `preview-runtime.json`, `preview-console.txt`, `preview-network.txt`, `preview-owner-review.png` |

The six-file browser suite is `tests/e2e/ascii-playground.spec.ts`, `magnetic-playground.spec.ts`, `text-playgrounds.spec.ts`, `forge-factory-01.spec.ts`, `distribution.spec.ts` and `signature-hero.spec.ts`. It covers actual controls, shader uniforms/pixels, clocks, copy success/denial, reset/code parity, URL/history/invalid inputs, media privacy/replacement/cleanup, pause/offscreen/visibility/reduced motion, context loss/restore/retry, paused seek, loop, keyboard, touch, focus and responsive/accessibility checks. The added no-WebGL case was run separately after adding it; future complete runs collect 57 cases. Consumer source, locks, logs and screenshots are also preserved across reboot in `final/consumer-fixtures-and-receipts.tar.gz`, beyond the live `/tmp` fixture directories.

For reproduction, use a new unique directory and synthesize test footage before running the browser suite:

```sh
review_run_dir="$PWD/evidence/live-playground-01c-review-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir "$review_run_dir"
ffmpeg -n -hide_banner -loglevel error -f lavfi -i testsrc2=size=320x180:rate=24 -t 6 -c:v libvpx-vp9 -threads 1 -pix_fmt yuv420p "$review_run_dir/synthetic-test.webm"
# Run after the lint/types/unit/validator/build/secret commands above, sequentially.
PLAYGROUND_01C_RECEIPTS="$review_run_dir" PLAYGROUND_01A_RECEIPTS="$review_run_dir/magnetic" PLAYGROUND_01B_RECEIPTS="$review_run_dir/text" FORGE_REVIEW_DIR="$review_run_dir/forge" SIGNATURE_REVIEW_DIR="$review_run_dir/signature" E2E_REPORT="$review_run_dir/e2e-results.json" E2E_PORT=3304 pnpm exec playwright test tests/e2e/ascii-playground.spec.ts tests/e2e/magnetic-playground.spec.ts tests/e2e/text-playgrounds.spec.ts tests/e2e/forge-factory-01.spec.ts tests/e2e/distribution.spec.ts tests/e2e/signature-hero.spec.ts --workers=1 --output="$review_run_dir/browser-results"
PLAYGROUND_01C_RECEIPTS="$review_run_dir" node tests/distribution/ascii-playground-consumers.mjs
LAUNCH_REPORT_DIR="$review_run_dir/launch" DISCOVERY_VISUAL_REPORT_DIR="$review_run_dir/launch/discovery" LAUNCH_PORT=3364 pnpm test:launch
```

## Resources, interruptions and limits

Recovery began with approximately 52 GiB available of 62 GiB RAM, 512 MiB configured swap and no swap use. No production build or browser suite was run concurrently with another. Browser tests used one Playwright worker; units used one worker with file parallelism disabled. Each command sampled available memory, swap and its process-tree RSS; the runner would terminate its command below 4 GiB available. No threshold was approached. Highest sampled tree RSS was 2.20 GiB (the main build); lowest available memory across monitored commands was 51.36 GiB; sampled swap usage stayed zero. No OOM or instability was observed. These samples do not establish the cause of the earlier crash.

One resumed browser invocation was deliberately interrupted after 14 passes to correct legacy fixed receipt paths before those regressions ran. Its exit 130, interrupted trace and partial receipts remain in `browser.log`, `e2e-results.json` and `browser-results/`. The complete rerun uses `final/` and passed. No recovered evidence or legacy `test-results` bytes were overwritten. An initial unit pass used the recovered 15-second timeout setting; the final pass above uses the default timeout.

The sole unit skip is the existing Digital Wake actual 900-frame footage/mask test because its local accepted-media files are absent; no media was provisioned. Chrome DevTools MCP was attempted and could not start its headed browser without an X server; no DevTools trace is claimed. Headless Playwright supplies the runtime evidence. The preview emits the same two CSS preload warnings present in recovered receipts. The public GitHub/shadcn transport suite and full distribution-site matrix were not rerun; their canonical closure and transport are unchanged, and actual manual clipboard installation was verified instead. Chromium/Linux and emulated touch were tested; physical devices, screen readers and other browser engines were not tested. Axe scans do not establish complete accessibility compliance.

No technical blocker remains for local review. Owner hands-on visual/interaction approval is pending.

## Preservation and rollback

The 01A checkpoint `0788507` and 01B `6c5779b` remain intact. Digital Wake, Bento Duo, Signature Hero, public assets, discovery/sitemap settings, dependency manifests/lockfile, shared 01A/01B implementation and both shader literals remain unchanged from 01B. The default procedural baseline is verified by consumer pixel comparisons. No Gumroad, infrastructure or publication operation is performed.

`recovered-wip.tar.gz` restores the exact crash-surviving source into a separate directory for comparison. `changes.patch` describes the complete 01C slice relative to `6c5779b`; `resumed-only.patch` describes only the recovery-session delta. Both are created without touching the real git index. Do not apply a reversal over later owner edits. The safest baseline review uses an unused directory with `git worktree add --detach <unused-path> 6c5779b`; keep this worktree and its evidence intact.

Owner hands-on verdict is pending. No broader migration or optimization belongs to this slice.
