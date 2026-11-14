# Accepted product baselines

Read this contract before changing homepage, media, effects, distribution or release gates. Accepted behavior must have a blocking regression test. Reconciliation is additive; an experiment is never a replacement baseline.

| Accepted surface | Authority | Required behavior |
| --- | --- | --- |
| Homepage fish | `54f7716335468bf171e374278b11bdf946f7a651` | LOOP30 v2 betta, muted inline autoplay where permitted; Dense 8px desktop cells. Fine 12px and Original 16px selectable. Preserve pause, loop, seek, resume, still frame, visibility and disposal. |
| Magnetic Focus 01A | `07885072f7edb033b23e97fc3dd2d10af15356da`, incorporated into 01B | Existing controls, bounded URL settings, generated TSX, clipboard/manual copy, installation and transport. |
| Glyph Morph / Prism Text 01B | `6c5779b569072c92112837e672c15832c288ad47` | Existing interactive controls, validation, generated TSX and copy/install. |
| ASCII Waves 01C | Exact recovered WIP at `6c5779b`, checkpoint below | Existing shared controls and original renderer; configurable procedural defaults and Fine 12px video settings stay distinct from the homepage. Local file ownership, privacy, cleanup, reset and generated source closure remain intact. |
| Existing public release | `3f6e6360f0686106886f0bb3f6d2d7303d11ea36` | Preserve approved routes, ten-URL sitemap, commerce and public/paywall boundaries. This task does not activate production. |

## Media identity and visual settings

Only `/media/ascii/loop30-v2-807bb27e.mp4` is the default featured media. SHA256: `807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238`; 12,862,251 bytes; silent H.264/avc1, 1920×1080, 30fps, 30 seconds. Do not substitute footage or re-encode it. Credit Animal Exploration Project (@AnimalEP), link the recorded original, explain silent loop/ASCII transformation and no endorsement. Use the approved direct-permission public receipt; never invent a CC licence or expose private correspondence.

Use original calibrated glyph mapping, source colors and responsive density scaling. Homepage fresh default: Dense 8px; explicit Fine/Original selection persists across source replacement. Preserve existing renderer, shaders and atlas. Procedural waves are a truthful fallback during unavailable/unverified/undecodable media or unavailable playback, and an explicit user option. They never pass fish-autoplay verification. Reduced motion shows a still frame with explicit Play; autoplay denial provides a click-to-start option. No unprompted autoplay preference override.

Media stays privately provisioned. Keep server SHA256 enforcement, protected approval/attestation, read-only exact-path streaming, Range and HEAD checks, and the existing loopback rewrite. Build-time `NEXT_PUBLIC_ASCII_FEATURED_MEDIA` must come from committed `ops/deploy/ascii-featured-media.json`. The release builder defaults to the approved fish mode; explicit unavailable mode exists for clean-media verification and historical rollback only. Missing configuration must fail closed. A deployment gate must hash the actual served bytes and verify video progression plus ASCII output; intercepted fixtures cannot attest a deployment.

## Public and paywall boundaries

Keep the existing three-file public registry closure and MIT public effect source, local-video adapter and generated examples. No media, private receipt, premium Bento implementation, ZIP/TGZ, entitlement secret or source map enters Git/public artifacts. Bento Duo previews and existing €39 Gumroad links remain public; premium deliverables stay behind the existing checkout. Signature Hero’s unfinished static showcase and all six public preview PNGs are excluded from this release by the owner’s Release Blocker Repair 01 decision. The public sitemap has no Signature Hero route or image link. Source and reference captures remain preserved at `882f194` in the untouched integration worktree. Any future Signature Hero release must use real interactive components; static images are reference material, not an approved product. Historical review receipts do not override this release-scope decision. Megasprint 01 adds an internal, noindex live route; it is not a public release and does not restore the static images. Digital Wake stays its separate Beta with its existing eligibility restrictions. Preserve Drops gating and the exact approved sitemap manifest/date parity.

## Unified checkpoint and branch selection

Accepted unified integration checkpoint: `882f194d295ca95c7cae7535f456e25cfdbab43a` on `integration/approved-product-20261113`, parent `54f7716`. It adds the accepted `3f6e636..6c5779b` slice and exact recovered 01C WIP, followed by scoped shared-adapter reconciliation. The current release-repair candidate is the commit containing Release Blocker Repair 01 on `repair/release-blockers-01`, descending from `882f194`; its final commit/archive hashes and gate results are pinned in the new immutable repair evidence packet. Its explicit static-showcase exclusion supersedes earlier review-route scope.

Exact 01C WIP archive, index, patches and 23-file hash manifest: `/home/swirky/DevHub/experiments/nullworx-live-playgrounds-01c/evidence/unified-reconciliation-20261113T180416Z/`. Original index/worktree remain untouched. Prior receipts are inventoried there. Do not restore a patch over later owner edits.

The next product branch must descend from the latest accepted unified integration/release commit, after checking this contract and current pointers. Never select an older experiment because it contains one desired feature. Preserve dirty work/index before reconciliation; compare missing changes and integrate only those. Keep immutable receipts and distinguish local verification, staged attestation and public activation.

## Rejected historical defaults

Procedural waves as normal landing default, Fine 12px as normal landing default, historical KOI/Jellyfish footage, Digital Wake, replacement shaders/videos, and duplicate video adapters are rejected. They must not silently become the homepage again.

## Blocking checks

