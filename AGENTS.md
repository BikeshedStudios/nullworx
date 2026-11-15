## Permanent product contracts

Before changing homepage, media, effects, distribution or release gates, read `docs/PRODUCT_BASELINES.md` and the referenced source/release receipts. Preserve all accepted feature sets. Add a blocking regression test for every accepted behavior; never replace an accepted default from an older experiment. Verify actual provisioned LOOP30 bytes for fish deployment gates; fixtures and procedural fallback cannot attest fish autoplay. Preserve dirty worktrees/indexes and immutable evidence. New product branches start from the latest accepted unified checkpoint.

## Shared coding-agent discipline (all Nullworx implementation tasks)

Applies to Codex, Claude, Cursor, Copilot, Gemini and other agents **when they read this repository's instructions**. These are condensed, original project rules based on the independent [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) project, which was inspired by Andrej Karpathy's observations; Karpathy did **not** author the rules file. Preserve the more specific product contracts above.

1. **Think before coding.** Read relevant files and accepted baselines. State material assumptions, contradictory requirements, risks and simpler alternatives. Ask only if a missing fact blocks correctness, rights, safety or an irreversible operation; otherwise choose a conservative assumption and proceed.
2. **Keep it simple.** Solve the explicit problem with the smallest maintainable change. Do not introduce speculative features, one-off abstractions, extra frameworks, configuration surfaces or broad refactors.
3. **Make surgical changes.** Touch only requested files and directly necessary tests/integration. Preserve unrelated source, formatting, comments, user WIP and established APIs. Mention unrelated defects rather than fixing them unasked. Compare changed paths against the starting tree; do not revert someone else's pre-existing edits to satisfy scope.
4. **Verify the actual goal.** Define observable acceptance checks, run relevant tests/build/browser probes and iterate within the authorized scope until the result passes or a genuine blocker is documented. Never claim unrun checks as PASS; record FAIL, SKIP and NOT_RUN explicitly.

For substantial work report **PLAN → CHANGESET → VERIFY → VERDICT** with the exact baseline, diff, executed commands, outcomes and rollback risks. Follow owner approval gates for push, merge, deploy, delete, publish, paid actions or source/license changes. The goal is less unnecessary code and fewer silent assumptions, **not more planning or repetitive questions**.

## Modern browser guidance (web tasks only)

For web UI, HTML, CSS, client-side JavaScript, accessibility, motion, browser API and performance tasks, use the installed [GoogleChrome Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) skill when available: search for the concrete capability, retrieve the relevant guide, check project browser/Baseline support and fallbacks, then implement the smallest needed change and verify in a real browser. **Do not silently adopt new APIs solely because they are fashionable.** Accepted product contracts, existing WIP and actual runtime checks take priority. Do not invoke the web skill for backend/infra, unrelated tooling or native/game-engine work. If unavailable, state that and use pinned project docs/standards; do not auto-install/update packages during unrelated tasks.

The skill is intended to be installed **globally on the developer's machine** so it applies across local repositories; this repo-specific note is not proof that it is installed globally or in remote GitHub environments. GoogleChrome Modern Web Guidance v1.0 was verified as the upstream package; updates require deliberate review.

## Motion reference: Transitions.dev (frontend only)

For frontend interaction/motion tasks (menus, modals, popovers, cards, text or icon state changes, loading states, page transitions), consult [Transitions.dev](https://transitions.dev/) and its [free motion recipes](https://transitions.dev/library.html) alongside Modern Web Guidance before inventing a custom animation. If installed, use the `transitions-dev` skill for specific patterns and `transitions-polish` for existing motion; retrieve only the relevant recipe. **Do not add animation simply because a recipe exists.** Preserve owner-approved design, existing component APIs and transitions, and prefer existing CSS/native APIs over extra libraries or a new runtime. Verify keyboard/pointer behavior, reduced motion, browser support, mobile performance and no visual drift.

**Commercial distribution gate:** Transitions.dev's [repository license](https://github.com/Jakubantalik/transitions.dev/blob/main/LICENSE) allows use in projects but imposes extra conditions on redistributing transitions inside templates, themes, starter kits and UI kits: a qualifying paid plan and inclusion of only transitions actually used with the required comments. Do not copy these snippets into a sold Nullworx kit or repackage the library without checking the current exact terms and owner authorization. Inspiration/reference does not authorize code redistribution. Do not install/update packages, enable Pro APIs or run auto-fix/PR agents without a scoped task and explicit approval.

This repo note applies only when an agent reads this branch. For the same optional reference across **all local frontend projects**, install the upstream skills globally through the agent skills installer; GitHub repos and cloud coding environments do not inherit a local global installation automatically.

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

## Visual Frontier Promotion 01

Owner-approved A/C publication adds `refractive-type` and `impossible-material`
and deliberately expands the sitemap to twelve URLs. Read
`docs/visual-frontier/PROMOTION_01.md` and `SOURCE_RIGHTS.md`. Preserve all four
variants, original controls/defaults and complete consumer source. B stays in the
untouched historical lab, outside production. Keep one full GPU lease, live cheap
card companions, and existing fish/media/commerce boundaries. Strict release scope
now requires A1/A2/C1/C2 and source checks. No failed gate may be bypassed.
