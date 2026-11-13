# Signature Hero 01 local review receipt

Status: **OWNER_VISUAL_REVIEW_REQUIRED**. Prepared 2026-11-13. This is a local-only candidate.

## PLAN

Read the complete scaffold prompt and handoff. Fetch canonical main, inspect existing worktrees and the source experiment, verify the approved source and six original captures, then implement in a new non-overwriting worktree. Run the full stated acceptance suite and stop for owner visual review.

- Repository: `BikeshedStudios/nullworx`.
- Verified fetched main and initial new-worktree HEAD: `3f6e6360f0686106886f0bb3f6d2d7303d11ea36`.
- New branch: `feat/signature-hero-showcase-01`; initial status clean.
- New worktree: `$HOME/DevHub/experiments/nullworx-signature-showcase-01`.
- Final commit HEAD and final branch/status are recorded in the adjacent local evidence `final-state.json` after committing this receipt.
- Source: `$HOME/DevHub/experiments/nullworx-premium-specimen-01`.
- Approved paths are the six `approvedVisuals` entries in `drafts/premium-release-candidate-01/APPROVED_BASELINE.json`, found under `prototype/assets/`. Separate `visual-baselines/` files are frame-zero package regression stills, not the selected approved captures.
- The candidate release receipt was inspected; no private product/package/archive was copied into this worktree.

## CHANGESET

Exactly 15 changed/added files:

- `app/kits/signature-hero/page.tsx` — Static noindex showcase; actual image dimensions; explicit Googlebot noindex/noimageindex.
- `app/kits/signature-hero/page.module.css` — Scaffold layout, responsive styles and reduced motion; visible focus on dark hero and unclipped preview outlines.
- `lib/signature-hero-showcase.ts` — Static metadata for exactly Carbon, Porcelain and Cobalt.
- `scripts/check-signature-previews.mjs` — Six-file hash, approval, provenance, preset and PNG-dimension verification; no extra assets.
- `docs/signature-hero-01/PREVIEW_RECEIPT.json` — Schema 1 approved source/destination hashes, source-relative paths, approval reference and dimensions.
- `docs/signature-hero-01/REVIEW.md` — This review receipt.
- `tests/e2e/signature-hero.spec.ts` — 11 targeted tests: bytes over HTTP, semantics, commerce/discovery boundaries, accessibility, viewport/motion, keyboard and private paths/source maps.
- `ops/deploy/check-public-assets.mjs` — Strict allowlist extended by exactly six approved image hashes; two existing hashes preserved.
- `ops/deploy/tests/media.test.mjs` — Expected approved asset count updated from two to eight; rejection assertions preserved.
- `public/signature-hero-01/carbon-1440.png` — approved capture copied byte-for-byte.
- `public/signature-hero-01/carbon-390.png` — approved capture copied byte-for-byte.
- `public/signature-hero-01/porcelain-1440.png` — approved capture copied byte-for-byte.
- `public/signature-hero-01/porcelain-390.png` — approved capture copied byte-for-byte.
- `public/signature-hero-01/cobalt-1440.png` — approved capture copied byte-for-byte.
- `public/signature-hero-01/cobalt-390.png` — approved capture copied byte-for-byte.

The 10-URL sitemap, discovery manifest, homepage/header/footer, root styles, dependency manifest/lock, public MIT license and existing notices are unchanged. The inherited shared footer still describes the already-published Bento Duo; no Signature Hero price or checkout was added. The local asset validator now accepts only eight reviewed hashes, including the six requested previews. No deployment/operator activation was performed.

Approved image receipt (source SHA-256, destination SHA-256 and approved baseline SHA-256 are identical for every row):

