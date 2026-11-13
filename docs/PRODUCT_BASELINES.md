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

Keep the existing three-file public registry closure and MIT public effect source, local-video adapter and generated examples. No media, private receipt, premium Bento implementation, ZIP/TGZ, entitlement secret or source map enters Git/public artifacts. Bento Duo previews and existing €39 Gumroad links remain public; premium deliverables stay behind the existing checkout. Signature Hero’s unfinished static showcase and all six public preview PNGs are excluded from this release by the owner’s Release Blocker Repair 01 decision. There is no released `/kits/signature-hero` route or image link. Source and reference captures remain preserved at `882f194` in the untouched integration worktree. Any future Signature Hero release must use real interactive components; static images are reference material, not an approved product. Historical review receipts do not override this release-scope decision. Digital Wake stays its separate Beta with its existing eligibility restrictions. Preserve Drops gating and the exact approved sitemap manifest/date parity.

## Unified checkpoint and branch selection

Current integration checkpoint: the commit containing this contract on `integration/approved-product-20261113`, parent `54f7716`; its full SHA and diff are pinned in the immutable review receipt. It adds the accepted `3f6e636..6c5779b` slice and exact recovered 01C WIP, followed by scoped shared-adapter reconciliation.

Exact 01C WIP archive, index, patches and 23-file hash manifest: `/home/swirky/DevHub/experiments/nullworx-live-playgrounds-01c/evidence/unified-reconciliation-20261113T180416Z/`. Original index/worktree remain untouched. Prior receipts are inventoried there. Do not restore a patch over later owner edits.

The next product branch must descend from the latest accepted unified integration/release commit, after checking this contract and current pointers. Never select an older experiment because it contains one desired feature. Preserve dirty work/index before reconciliation; compare missing changes and integrate only those. Keep immutable receipts and distinguish local verification, staged attestation and public activation.

## Rejected historical defaults

Procedural waves as normal landing default, Fine 12px as normal landing default, historical KOI/Jellyfish footage, Digital Wake, replacement shaders/videos, and duplicate video adapters are rejected. They must not silently become the homepage again.

## Blocking checks

`pnpm build` runs product baseline assertions. `pnpm verify` covers contracts and existing units/validators. `pnpm test:product --base-url URL --report NEW_FILE` requires a configured provisioned server, checks actual served hash/Range/HEAD and runs unmocked desktop/mobile fish tests, transport, selectable density, reduced motion, denied autoplay and missing/invalid media. The negative scenarios deliberately intercept failures and cannot count as autoplay evidence. Existing full playground browser and copied-source Next/Vite consumer gates remain required after shared interfaces change. `ops/deploy/smoke-browser.mjs --media ascii-loop30-direct-permission` also enforces the homepage contract during protected staging attestation. No deployment is authorized by a passing local gate.

## Release Blocker Repair 01

Repair branches descend from `882f194d295ca95c7cae7535f456e25cfdbab43a`. Keep the installed controller’s strict two-file public allowlist; do not expand it for the excluded static showcase. Preserve the approved ten-URL sitemap. Procedural ASCII must reject hidden/offscreen/disconnected or cleaned-up draw callbacks, including delayed ResizeObserver entries, while preserving first visible rendering, resume and reduced-motion still frames. The existing hidden frame-count assertion remains blocking and unchanged.
