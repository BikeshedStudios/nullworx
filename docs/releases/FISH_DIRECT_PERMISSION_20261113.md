# Bounded fish restoration — 2026-11-13

Baseline: `3f6e6360f0686106886f0bb3f6d2d7303d11ea36`, confirmed on GitHub main
and the VPS production and staging pointers on 2026-11-13. Existing UX journey,
mobile-quality and other WIP remain separate. No Digital Wake work is included.

The owner reports obtaining direct permission from the footage rights holder.
Website self-hosting and transformed ASCII display are authorized. The private
operator record `owner-direct-permission-2026-11-13-loop30-v2` records that
assertion, scope, credit and exact asset; no private correspondence or invented
CC version is included. The assertion date is not the grant's unknown date.

Exact source: 12,862,251 bytes, 30 seconds, H.264/avc1, 1920×1080, 30fps,
BT.709, silent; SHA-256
`807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238`.
Public credit: Animal Exploration Project (@AnimalEP). The previously recorded
source title and YouTube link remain factual attribution, without a CC claim.

## Application and integrity

Owner-selected Dense is the default detail (8px desktop cells). Fine (12px) and
Original (16px) remain available. Source replacement preserves the chosen detail;
a fresh page starts at Dense. The responsive density rule is unchanged.

`featured-media.ts` accepts a backward-compatible CC BY path or a direct
permission path. Direct permission requires receipt/source-linkage identifiers,
public credit, the exact content-addressed path/hash and server integrity mode.
The reviewed public build setting is `ops/deploy/ascii-featured-media.json`.
The direct path checks availability/MIME/length with HEAD and streams via video;
it does not download a second full copy for a browser SHA calculation. The
controller verifies the root-managed server file's exact bytes instead. The
legacy CC path retains browser checksum validation.

Source bytes live only at `/srv/nullworx-media/ascii/loop30-v2-807bb27e.mp4`.
Caddy serves only the exact GET/HEAD path, with `video/mp4`, byte ranges and
`public, max-age=31536000, immutable`. Directory listing, private receipts and
other filenames remain inaccessible. A loopback-only Caddy listener on 3403
and one exact Next rewrite allow staging at its existing port 3402. Production
Caddy serves the same exact file directly after an explicit operator step.

Loading, reduced motion, failed media and user-selected local files retain
explicit states and procedural fallback. No media is copied into `public/`.

## Release contract

The existing builder first verifies the clean unconfigured application, then
rebuilds with only the reviewed featured-media JSON when the explicit mode
`ascii-loop30-direct-permission` is selected. `NEXT_PUBLIC_*` is build-time;
changing a service environment cannot activate an existing build.

The existing protected controller accepts the new exact media contract, binds
it to the approval/artifact/HTTP/browser reports and checks the installed media.
It retains root-owned approvals, expiry, exact commit/archive digest, full
staging attestation and previous-release rollback. The installed route-check
and rollback repairs are retained without unrelated application changes.
The public-asset allowlist and archive prohibition on video are unchanged.

Operator commands, exact new commit/archive digest, preflight receipts and
browser results are prepared outside Git under
`~/DevHub/evidence/nullworx-fish-restoration-20261113/`. Protected installation,
staging and public activation require the owner's authenticated VPS terminal.
Never report a prepared bundle as an installed or attested VPS release.

## Next design-system integration changeset

Create a separate branch from the accepted fish baseline. Inventory and preserve
the two existing UX/mobile WIP diffs before selecting changes. Add a typed,
bounded Visual Recipe schema and semantic tokens for palette, density,
headline, accent, motion preset and content slots, plus
`docs/DESIGN_CONTRACT.md` and agent instructions. Integrate one accessible React
consumer with validation/fallback, keyboard states and reduced motion. Keep
Signature Hero Carbon/Porcelain/Cobalt distinct from Material Editorial's three
palettes; do not publish premium source or unresolved inherited dependencies.
Compare the same ten customization tasks using plain instructions and recipes
at 390/1440; record constraint violations, repair count, build results and
visual similarity before expanding the system. Gallery manifest consolidation
and broader homepage redesign are subsequent changesets.