| Destination | Actual pixels | SHA-256 |
| --- | --- | --- |
| `public/signature-hero-01/carbon-1440.png` | 1440×980 | `819fb12d94901ad7e9c71094e138ee8c4745eef27a3a7da43f5dc7a46cf434e0` |
| `public/signature-hero-01/carbon-390.png` | 390×718 | `e4544a10c345d51adf76a43d68ec19d459987078ba2d34076420319ec7fe9200` |
| `public/signature-hero-01/porcelain-1440.png` | 1440×980 | `c63e526bb9f3fd037cb5d75d5bffc708f98108869a72076de7c4331aa4948050` |
| `public/signature-hero-01/porcelain-390.png` | 390×718 | `083f23a2817506f4f0e28c87994b4a112eb61349fcf353e33dac05ca7117d2f9` |
| `public/signature-hero-01/cobalt-1440.png` | 1440×980 | `c9f5e94d70ac12fcdb4badf63f87a0da51966653143e607e962d4b1052e1027d` |
| `public/signature-hero-01/cobalt-390.png` | 390×718 | `542f968b3a3ad20a62470ac931dcb8ce1dffc21a5df0834c608a325b07e91ec5` |

See [PREVIEW_RECEIPT.json](./PREVIEW_RECEIPT.json) for the source-relative paths and owner-approval reference. Baseline JSON SHA-256: `60cdc805e928dbfb8beb54e2887e31b35aa2f7462c9c92f6e64e7a457423afc8`.

## VERIFY

Node `v24.20.0`, project-selected pnpm `12.15.0`, Next.js `16.4.3`, Playwright `1.64.1`. Commands ran from the new worktree. No suite/assertion was weakened to accommodate the showcase.

| Command | Final exit | Local log |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | 0 | `install.log` |
| `node scripts/check-signature-previews.mjs` | 0 | `previews.log` |
| `node --test ops/deploy/tests/media.test.mjs` | 0 | `public-guard.log` |
| `pnpm verify` | 0 | `verify.log` |
| `pnpm test:e2e` | 0 | `e2e.log` |
| `pnpm test:launch` | 0 | `launch.log` |
| `pnpm test:distribution` | 0 | `distribution.log` |
| `pnpm test:distribution:site` | 0 | `distribution-site.log` |

- `pnpm verify`: 51 unit tests passed, one existing media-dependent test skipped; lint, typecheck, effect/registry validation, production build and secret scan passed.
- `pnpm test:e2e`: 35 passed, nine existing media-dependent tests skipped, zero failures or flaky tests. All 11 new Signature Hero tests passed and none skipped.
- `pnpm test:launch`: 169/169 built metadata, 109/109 HTTP and 90/90 visual checks passed; exact 10 approved sitemap URLs preserved; accessibility states passed.
- `pnpm test:distribution`: 11 registry tests plus real public-registry installation, typecheck, build and browser interactions in clean Next.js/Vite consumers passed.
- `pnpm test:distribution:site`: 60 route/responsive/motion cases passed, zero accessibility violations.
- Showcase checks cover HTTP 200, six image response hashes and native dimensions, three presets, noindex, no Signature Hero price/checkout/Product/Offer schema, source/package/font/map 404s, no homepage discovery link, and zero overflow including clipped children at 320/390/768/1440 with both motion preferences. WCAG A/AA scans and browser errors were clean in all eight states.
- Keyboard verification covers the skip link, direction anchor, visible unclipped focus, Tab movement, full-size capture opening and both outro links.
- Native Chrome DevTools Protocol fallback: 38 successful responses, six approved HTTP image hashes, zero runtime exceptions, console errors or network failures. Chrome DevTools MCP itself could not start a headed browser because no X server was available; no MCP configuration was changed.
- Independent hash-guard negative checks accepted the control and rejected altered bytes, incorrect dimensions, changed approved digests, extra assets and duplicate variants.
- Preservation comparison passed: 519 source/WIP/evidence files, six scaffold files, all 27 approved source entries, and six approved images unchanged. HEAD and status for all 38 original worktrees are unchanged. Ten protected site/license/dependency files match approved main byte-for-byte.
- `git diff --check` passed. Initial E2E fixture-loading failure was corrected; the failed initial attempt is retained separately in `acceptance-initial.json` and `e2e-initial-fixture-error.log`.

