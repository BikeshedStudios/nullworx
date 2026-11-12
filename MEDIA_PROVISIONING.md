# Media provisioning and rights

## ASCII release update — 2026-11-12

The owner has approved calibrated ASCII B, Fine and continuation into Digital
Wake. The owner states the fish source is Creative Commons. Public hosting
still requires the exact version and a receipt linking LOOP30 to that source.
The current source inspection and separate activation/rollback contract are in
[ASCII Quality 02](docs/releases/ASCII_QUALITY_02.md). Its dedicated
`NEXT_PUBLIC_ASCII_FEATURED_MEDIA` setting affects only ASCII; do not activate
the fish-specific Digital Wake media setting as part of this release.
The historical investigation below is retained as dated evidence.

## Accepted source

`loop30-v2.mp4` is the owner-approved 30-second fish video. Do not substitute it. SHA-256:
`807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238`.
12,862,251 bytes; H.264 High / avc1, yuv420p, BT.709, 1920×1080, 30fps, 900 frames, no audio. The original already contains its accepted cyclic crossfade. Neither source nor presets were re-encoded or retuned.

## Rights investigation — 2026-11-01

The owner confirms commercial intent and approves this visual asset. This records owner authorization, not a source-specific third-party licence receipt.

Local loop metadata records processing of `source-download/source.mp4`, but no creator, licence or grant. The loop README names `https://www.youtube.com/watch?v=B30S0Vr9N9A` as an example download command; this alone does **not** prove that exact file's origin. The source-specific YouTube page could not be fetched and exact-ID search returned no results. There is no licence metadata in the accepted MP4. No definitive finding that the source is unlicensed is made.

[YouTube's licence documentation](https://support.google.com/youtube/answer/2797468?hl=en) distinguishes default Standard and CC BY licences. Its [terms](https://www.youtube.com/static?template=terms), “Licence to Other Users”, do not grant independent use outside service features. A YouTube URL or the ability to download therefore does not establish self-hosting permission. These general terms cannot identify this particular file's licence.

Historical KOI records refer to [Pexels video 6392574](https://www.pexels.com/video/6392574/); that source-specific page was inaccessible. The [general Pexels licence](https://www.pexels.com/license/) permits website use under its terms, while [terms section 5](https://www.pexels.com/terms-of-service/) restrict standalone distribution. General terms do not independently verify the exact KOI files. No KOI footage is required by the current LOOP30 homepage, and none is copied to this release.

| Permission | Finding | Action |
|---|---|---|
| Owner approval / intended commercial website asset | Confirmed in this task | Preserve exact LOOP30 and presets |
| Third-party commercial website hosting, processing and serving | Source-specific grant unverified | Keep media local; production path ready |
| Raw MP4 / derivatives in a public Git repository | Separately unverified | Exclude all video, posters, masks, source-color sidecars and recordings |
| Production deployment | Not authorized | No deployment |

To clear hosting, retain a source/creator receipt or ownership declaration tied to the accepted file, applicable commercial/derivative/hosting terms and required attribution. Public Git redistribution needs its own explicit scope. Hosting clearance alone does not trigger a media commit. Code-only consolidation is expressly authorized while these remain unresolved.

## Local provisioning

From this checkout:

```sh
pnpm media:provision --experiments ~/DevHub/experiments
pnpm build
pnpm start --port 3350
```

The script verifies the exact MP4 and fin-motion/region hashes, validates sidecar linkage, and copies to ignored `public/media/local/`. It refuses to overwrite different existing files. Sources: `loop30/loop30-v2.mp4`, `ui-forge-digital-wake-01/public/media/{fish-data,fish-annotations,fin-motion-012,fin-regions-012}.json` and optional `ui-forge-white-journey-01/public/media/local/loop30-v2-vp9.webm`. Restart an already-running production preview after adding public files.

For another machine, obtain these cleared files from the owner and place them under the same ignored paths. File selectors also work without provisioned media. Arbitrary local videos support reconstruction only: wake emission stays suppressed unless the exact source hash and valid matching data agree. Files stay in the browser; no upload endpoint exists.

Linux WebKit may require the existing full-resolution lossless VP9 compatibility copy for ASCII. It is 148.8MB, local-only, and **not** presented as an optimized production asset. Digital Wake currently uses H.264; unsupported codecs show an explicit error. No universal browser/GPU performance claim is made.

## Production integration, after hosting clearance

Set `NEXT_PUBLIC_UI_FORGE_MEDIA_BASE` at build time to an immutable path, e.g. `/media/production/loop30-v2-807bb27e` or `https://<owner-cdn>/ui-forge/loop30-v2-807bb27e`. Serve the same filenames there. The accepted MP4 is already a compact 3.43Mbps H.264 stream; preserve its exact bytes so SHA validation remains valid. Do not change frame count, timing, color, source pixels or presets. No production encode or upload was performed while hosting rights remained unverified.

Serve MP4 as `video/mp4`, JSON as `application/json`, WebM as `video/webm`; support byte-range requests (206), HTTPS and CORS for anonymous video texture sampling and fetches. Use `Cache-Control: public, max-age=31536000, immutable` only on immutable version paths; same-origin `/media/production/:version/*` already has that header configured. CDN headers must be configured there independently. Missing files stay unavailable; never silently use other footage. Before deployment, verify actual caching/range/CORS, browser playback and source synchronization. Any future compatibility encode must be independently compared and versioned; do not bypass the source hash check.

## Manual fin correction

The beta uses manually defined distal caudal sectors intersected with conservative fish masks. It does not automatically recognize fins. Previous evidence reports 122 unsupported frames; containment is not anatomical certification.

After local provisioning, open `/tools/fin-editor-012.html`. Edit keyframed polygons (640×360 coordinates), review endpoints and intervening frames, mark only reviewed geometry and export the draft. Keep backups; replace only a local working `fin-regions-012.json` deliberately. Polygons with mismatched topology/unreviewed endpoints suppress emission. Rebuild offline with an isolated Python environment containing OpenCV and NumPy:

```sh
python scripts/build_fin_motion_012.py
```

It reads ignored local video, fish masks, body annotations and edited regions, then writes local motion and ignored evidence. If body/fish masks changed, rebuild them first with `python scripts/build_fish_data.py`. Review generated contact sheets, invalid spans and actual spawn markers, then run provisioned tests and browser debug before accepting. Never infer anatomical correctness from a zero-outside-mask count. Changed annotation/motion receipts must be deliberately versioned in the provisioning script for a new accepted asset revision.
