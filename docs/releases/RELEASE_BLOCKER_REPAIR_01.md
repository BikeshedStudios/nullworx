# Release Blocker Repair 01

Source baseline: `882f194d295ca95c7cae7535f456e25cfdbab43a`. One isolated worktree/branch: `repair/release-blockers-01`. The clean integration worktree, earlier branches, original dirty 01C index/files and all prior immutable evidence are preserved. The owner’s current release-scope decision supersedes historical static-showcase reviews; it does not approve a static-image Signature Hero product.

## A — package rejection and release scope

The installed `/usr/local/lib/nullworx/ctl.py` SHA256 is `af08dd07a627e0df161d284e96b7cb4408f5e26cc24a719937d9ff2469fbf286`, equal to the committed controller. In `validate_members`, `public_files` contains only `public/material-wave-a/mineral-study.webp` and `public/tools/fin-editor-012.html`. A non-directory public member must be a regular file in that set; otherwise it raises `Unapproved public asset: media, sidecars and derivatives excluded`.

Exact rejected files:

- `public/signature-hero-01/carbon-1440.png`
- `public/signature-hero-01/carbon-390.png`
- `public/signature-hero-01/cobalt-1440.png`
- `public/signature-hero-01/cobalt-390.png`
- `public/signature-hero-01/porcelain-1440.png`
- `public/signature-hero-01/porcelain-390.png`

The application asset checker had separately allowed eight files, so it disagreed with the installed two-file release policy. The owner now explicitly excludes this unfinished static showcase. This repair removes its page/CSS/data and preview-check helper, the six public PNGs and the previous static-showcase browser assertions from the repair release. It restores the application checker to the same strict two-file scope and tests that the excluded route/images return 404 without navigation/image references. No controller rule, path safety, media restriction or protected approval flow is relaxed.

Original showcase source and exact reference-image bytes remain in the untouched `882f194` worktree and Git history. Historical review/provenance documents remain as references. No Cobalt, Carbon or Porcelain component is rebuilt. Any future product release must provide real interactive components. The route was already outside the approved sitemap, so the ten-URL manifest/date contract remains unchanged.

## B — hidden procedural frame

The original virtual-clock assertion can pass or fail depending on native ResizeObserver notification timing. A controlled delivery of a real queued notification reproduced the exact `1 → 2` transition against the unmodified baseline, with the trace recording an actual canvas draw while `document.hidden` was true. This is a real callback lifecycle violation exposed by a scheduling race, not grounds to delay, weaken or waive the assertion.

`usePreviewActivity` correctly changed visibility state. `ProceduralAscii` then cleaned up and recreated its effect because `playing` changed. The new setup unconditionally called `draw()` and registered a ResizeObserver whose callback also called `draw()` without a visibility check. Its initial notification could arrive after the test observed suspension. RAF cancellation alone could not block that observer callback. The effect also lacked a lifetime flag for already-queued work after cleanup.

The repair adds a shared drawability guard for live, connected, visible instances while the document is visible. Both draw and animation callbacks use it; a hidden animation callback returns without scheduling another frame. Cleanup invalidates the instance before canceling RAF/disconnecting its observer. Visibility is an effect dependency so reduced-motion/paused instances still render their first visible frame and redraw correctly on return. The formula, palette, density, glyphs, wave clock math, existing renderer, atlas, fish adapters and media settings are unchanged.

The original `tests/e2e/ascii-playground.spec.ts` file and hidden-frame equality assertion remain byte-identical. Additional regression coverage delays real ResizeObserver notifications across suspension, checks draw/frame/time stability, delivers stale callbacks after effect cleanup and unmount, and verifies visible resume plus initial reduced-motion still frames. Focused verification uses development StrictMode; the existing production release gate remains required.

## Evidence and release verification

Fresh evidence root: `/home/swirky/DevHub/evidence/nullworx-release-blocker-repair-01-20261113T192403Z/`. Baseline timing pass, controlled `1 → 2` failure, callback events and both failure/success browser traces remain separate. The first scope-test run found duplicate legitimate noindex meta tags; its selector was corrected to verify every robots tag, and that failed receipt is retained. Four final focused checks pass, including the unchanged original assertion. Five prebuild contract assertions and the strict public-asset test pass.

The inherited tools image lacked FFmpeg, and enabling it exposed a separate builder I/O defect: FFmpeg read the Bash heredoc and consumed later release commands. The builder now uses `ffmpeg -nostdin`; an immutable derivative tools image supplies FFmpeg 6.1.1 while retaining Node 24.20.0, pnpm 12.15.0 and glibc 2.39. Failed setup/build attempts are retained and do not count as release passes.

Final affected release gates run sequentially against a clean committed snapshot and compatible pinned Linux builder. The evidence packet records exact command arrays, results, source/dependency/build/media hashes, the final archive, installed-controller archive acceptance, actual provisioned fish verification and the GO/NO-GO decision. No staging or production action is authorized by local verification.

The homepage must still use exact LOOP30 SHA256 `807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238`, Dense 8px, attribution and private provisioning. Media hosting remains based on the existing owner attestation of direct permission for nullworx.space streaming/ASCII; primary correspondence is not independently verified, and raw media redistribution is not cleared. Media bytes and private correspondence stay outside Git and release archives. Gumroad, premium boundaries, Drops and discovery contracts remain unchanged.

## Rollback and operational boundary

Nothing is pushed, merged, deployed, published or changed in Caddy/Gumroad. Local rollback means stop only this repair’s preview processes and continue using the untouched integration worktree at `882f194`; never reset or reverse-patch original 01C WIP. Preserve the repair commit, artifacts and receipts. Future deployment requires separate exact-artifact owner authorization and new protected staging attestation. A later production rollback must use the existing protected controller and retained previous production artifact/media contract with fresh authorization, followed by edge verification/finalization; local source checkout is not a deployed rollback.
