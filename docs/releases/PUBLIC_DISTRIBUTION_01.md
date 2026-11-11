# Public distribution 01

Prepared 2026-11-11. Publication is awaiting owner approval. No push, merge, tag, deployment or visibility change was performed.

## Source comparison and minimal release

| Source | Exact commit | Relationship |
| --- | --- | --- |
| GitHub `main` | `f5b3485e7758a0a176dd76711d4c09092240b83e` | Older Wave A release |
| Public `release/nullworx-space-public-01` | `4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e` | One sanitized commit directly on main; discovery, accessibility fixes, registry and existing release tooling |
| Deployed polish | `697468992c453c9ca9ed93862f35b3089dc67acb` | One 30-file polish commit directly on the sanitized release |
| This review | Branch `review/public-distribution-01` | Deployed polish plus documentation, metadata and bounded test changes |

One PR to `main` can carry this linear public-source lineage. No private integration branch or merge ancestry is needed. Existing WIP is preserved separately. Application paths (`app/`, `components/`, `lib/`), production configuration, dependency versions, root lockfile and LICENSE are unchanged from the deployed polish. The new package and registry metadata identify nullworx.space, UI Forge and Bikeshed Studios.

Both existing CI workflows replace an unresolvable pnpm action pin with verified upstream v4 commit `b906affcce14559ad1aafd4ab0e942779e9f58b1`. Workflow permissions, triggers and deployment behavior are unchanged. All referenced action commits were checked against upstream GitHub; actual GitHub CI still awaits the approved push.

The only registry item is Magnetic Focus. Its component, CSS Module and hook are byte-identical in the tested public commit, deployed polish and review. The gallery's other effects do not acquire independent-install claims.

