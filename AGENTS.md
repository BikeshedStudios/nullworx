## Permanent product contracts

Before changing homepage, media, effects, distribution or release gates, read `docs/PRODUCT_BASELINES.md` and the referenced source/release receipts. Preserve all accepted feature sets. Add a blocking regression test for every accepted behavior; never replace an accepted default from an older experiment. Verify actual provisioned LOOP30 bytes for fish deployment gates; fixtures and procedural fallback cannot attest fish autoplay. Preserve dirty worktrees/indexes and immutable evidence. New product branches start from the latest accepted unified checkpoint.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Megasprint 01 architecture (read before new effect work)

- Base release: `7db32651b8226b21851dd3480db9dd688e50b267`. Integrated candidate: `sprint/megasprint-01` in `/home/swirky/DevHub/worktrees/nullworx-megasprint-01`.
- Signature Hero is live at `app/kits/signature-hero/page.tsx`, `components/signature-hero/` and `lib/signature-playground.ts`. It must remain a real component. Never reintroduce `public/signature-hero-01/` PNGs, `next/image` previews or an image-as-interface path.
- The Signature Hero source is an internal owner-review candidate: `components/signature-hero/LICENSE.txt`. Do not describe it as MIT or publicly licensed. Keep the route noindex until the owner makes a release/rights decision.
- Agent Design DNA lives in `lib/design-dna/` with schema `1.0.0`, a three-component registry, canonical serialization, generated integration snippets, ten valid fixtures and twelve invalid fixtures. The lab is `app/lab/design-dna/page.tsx`. Recipes are data only; never execute recipe-supplied code, imports, CSS, HTML or package names.
- Bento Duo live components live in `components/bento-duo/` and are MIT-licensed per their included `LICENSE` files. The product page and homepage teaser mount real components. The premium boundary is unchanged: no source ZIP/TGZ, paid internals or copy-source interface is exposed publicly.
- Material effects keep the approved renderer defaults. `intensity` and `density` are additive, clamped options; default `1/1` must preserve the accepted behavior. Do not loosen the hash-pinned clock/coverage/compositor/raster/surface files.
- New routes (`/kits/signature-hero`, `/lab/design-dna`) are `noindex, nofollow`; the sitemap stays at the approved ten URLs. Do not add them to `lib/discovery/manifest.ts` without a separate release decision.
- Release/staging tooling is in the Megasprint evidence packet. The server remains blocked on interactive sudo; do not claim a private staging attestation from local tests.