`pnpm build` runs product baseline assertions. `pnpm verify` covers contracts and existing units/validators. `pnpm test:product --base-url URL --report NEW_FILE` requires a configured provisioned server, checks actual served hash/Range/HEAD and runs unmocked desktop/mobile fish tests, transport, selectable density, reduced motion, denied autoplay and missing/invalid media. The negative scenarios deliberately intercept failures and cannot count as autoplay evidence. Existing full playground browser and copied-source Next/Vite consumer gates remain required after shared interfaces change. `ops/deploy/smoke-browser.mjs --media ascii-loop30-direct-permission` also enforces the homepage contract during protected staging attestation. No deployment is authorized by a passing local gate.

## Release Blocker Repair 01

Repair branches descend from `882f194d295ca95c7cae7535f456e25cfdbab43a`. Keep the installed controller’s strict two-file public allowlist; do not expand it for the excluded static showcase. Preserve the approved ten-URL sitemap. Procedural ASCII must reject hidden/offscreen/disconnected or cleaned-up draw callbacks, including delayed ResizeObserver entries, while preserving first visible rendering, resume and reduced-motion still frames. The existing hidden frame-count assertion remains blocking and unchanged.


## Megasprint 01 internal candidate

This section records additive work on `sprint/megasprint-01`, descending from release-repair commit `7db32651b8226b21851dd3480db9dd688e50b267`. It is not a public activation and does not change production.

| Surface | Contract |
| --- | --- |
| Signature Hero live route | `/kits/signature-hero` is a real React composition with `preset=cobalt|carbon|porcelain`, pointer light, pause, reduced-motion static mode, live customizer, generated TSX, install contract and shareable bounded URL state. It is `noindex, nofollow`, sets `X-Robots-Tag`, is absent from the sitemap, exposes no image preview and keeps its source under the internal owner-review notice in `components/signature-hero/LICENSE.txt`. |
| Preset identity | Cobalt is the default for this route; Carbon and Porcelain use the approved preset palettes, type and material settings. Do not replace them with screenshots or re-derive them from arbitrary colors. |
| Agent Design DNA | `lib/design-dna/` is schema `1.0.0`. Recipes target only `signature-hero`, `orbit-bento` or `foil-reactor` at version `1.0.0`. Unknown components, versions, tokens, code, CSS, imports and out-of-bounds values fail closed. `fixtures/design-dna/valid` has ten accepted recipes; `fixtures/design-dna/invalid` has twelve rejected patches. Canonical serialization sorts keys. The lab at `/lab/design-dna` is noindex. |
| Bento Duo live demos | The product page mounts the real `OrbitBento` and `FoilReactor` components. The homepage teaser mounts the same components in bounded live frames. Static approved captures remain product-schema images and release references, not site previews. The premium source boundary is unchanged: no download/copy-source control is added and checkout stays the existing Gumroad URL. |
| Material customization | Ashfall Type, Seam Erosion and Sediment Reveal keep their approved defaults. Optional `intensity` and `density` props are additive; defaults normalize to `{ intensity: 1, density: 1 }`. The generated usage snippet carries the current lines, color, intensity and density. Clock, coverage, compositor, raster and surface implementations remain hash-pinned. |
| Public journey | Header/footer link to the live Signature Hero route; the effects gallery links to the three directions and Design DNA. The sitemap remains the approved ten URLs. New routes are noindex. |

Blocking checks for this work:

- `pnpm test:contracts` keeps the static-image exclusion and requires the live route to render `<SignatureHero>` rather than `next/image`.
- `tests/unit/design-dna.test.ts` is the fixture/schema/serialization/adaptor gate.
- `tests/e2e/signature-hero.spec.ts`, `tests/e2e/bento-live.spec.ts`, `tests/e2e/design-dna.spec.ts` and `tests/e2e/material-routes.spec.ts` exercise real browser behavior.
- `pnpm verify` and `pnpm build` remain required. Protected staging is blocked on authenticated sudo; local checks cannot attest the VPS.

## Visual Frontier Promotion 01 — owner decision 2026-11-14

The owner authorizes A / Refractive Type and C / Impossible Material for main,
normal non-force push and protected publication. B / Living Pigment is rejected;
its untracked lab and evidence remain in the original experiment worktree. This
supersedes the historical ten-URL count solely by adding the two approved public
pages: `/effects/refractive-type` and `/effects/impossible-material`. The public
sitemap is now twelve URLs. Signature Hero, Design DNA and Digital Wake keep
their existing restrictions. The fish and all earlier accepted defaults remain.

Keep A1/A2 and C1/C2, original controls/defaults, source closure and notices.
Full rendering is explicit opt-in; gallery/home cards are labelled live Canvas2D
companions. One full GPU lease serializes initialization and asynchronous cleanup.
A's original optical formulas use a same-context Three target. C retains the
110-step SDF and four physical ribbon layers. No screenshot or external media
supplies these previews. See `docs/visual-frontier/` for rights and installation.

Blocking checks: `tests/unit/visual-frontier.test.ts`,
`tests/e2e/visual-frontier.spec.ts`, `pnpm test:distribution:frontier` and
`pnpm test:visual-frontier`. Protected smoke/report gates additionally require all
four full variants and complete source. Exact inventoried earlier commits retain
their historical rollback route profile; new commits require the expanded scope.
Archive/member/media/approval/attestation protections and Caddy are unchanged.
