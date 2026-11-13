# Unified local review candidate — 2026-11-13

Authority: fish `54f7716`; playground 01B `6c5779b` plus exact recovered 01C WIP. Production remains `3f6e636`; no push, merge, deployment, Caddy or commerce change is authorized.

## Missing-change matrix against dirty 01C

| Fish release slice | 01C before reconciliation | Scoped integration |
| --- | --- | --- |
| Exact LOOP30 hash/path/title and legacy CC browser hash | Already present | Reuse existing identity and backward-compatible validation. |
| Direct-permission discriminated receipt, credit, server integrity and HEAD/size validation | Absent | Retain fish `featured-media.ts` and committed public receipt verbatim. |
| Homepage Dense 8px | Absent; standalone adapter defaulted to Fine | Featured instance starts at 8; configured playground settings still own playground density. |
| Featured attribution without invented CC licence | Absent | Apply only attribution hunk in existing 01C adapter. |
| Loading still field, rendered-frame readiness, featured source/codec diagnostics, 20% visibility threshold | Absent | Apply fish hunks to 01C adapter; keep its single renderer, live setting updates, suspension and redraw. |
| Selection clears notices / async verification cannot override local choice | Partial: choice guard existed on success only | Add missing notice and rejection guard. |
| Stream rewrite and protected direct-permission deployment/controller gates | Absent | Retain fish files verbatim; no infrastructure execution. |
| Public-asset allowlist | Both branches have distinct accepted additions | Preserve 01B Signature Hero preview allowlist and fish video prohibitions. |
| Playground controls, source-code sharing and discovery corrections | Already in 01A/01B/01C; absent from fish branch | Apply exact accepted playground slice; no rebuild. |
| Fish regression tests / release documentation | Absent | Retain receipt tests and docs; replace fixture-only proof with mandatory actual-server gate. Keep playground Fine tests separate. |

The integration worktree starts from fish `54f7716`. Disjoint 01A/01B changes and recovered WIP are applied once; shared adapters are reconciled by the above hunks. No branch merge, directory replacement or media copy is used. See `../PRODUCT_BASELINES.md` for permanent behavior, boundaries and branch-base rules. Final commit, results, evidence hashes, comparison and rollback are recorded in the review evidence report.

## Verification and local review

Final receipts: `evidence/unified-review-20261113T180914Z/` in the integration worktree. This fresh evidence root preserves every failed/interrupted run as well as final results; no prior receipt is overwritten.

| Gate | Result |
| --- | --- |
| Lint / types / validators / clean build / configured build / secret scan | PASS; 8 effects and 3-file public registry closure retained |
| Unit suite | 163 passed; 1 existing Digital Wake accepted-media skip |
| Complete browser coverage, one worker | 79 final case passes, 3 existing optional-media skips; 17 ASCII cases retained from `final/e2e.json`, 5 standalone cases and 56 other passes plus one corrected polish case in `verified-runtime/` |
| Launch | 169 built / 109 HTTP / 90 visual passes; 16 accessibility states with zero findings; exact ten-URL sitemap |
| ASCII clipboard consumers | Fresh pinned Next/Vite installs, types, builds, both modes, local files, reduced motion and 320/390/768/1440 pixel equality to 01B PASS |
| Registry distribution | 11 unit passes; actual public GitHub/shadcn Next/Vite installation/build/interactions PASS |
| Distribution site | 60 responsive/motion route states; zero accessibility findings |
| Actual provisioned LOOP30 product gate | 8/8 PASS: served SHA256, HEAD/Range, unmocked desktop/mobile autoplay and ASCII output, Dense 8px desktop/responsive mobile cells, Fine/Original, pause/seek/resume/loop, reduced motion/opt-in, denied autoplay recovery, absent/wrong-size/undecodable alternatives |
| Featured release HTTP / browser smoke | 24/24 HTTP and 26/26 browser checks PASS on the configured local preview |
| Preservation | Exact 23-file original WIP, raw index, source refs and all inventoried prior receipts unchanged; VERT/FRAG and fish parser/config/controller/receipt unchanged |

Two older standalone-control tests had targeted the now-controlled playground; they now exercise the standalone homepage adapter and wait for hydration before selecting a file. Their failed/interrupted invocations remain recorded. The new denied-autoplay harness initially relied on sticky browser activation state; it now refuses play until an explicit click. Its failed receipt and the final eight-pass actual-server receipt are separate. Application source did not change during these test corrections. No fixture-only autoplay result is used as a hosting receipt.

Review: <http://127.0.0.1:3104/> and <http://127.0.0.1:3104/effects/ascii-waves>. Existing 01C preview on 3103 remains untouched. The app uses the existing rewrite to a loopback-only, exact-path, read-only review stream on 3403. The stream checks the original MP4 SHA before listening and leaves the file outside the repository. This local harness does not grant production hosting authorization.

To restart the already configured build, run `node scripts/preview-featured-media.mjs /home/swirky/DevHub/experiments/loop30/loop30-v2.mp4` and, in another terminal from this worktree, `pnpm start --port 3104`. A rebuild must use only the committed public receipt in `NEXT_PUBLIC_ASCII_FEATURED_MEDIA`; changing a runtime environment does not configure an existing build.

## Comparison and readiness

Parent is staged fish source `54f7716`; source baseline `6c5779b` and its dirty 01C worktree survive unchanged. The fish receipt/parser, streaming rewrite, provisioning documentation and protected controller remain byte-identical. VERT/FRAG are identical. The recovered 01C renderer/settings/playground/source closure remain byte-identical except the explicitly reconciled home/video adapters and their CSS. The release diff adds the existing 01A/01B/01C functionality and permanent contracts/gates. Exact diff, file comparison, final SHA and evidence hashes are pinned in the external review receipt.

Ready for local integrated review. Production promotion is not performed or authorized. No new release archive, protected staging installation/attestation or public-edge activation receipt is claimed. A future promotion must bind a new clean unified artifact SHA to fresh protected staging HTTP/browser attestations and normal owner authorization; the existing `54f7716` staging attestation cannot attest different source. Production remains the existing `3f6e636` baseline by the owner's authoritative statement; this task did not independently inspect current remote pointers or public fish playback. No deployment, Caddy, Gumroad, remote branch or existing stage was changed.

The existing optional Digital Wake unit/three browser skips require media absent from the clean build and do not weaken the mandatory fish gate (zero skips). Chromium/Linux and emulated mobile were verified; no fresh WebKit, physical-device or screen-reader result is claimed. The official clean-archive packaging command was not run; its relevant commands were run sequentially with immutable receipts, including the actual configured media gate. Two legacy test-interface corrections required scoped reruns. Consumer source/lock/log/screenshots are archived under `verified-runtime/` for persistence beyond temporary fixtures.

## Rollback

No production rollback is needed: nothing was promoted. Stop only this candidate's local preview processes (recorded in the external `preview-processes.json`); retain its branch and evidence. Continue reviewing the untouched original 01C at 3103 or the preserved fish worktree at `54f7716`. Do not reset, clean or apply reverse patches over the dirty 01C tree. `exact-01c-wip.tar.gz`, both patches and the raw index are a recovery checkpoint for comparison/restoration into an unused directory.

After any future authorized promotion, use the existing protected controller `rollback --approval <root-owned-rollback-approval.json>`, then its required edge verification/finalize flow. It restores the inventoried previous release and media contract; do not repoint services manually or treat source checkout as a deployed rollback. Historical production `3f6e636` and staged fish `54f7716` remain distinct rollback/review anchors.