## Reproducible public installation

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium --with-deps
pnpm test:distribution
```

The default is the already-public full SHA `4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e`. Both consumers use the real shadcn 4.23.0 GitHub installer, without a local-source fallback. The registry, all three sources and MIT notice are fetched from public GitHub. [Exact commands](../MAGNETIC_FOCUS_INSTALL.md) and [source hashes/results](remote-install.json).

| Consumer | Public install + exact sources | Typecheck + build | Browser interactions + motion + axe |
| --- | --- | --- | --- |
| Next.js 16.4.3 / React 19.3.1 | PASS | PASS | PASS, zero violations/errors |
| Vite 8.3.7 / React 19.3.1 | PASS | PASS | PASS, zero violations/errors |

Dry-runs write nothing; installs add exactly three files and preserve existing fixture files. Browser checks cover keyboard, touch, pointer/reset, paused/disabled transitions, initial/live reduced motion and 1280/390/320px. Consumer evidence is Chromium/Linux, not a claim about all browsers or independently observed external adoption.

## Verification and rights

- `pnpm verify`: lint, typecheck, eight-effect and registry validation, **44 unit tests passed / one restricted-media skip**, production build and secret scan.
- Clean-media Chromium E2E: **21 passed / three restricted-media skips**, including a locally generated test-pattern video for the local-video lifecycle. No restricted footage was used.
- `pnpm test:distribution`: **11 registry tests**, both public installations, builds and consumer browser suites pass.
- `pnpm test:distribution:site`: **60 route/viewport/motion checks**, ten full-page axe scans, zero violations.
- `pnpm test:launch`: **158 built-metadata, 101 local HTTP and 80 visual checks** pass; Digital Wake's default, selected, expanded and mobile controls pass axe in both motion preferences. The earlier contrast blocker is resolved in the sanitized release.
- `bash ops/deploy/check.sh`: existing controller, asset-allowlist and HTTP smoke tests pass; no infrastructure operation is performed.
- Site navigation and documentation links, screenshot content, source import closure, licensing, public assets and clean builds were reviewed. Raw logs/screenshots remain local; the compact remote receipt is public-safe.

Only the two existing approved assets are under `public/`; their hashes are unchanged. The new README PNG is a direct 1440×1000 screenshot of the clean site's original procedural homepage, captured with reduced motion, without video/media requests. Its code/UI content uses this repository's MIT terms; fonts retain their existing OFL terms. No restricted footage, frames, masks, motion sidecars, private operational receipts or integration history is added.

The MIT copyright remains CipherCuttle. Bikeshed Studios is the publisher. [Dependency notices](../../THIRD_PARTY_NOTICES.md), [generated artwork provenance](../material-suite/SOURCE_RIGHTS.md) and [separate media restrictions](../../MEDIA_PROVISIONING.md) remain applicable. Missing video rights do not block this media-free source release; they continue to block distributing that footage or its derivatives.

Build reproducibility here means the committed source and frozen dependencies rebuild and pass the documented checks. Next.js build IDs and release timestamps are generated; no byte-identical archive claim is made. The polished commit is still unpublished until the approved push; a fresh GitHub clone of that exact source must be checked after publication.

## Remaining SEO/discovery gaps against PR #12

Audit reference: [PR #12](https://github.com/BikeshedStudios/nullworx/pull/12), planning commit `a5da58f0edadc8598f6cd2e53dba647f4f220559`. Remaining items only:

1. **Content dates:** the live sitemap still assigns `2026-11-09` to all nine URLs despite the November 11 polish/content changes. Update affected entries with their actual content date in a later scoped metadata edit; do not use the build clock.
2. **Social previews:** live HTML has no `og:image` or `twitter:image`. Rights-cleared social images/posters and image metadata remain absent. The README screenshot does not populate those fields.
3. **GitHub discovery:** repository About description, website and topics are empty. Package/registry metadata is prepared here; account-level About changes are not performed.
4. **Installation/distribution state:** the discovery manifest has release/index/media states and evidence references, but no separate tested-install or distribution-status field. Most installation evidence still points to the general README. Keep the verified claim restricted to Magnetic Focus; broader distribution requires per-effect proof.
5. **Performance/accessibility evidence:** no current Lighthouse/mobile performance baseline or real-user Core Web Vitals evidence is available in this release. Manual screen-reader and native-device checks are unrecorded. Automated axe, layout and motion passes have the limits stated above. PR #12's continuous Lighthouse/link tooling is not installed; this release uses bounded existing checks and a one-off link audit.
6. **Minor 404 metadata:** the missing-effect title repeats “nullworx.space” through the inherited title template. HTTP 404/noindex and absence of an invented canonical are correct; the title cleanup is non-blocking.
7. **Actual search indexing:** no verified Search Console/Bing property, URL Inspection, sitemap-submission or search-impression data was available. Property status and indexing remain **unknown**, not failed. Obtain the real engine evidence if indexing status is needed. [Google explicitly separates crawling, indexing and serving](https://developers.google.com/search/docs/fundamentals/how-search-works); technical readiness does not guarantee any of them.

Live HTTP confirms the expected polish JS asset hash. The nine approved URLs return 200 with the expected canonical host and indexable metadata; sitemap/robots and HTTP/www/trailing-slash redirects work. Beta/lab URLs are blocked with 404 at the public edge and excluded from discovery; this is deliberate, while local source retains the noindex routes. These are technical observations, not indexing receipts.

PR #12's newsletter, paid checkout, AI-search experiment, new topic pages and marketing distribution are deferred scope, not missing steps for this release.

## Exact remaining publication steps

1. Owner approves this changeset and publication of its branch. Push only `review/public-distribution-01`, then open one PR to `main` using the prepared description. No experiment/integration refs or tags are included.
2. Review the diff and CI on that exact public head. From a fresh unauthenticated GitHub clone of that SHA, repeat the frozen install, `pnpm verify`, public consumer suite and clean-media site checks. The current local review build does not establish remote retrieval of the unpublished polish.
3. Merge only after owner approval and passing checks. The existing tested Magnetic Focus pin can remain: its source closure has not changed. A new pin must be tested before advertising it.
4. If a GitHub Release/tag is desired, obtain approval for the exact tag and commit, then publish the prepared source-only notes. No npm publication or redeployment is needed to make this source release reproducible. Production remains on the already-live polish.

## Rollback

Before merge, close the PR or discard only the new review branch; preserved WIP and production are unaffected. After merge, revert that PR with a reviewed revert commit. Do not reset main, rewrite public history or remove the already-public registry pin. If the PR is squash-merged, revert its squash commit; if merge-committed, revert the merge with the correct first-parent selection.

This source publication does not change the production pointer or artifact. No production rollback is required. Any later deployment/rollback is a separately approved operation using the existing retained release; no deployment command is part of this changeset.