Existing skips (no new skip rules):

- Unit `tests/unit/digitalWake.test.ts`: accepted 900-frame footage audit; `public/media/local/fish-data.json` is intentionally absent in this clean worktree.
- `ascii-release.spec.ts`: calibrated default: real media, pause, offscreen, reduced motion, resize and cleanup — Set ASCII_TEST_VIDEO to a rights-cleared local clip.
- `ascii-release.spec.ts`: original rollback: real media, pause, offscreen, reduced motion, resize and cleanup — Set ASCII_TEST_VIDEO to a rights-cleared local clip.
- `ascii-release.spec.ts`: idle: rapid replacement, loop, paused seek, invalid codec, context loss and retry — Set ASCII_TEST_VIDEO to a rights-cleared local clip.
- `ascii-release.spec.ts`: idle: reduced motion on first load retains a still frame and can opt into playback — Set ASCII_TEST_VIDEO to a rights-cleared local clip.
- `ascii-release.spec.ts`: detail defaults to Fine on reload and preserves an explicit choice on replacement — Set ASCII_TEST_VIDEO to a local clip.
- `consolidation.spec.ts`: provisioned ASCII advances, pauses and retains Fine controls — Accepted media intentionally absent from clean clones
- `consolidation.spec.ts`: provisioned Digital Wake keeps modes, presets, source trace, pause, seek and loop history — Accepted video and sidecars intentionally absent from clean clones
- `consolidation.spec.ts`: browser-local file selection keeps video local and suppresses unverified wake — Uses local accepted asset to exercise the file selector
- `live-site-polish.spec.ts`: local video autoplay, pause, visibility and blocked-play recovery — Set POLISH_VIDEO to a locally generated test-pattern video, never restricted footage.

## Receipts and visual review

All local receipts are in `$HOME/DevHub/evidence/signature-hero-showcase-01/`:

- `acceptance.json`: commands, actual exits, timings and logs; `skips.json`: exact skip reasons.
- `original-worktrees.json`, `preservation-before.json`, `preservation-after.json`, `protected-files.json`: before/after evidence.
- `cdp-browser.json`, `browser-tool-availability.json`, `hash-guard-negative.log`: runtime/network and guard evidence.
- `playwright-results.json`, `launch/`, `distribution-receipts/`, `distribution-site-receipts/`: persisted suite receipts.
- `screenshots.json`: screenshot dimensions and hashes. The eight full-page receipts are `screenshots/showcase-{320,390,768,1440}-{no-preference,reduce}.png`; keyboard focus, all three desktop preset articles and a phone viewport also have receipts.
- `final-state.json`, `changes.patch`, `changed-files.txt`: final local commit/branch/status and complete changeset.

Local review URL: `http://127.0.0.1:3327/kits/signature-hero`. If the preview server has stopped, run `pnpm start --port 3327` from the new worktree (production build is present).

Rollback the local integration after stopping the review server: from the new worktree, run `git revert --no-edit HEAD`. This creates a reviewable inverse commit and preserves every original worktree and WIP. No rollback was executed.

## VERDICT

**OWNER_VISUAL_REVIEW_REQUIRED**. Technical acceptance passed with the explicitly listed existing media skips. Owner visual approval remains outstanding. No push, PR, merge, deployment, publication, checkout activation, Gumroad listing or Hetzner change was performed.

Owner-rights receipt: On 2026-11-13 the owner replied “yes let's do it” after being asked whether all five inherited Living Type PR #5 files were created under their sole control without outside contributors retaining rights. This is a self-reported owner assertion, not independent legal verification. It authorizes continued internal review; customer licensing, pricing and publication remain unapproved. Existing public MIT, Apache-2.0 and OFL-1.1 permissions/notices remain intact.
