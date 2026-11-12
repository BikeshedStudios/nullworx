# ASCII Quality 02

Owner decision 2026-11-12: adopt calibrated B, Fine and the independent idle gate.
Integration base: `e25dac46c1129deb66a54a68537dbbdb83804af2`.
Original experimental checkout and its uncommitted changes remain untouched.

The video renderer now sorts the actual rasterized glyph slots by measured
coverage at each cell size/DPR. `?asciiRamp=original` restores A's exact atlas
ordering and shader; it does not change the detail selector or lifecycle gate.
Other values, including the former `calibrated` value, select calibrated video
mapping. The procedural homepage fallback is unchanged. No C edge shader or D
temporal filter is included. Fine remains 12 desktop CSS pixels with the tested
responsive stage rule. Replacing a source preserves a user's selected detail;
a fresh page starts at Fine.

The idle gate sleeps when the wave clock is frozen and pointer strength settles.
Media frames, play/pause, seeks, visibility/intersection, size/settings changes,
source replacement and context recovery invalidate or recreate it. The wrapper
samples its non-preserved output inside the draw callback, without a second RAF.

## Featured media is a separate activation

Status: **HOSTING_BLOCKED** for public serving. The exact clip was uploaded
privately to `/home/viktor/nullworx-media/ascii/loop30-v2-807bb27e.mp4` with
matching local/remote SHA-256 and mode 0600. No site configuration or production
pointer changed. Deployment history identified the working explicit SSH key;
read-only inventory succeeded. The account lacks noninteractive sudo and the
current Caddy site explicitly blocks `/media/*`.
The source page confirmed the title/uploader below but exposed no licence field
or CC link in the expanded description. This does not contradict the owner's
CC statement; the exact version and derivative linkage still need a receipt.

- Original: <https://www.youtube.com/watch?v=B30S0Vr9N9A&t=3512s>
- Title: 12 Hours Stunning 4K Betta Fish with Relax Music 🐠 Relaxing Fish in Black Aquarium
- Uploader: Animal Exploration Project (`@AnimalEP`)
- Accepted SHA-256: `807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238`
- Dated local receipts: `evidence/ascii-release-02/youtube-2026-11-12.{json,png}`.
  These establish title/uploader, **not** a CC setting.
- Loop report names `source-download/source.mp4`, without a download receipt
  linking that file to the YouTube ID. Do not infer provenance from a README.

After licence/version and source linkage are verified, the build-time public
`NEXT_PUBLIC_ASCII_FEATURED_MEDIA` JSON must contain `src`, `sha256`, `title`,
`uploader`, `licenseUrl`, `receipt`, and `sourceLinkage`. Use the exact title,
uploader and hash above; `src` must be `/media/ascii/loop30-v2-807bb27e.mp4`.
`licenseUrl` must be the exact verified CC BY version URL (no default version).
The final two fields identify retained dated licence and derivative receipts.
They are public identifiers, never private paths or credentials. This config
is an operator assertion backed by those receipts, not automatic rights proof.

With complete configuration, both showcases fetch and SHA-check exact bytes
before selecting fish. Missing, wrong-MIME or mismatched media leaves an explicit
notice beside procedural waves and the local picker. A local source always
overrides the showcase; files remain browser-local. `LocalVideoField` also accepts
an arbitrary same-origin/CORS-enabled video URL via its `source` prop.
Attribution appears next to the selected fish, including source, uploader,
verified CC version, loop/color/ASCII modifications and no endorsement.

## Hosting/rollback procedure (not executed)

Use only the existing Hetzner/Caddy host. Inventory its active configuration,
deployment controller, resources and unrelated routes first; retain a rollback
copy of the relevant site block. Store exact bytes outside all Git/release trees:
`/srv/nullworx-media/ascii/loop30-v2-807bb27e.mp4`. Add a narrow same-origin Caddy
handler for `/media/ascii/*`; do not replace a shared Caddyfile. Serve video/mp4,
HTTPS, byte ranges and immutable caching only for that versioned path. Compare
SHA-256 before/after transfer. Stage using the existing controller and verify
HTTP 206, H.264 decode, source RGB/motion, WebGL uploads, no CORS/console errors
and all original routes before promotion. No transcoding or substitutions.

Immediate disable: rebuild without `NEXT_PUBLIC_ASCII_FEATURED_MEDIA` and use
the existing verified release rollback/promotion control. To disable serving
independently, restore only the backed-up media handler and validate/reload
Caddy; preserve unrelated host config. A disabled media handler produces an
honest fallback even for an already-configured browser build.

Keep `pnpm test:distribution:site` on a clean, unconfigured build. A separate
`pnpm exec playwright test -c playwright.ascii-media.config.ts` checks enabled
behavior against a locally mocked exact asset and **fixture-only** metadata.
That test configuration does not clear hosting rights or prove live deployment.

Code rollback: revert the focused ASCII release commit; no media or deployment
rollback is necessary for code-only publication. Digital Wake remains separate.

## Verification — 2026-11-12

All requested commands exited 0 in the integration worktree: frozen install,
lint, typecheck, unit tests (50 pass / 1 absent prepared-media fixture skipped),
build, full Playwright (22 pass / 9 optional-media tests skipped), launch,
distribution, distribution site, secret scan and diff check. The separately
supplied fish and gears each passed all five hardware media tests (10 total).
The separate enabled-media fixture suite passed (1 test); a clean build was
restored and the complete clean release sweep repeated after the lifecycle fix.

Chrome 156, ANGLE/OpenGL ES 3.2, NVIDIA GeForce RTX 4060 Laptop GPU. Mobile checks
are desktop-GPU viewport emulation. Pixel comparisons on both independent clips:
original override equals upstream A; default B differs; the rejected C query has
no effect; simultaneous instances agree. Paused/settled offscreen/simulated-hidden
GPU draws and texture uploads stop, and resume advances uploads. Source replacement,
loop, paused seek, resize, reduced motion, context loss/retry and disposal passed.
Initial reduced-motion hardware verification exposed a status-sampling throttle
bug; the first frozen draw is now sampled immediately. The rebuilt suite passed.

Exact commands, exit codes, failures, hashes and screenshots remain under local
`evidence/ascii-release-02/`. No evidence video, source pixels, sidecars, experimental
C code or unrelated product changes are included in this commit. Public fish
hosting remains blocked as described above; code publication does not deploy it.

CI follow-up: the first remote run exposed the launch visual check's fixed 250ms
streaming race on the first mobile route. The test now waits for the same required
main landmark and heading before inspecting them, preserving all assertions.
Lint, typecheck, launch and diff checks were repeated locally with exit 0. The
application and unrelated effect code were not changed by this test-only fix.
