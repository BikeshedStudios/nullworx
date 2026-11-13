# Nullworx Creative Effects Roadmap

**Owner direction recorded:** 2026-10-29  
**Business-model decision updated:** 2026-11-12  
**Status:** Roadmap / product hypotheses. Not a release authorization or implementation approval.  
**Product:** nullworx.space (https://nullworx.space); UI Forge is the component/effects kit; Bikeshed Studios is the publisher  
**Primary platform:** Preserve the current Next.js / React / shadcn UI Forge foundation.  
**Working lineage:** G2 draft PR #1; G3-A stacked draft PR #3 (base: feat/forge-foundation-g2). Both remain unmerged.

## North star

Nullworx is a reuse-first procedural effects foundry: combine maintained open-source rendering libraries with original materials and carefully designed interactions, then deliver portable, production-verifiable compositions. Free individual effects drive discovery; paid self-serve components, finished compositions, presets, and templates are commercial hypotheses to test, **not proven demand**. No bespoke commission business is planned.

**Owner creative priorities:**
1. **P0-A: Living Typography** — highest creative and commercial focus.
2. **P0-B: Reactive Signal UI** — co-priority, distinct interaction-oriented effect family.
3. **P2: Procedural Brand Objects** — appealing, but explicitly deferred behind the 2D work.

P0-A and P0-B may run independent *research* in parallel, but implementation must use isolated branches/proofs and not obstruct the existing G3-A acceptance gate.

## 2026-11-14 — Reuse-first asset and product test session (QUEUED)

**Requested:** 2026-11-13, for hands-on testing on Saturday 2026-11-14. This is an experimental research/testing checklist, **not** authorization to install into production, merge, deploy, publish, purchase assets, or expose premium source. No test results are asserted here.

**Current-truth checkpoint before any code changes:** The older roadmap text below predates the November 12 public main `3f6e636` (Bento Duo 01 product page merged; €39 Gumroad listing published). At the latest check, live production was still on older `6974689`; release PRs #18 and #19 were open drafts, Drops was OFF, and search/customer demand evidence was limited. Re-check `main`, all worktrees, licensing, release status and deployed state instead of treating historical roadmap gates or remembered results as current. The earlier local `nullworx-agent-proof-01` is an **offline prototype and unverified React integration**, not an approved product.

### Goal and decision metric

Find the smallest, rights-cleared existing library/asset combination that makes a distinct **paid, agent-editable visual product** genuinely better than what the current UI Forge, Bento Duo and Paper Shaders stack can already deliver. Distinguish (a) reduced implementation time, (b) noticeably better aesthetics, (c) end-user functionality, and (d) buyer value; GitHub stars, listing prices and a working demo are **not** proof of demand.

**No blanket integration:** Screen **all** candidates, then run bounded isolated technical spikes only when each offers a specific unmet capability. Avoid ten permanent dependencies and ten unrelated prototypes.

### Full candidate inventory: screen every item, spike conditionally

| Candidate | Source | Claimed scope / intended proof | Gate and decision |
| --- | --- | --- | --- |
| Paper Shaders | https://github.com/paper-design/shaders | Existing Apache-2.0 shader/material dependency. Reuse for one visual identity. | Baseline; prove new compositions don't require a second graphics engine. |
| Keystatic | https://github.com/Thinkmill/keystatic | MIT-marked file/Git CMS for editable case studies. | **Priority spike:** create/update one project, verify real persistence, production build and customer workflow. Check deployment/auth/runtime assumptions. |
| Tailark Blocks | https://github.com/tailark/blocks | MIT-marked conventional marketing blocks. | **Priority spike:** assemble one responsive nonvisual section; compare with existing components; preserve upstream notices. |
| Animaxxing Skills | https://github.com/johnpolacek/animaxxing-skills | MIT-marked guidance for agent-driven animation/GSAP work. | **Priority A/B:** same animation task with/without skill; verify actual effect, reduced motion, teardown, no invented API. Skills are guidance, not guardrails. |
| Atelier UI | https://github.com/whatisjery/atelier-ui | Shared WebGL + live DOM alignment architecture. | **Research/spike:** free-source path only; measure benefit versus current Paper/Canvas; **exclude Pro components** from resale without explicit compatible rights. |
| Motion Primitives | https://github.com/ibelick/motion-primitives | MIT-marked interaction patterns. | Compare one use case with our current Motion components; reject duplicate dependency/visual redundancy. |
| Pagefind | https://github.com/Pagefind/pagefind | MIT static search indexing. | Only test on a real multi-project content fixture; reject if simple search/filters suffice. |
| Lenis | https://github.com/darkroomengineering/lenis | MIT scrolling/synchronization. | Test with existing sticky/scroll effects; reject if it harms accessibility, browser behavior or performance. |
| Poly Haven | https://polyhaven.com/ | CC0-labeled HDRIs/textures/models. | Rights/provenance and asset-budget check; use only for a concrete 3D/visual requirement. |
| Drei + React Three Fiber | https://github.com/pmndrs/drei and https://github.com/pmndrs/react-three-fiber | MIT-marked 3D foundation/helpers. | **Deferred technical spike:** one object, fallback, mobile GPU and clean unmount; only if 3D remains a commercial candidate. |

**Wildcard comparison:** https://ui.philippekam.dev/ (kam-ui backgrounds) — verify canonical source, each component's exact license and provenance before any reuse. **Exclude from template-source resale unless independently cleared:** React Bits, Canvas UI, and Atelier Pro. GSAP license must be checked for the exact shipped use case; no assumption that the MIT agent skill applies to the GSAP runtime.

### Three buyer-facing product hypotheses (not three builds)

| Candidate | Existing leverage | Smallest customer-visible test | Kill criterion |
| --- | --- | --- | --- |
| **A — Cinematic Case Study System** (lead) | Bento Duo editorial/material language + Paper Shaders + Tailark; Keystatic only if justified | One editable case study, brand change, mobile rendering, installable source | Looks generic; editing requires significant developer help; CMS adds more work than value. |
| **B — Interactive Product Launch System** | Existing approved UI Forge effects + Tailark + Motion, possibly animation skills | One distinct landing page and agent personalization using existing components | No credible differentiation from free templates or visual drift during edits. |
| **C — Interactive 3D Brand Showcase** (defer) | R3F/Drei + CC0 assets + our materials | Single scene with static fallback and measured GPU cost | Generic rotating object, poor mobile behavior or weak buyer intent. |

### Hands-on sequence and evidence

1. **Inventory / safety:** inspect `git status --short`, `git branch --show-current`, `git worktree list`, exact `main`/release state, user-owned premium paths and current rights; do not reset/clean, leak ZIPs or modify another experiment.
2. **All-candidate screening:** collect pinned repo commit/version, license text (not just GitHub badge), dependency burden, maintenance recency, claimed browser support, redistribution rules and one real use case. Record `PASS / FAIL / DEFER / UNVERIFIED` for **all ten** plus wildcard.
3. **Foundation baseline:** run current Nullworx `pnpm verify`, `pnpm test:distribution`, `pnpm test:launch` in a safe isolated checkout; capture exact exits and existing skips. A failed baseline is not a new library regression.
4. **Priority isolated proofs (separate fixtures/branches):** Paper + Tailark composition; Keystatic single-project edit/persistence; Animaxxing agent A/B on the same bounded animation task. Atelier gets architecture/rights evaluation first, a runnable prototype only if it could replace existing complexity.
5. **Optional proofs only if gaps are observed:** Motion Primitives, Lenis, Pagefind, kam-ui; do not install just to complete a checklist. Keep R3F/Drei and Poly Haven as the 3D feasibility lane.
6. **Compare:** same visual brief and target devices; record screenshot/clip, initial engineering effort, integration edits, clean Next.js/Vite consumer behavior when applicable, JS/runtime footprint, reduced-motion fallback, basic accessibility, licensing closure and manual repairs. Do not invent FPS, CI passes or sales.
7. **Owner visual gate:** decide `KEEP / REVISE / KILL` per asset and choose **one** product hypothesis for possible commercialization. Preserving visual distinction is an explicit gate separate from technical acceptance.
8. **Commercial gate:** compare real customer tasks against a free/template baseline; verify installation and editing by an external user before changing prices, paid catalog, checkout or deployment.

### Minimum receipts / stop rules

- One inventory and per-candidate license/source ledger, not ten half-built codebases.
- One comparable baseline, per-spike diff/fixture, build/test exits, screenshots for 390px and desktop, and concise `what → so what → now what` verdicts.
- For any attempted integration: preserve existing WIP; use a separate worktree; prefer pinned existing packages and reversible diffs; check secrets, asset rights, keyboard/focus, reduced motion, mobile overflow and cleanup.
- **STOP** if rights forbid source resale, the result is visually generic, a library duplicates the existing stack, independent install fails without bounded repair, or the scope starts becoming a general visual editor.
- This session may conclude with **DEFER** for most candidates. Screening all assets does not require integrating all assets.
- No push, merge, deployment, paid publication or irreversible changes without separate explicit owner approval.

## Business model — Free → Starter → Pro → Ultimate (owner decision, 2026-11-12)

**Decision:** Follow the **free library + paid self-serve tiers** architecture used by React Bits, not its catalog size, claims, or prices. Build once, distribute repeatedly. This is a product strategy, **not authorization to launch checkout or advertise unavailable products**.

| Tier | Intended offering | Release state |
| --- | --- | --- |
| **UI Forge Free** | Original individually released React effects, working demos, documented props, public source and reproducible GitHub/shadcn install where verified. Existing MIT source stays MIT. | Maintain and improve; release status is effect-specific. |
| **UI Forge Starter** | Additional premium-ready effects, useful presets, coherent visual compositions and copy-paste/CLI-ready implementation instructions. | Proposed; no sellable product yet. |
| **UI Forge Pro** | Coordinated hero/section systems, living typography and richer reusable material/interaction families with source, presets and documentation. | Proposed; no sellable product yet. |
| **UI Forge Ultimate** | Finished, customizable page templates and complete visual systems, with the full verified premium catalog when it exists. | Proposed; no sellable product yet. |

**Pricing and licensing principles**
- Prefer **one-time purchases** and automated digital delivery. Lifetime or perpetual terms must specify exactly which versions, updates and rights are included; do not promise perpetual maintenance, unlimited support, or future deliverables without a sustainable policy.
- Tier names and price structure are modeled on React Bits; **do not copy its dollar amounts as validated Nullworx prices**. Set prices only after the scope, packaging, licensing, checkout costs and actual customer value are verified. Annual licensing is optional later, not a launch prerequisite.
- **Free remains useful and honest.** Never revoke existing MIT grants or sell free MIT source as if it were exclusive. Paid value must consist of genuinely additional products, composition quality, assets with distribution rights, presets, integration convenience or finished templates.
- Keep the sales flow **self-serve**: preview → clear contents/license → checkout → automatic delivery → independent installation. Avoid creating a bespoke support or fulfillment workload.
- No advertised commissions, consulting packages, custom-job rates, response times or delivery promises. A neutral **inquiries** contact route may exist, but does not constitute an offer to accept work.
- Do not add newsletter capture, analytics cookies, checkout or paid infrastructure before a working product and the necessary consent, refund/tax, privacy, consumer-law and license disclosures are reviewed. Statutory obligations still apply to digital sales.

**Release and business gates (in order)**
1. **D0 — Public distribution:** finish review of the sanitized public source and PR #13; independently verify a public GitHub installation into clean Next.js and Vite consumers; keep deployed production and unrelated WIP safe. PR #13 is pending at the time of this decision, not assumed merged.
2. **P0 — One finished premium specimen:** use **Living Typography** as the first candidate; make one distinct reusable hero/wordmark composition with editable text, presets, true code portability, accessibility, reduced motion, and documented rights. One high-quality deliverable is worth more than many unfinished previews.
3. **P1 — Prove paid differentiation:** compare the premium specimen against the free implementation. Reject the paid-pack concept if it is merely free code repackaged. Validate usefulness through bounded, non-binding interest tests; do not claim purchases or demand without evidence.
4. **P2 — Productize once:** rights-checked ZIP/registry assets, exact dependencies, clean-consumer install and lifecycle tests, truthful demo, installation docs, versioned license/terms, and automatic delivery fixture.
5. **P3 — Enable checkout only with owner approval:** choose a low-overhead payment/merchant-of-record route after verifying fees, Sweden/EU digital-goods requirements, tax handling and customer obligations. Launch one finished paid product before adding Starter/Pro/Ultimate breadth.

**Success measure:** a verified, independently usable paid digital product and evidence of real self-serve willingness to pay—not page views, speculative tier revenue, commission inquiries, or a prematurely built storefront.

## Foundation gate F0 — before either priority enters the public catalog

- Complete G3-A.1 owner visual decision, real GPU-backed checks, Firefox/WebKit compatibility evaluation, and targeted repairs where necessary.
- Reconfirm relevant dependency security advisories at implementation time (including the announced November 3, 2026 Next.js release once published).
- Preserve all original UI Forge experiment roots and their WIP; never silently promote review-pending effects.
- Resolve author-owned source licensing and third-party redistribution rights before distributing code.
- Distinguish verified technical pass from owner aesthetic approval.
- Do not merge, deploy, publish packages, charge customers, or send marketing emails without a separate owner authorization.

## P0-A — Living Typography (first build track)

**Creative thesis:** Typography behaves as a procedural material: holographic metal, liquid/chrome, glyph rain, ASCII disintegration and responsive optical movement. The result is a visual identity, not a generic animated heading.

**Target outputs:**
- An editable wordmark/heading that applies at least two materials without stale masks or per-phrase source forks.
- A transformation composition: e.g. chrome wordmark → ASCII/glyph breakup → reform (only if the source material is cleared and the effect can be composed honestly).
- A polished interactive React hero/brand element, with static/reduced-motion representation and documented browser support.
- First self-serve premium candidate: a polished editable motion wordmark or hero composition, packaged as a reusable React product with presets and documented limits. No bespoke personalization service or promised video output.

**Reuse-first stack:**
- Existing HoloType, Paper Shaders MeshGradient, G3-A mask/recipe contracts, Motion.
- Existing ASCII Waves and Terminal Rain lineage as candidates only; audit provenance and admission status first.
- Noisemaker: isolated material-engine comparison if it brings a distinctive effect the current stack cannot express; wrap official public APIs, don't rewrite its shader engine.
- Tweakpane: optional **lab-only** parameter controls if it eliminates repeated editor code; do not add to consumer runtime exports by default.

**Bounded proofs:**
- T1: user-editable safe text + two existing materials, preserving font-fit/alpha behavior.
- T2: one genuinely compositional glyph/ASCII transition using existing cleared code, with rollback if it requires per-pair hacks.
- T3: one independent customer-ready React export to a clean Next.js AND Vite consumer.

**Exit gate:** owner visual acceptance; editable text changes produce correct new masks without stale caches; no shader forks; keyboard/accessibility and reduced motion pass; independent consumer install works with explicit exact runtime dependencies and notices; browser/mobile/lifecycle/performance receipts exist. Do not advertise paid exports until T3 works.

**Kill/defer:** if cross-renderer fidelity is misleading, output is generic, license rights are uncertain, or customer packaging needs the entire Nullworx studio.

## P0-B — Reactive Signal UI (second build track)

**Creative thesis:** UI reacts like a living signal, not like a full-screen animation laid behind content. Focus on meaningful state response: phosphor afterglow, controlled scanline/interference, signal interruption, subtle recursive feedback and legible CRT/pixel treatments.

**Target outputs:**
- Real **button**, **card/panel**, and **terminal/notification** surfaces with deliberate hover/focus/active/loading/error transitions.
- One cohesive “Signal / Decay” design system preview, not unrelated effects.
- Commercial hypothesis: a drop-in interactive UI/hero kit for developers or retro/game-adjacent products.

**Reuse-first stack:**
- Existing CRT Material Lab, Motion, SVG/CSS filters, existing accessible React DOM components.
- Hydra: an **isolated experimental lane** for analog feedback and recursive signal textures; check actual license, browser cost, cleanup and capture semantics before adoption.
- PixiJS: only if a specific multi-sprite, particle/disintegration or raster composition demonstrably requires it.
- Noisemaker may supply procedural signal textures if the prototype shows a meaningful advantage.
- Do not build a custom video-synthesis engine or borrow restrictive component source.

**Bounded proofs:**
- S1: CRT/Signal treatments on genuine readable/interactive DOM surfaces with all keyboard and focus states.
- S2: a controlled interference/feedback interaction with an input-driven trigger and reversible steady state; test without Hydra first, then compare an isolated Hydra trial if justified.
- S3: one cohesive, clean-consumer installable Signal UI composition with reduced-motion fallback.

**Exit gate:** no content unselectability, hidden focus, full-screen flashing, uncontrolled feedback, lingering timers/rAF/GPU contexts, or unacceptable mobile behavior. Record real user interactions, contrast, visual review, and measured resource cost; clean consumer verification required for distribution.

**Kill/defer:** if feedback harms legibility, input latency, accessibility or performance, retain the lower-cost native CRT/CSS method instead of adding Hydra.

## P2 — Procedural Brand Objects (later, not discarded)

**Creative thesis:** Personalized three-dimensional chrome/glass/organic logos or objects that react to pointer and motion, suitable for distinctive landing pages and brand assets.

**Do not start until:** at least one P0 effect family produces an independently installable, owner-approved output, and there's evidence of user or customer interest in 3D.

**Research candidates:** Three.js + React Three Fiber versus Three.js + Threlte/Svelte. Compare the **same specimen scene**, lifecycle, visual fidelity, package weight, authoring cost and export practicality. A SvelteKit migration is explicitly **not** part of this lane.

**First proof:** one interactive brand object with meaningful material/lighting/geometry, fallback, measured GPU cost, resize, cleanup and static option. Avoid “rotating demo object” as the success criterion.

**Decision:** defer native 3D package/export, physics, and cross-engine parity until a specific buyer workflow justifies them.

## Shared integration and commercial rules

- **Reuse upstream code via exact pinned dependencies and thin adapters.** Do not build new shader or graphics engines without a failed library proof demonstrating need.
- **Do not import React Bits source into resale-oriented packs** without separate legal clearance; use the design/distribution model as reference only.
- Keep effect metadata, renderer adapters, composition recipes, the studio preview, and distribution/export as separate boundaries.
- Mark experimental/review-pending items truthfully. A working preview does not imply release approval.
- No client-only preview should claim a working standalone source export until a real consumer test proves it.
- Keep open-source/free individual primitives available; validate paid value through genuinely new or substantially richer compositions, curated presets, finished templates and saved implementation time, not artificial paywalls or repackaged MIT code.
- Every self-serve premium export must include source, dependencies, usage documentation, notices, versioned recipe, clear license terms and a tested reduced-motion/static path.
- Browser/GPU evidence must identify the actual renderer, not conflate SwiftShader with hardware results.

## Portfolio sequence and gates

| Sequence | Gate | Outcome |
| --- | --- | --- |
| 0 | F0 — G3-A.1 acceptance + security/license review | Verified creative foundation; no new effect release assumed |
| 0a | D0 — Public sanitized source + GitHub registry release | First reproducible free component installation; PR #13 requires review/merge approval |
| 1 | T1 — Living Typography editable text, dual materials | Proof of reusable personalized wordmarks |
| 2 | S1 — Reactive Signal UI on three true interactive surfaces | Proof of legible meaningful UI behavior |
| 3 | T2 / S2 — one distinctive transition and one feedback experiment | Creative differentiation; compare external libraries against native control |
| 4 | T3 — first portable React wordmark composition | Candidate for first finished self-serve premium product |
| 4a | P0/P1/P2 — premium specimen, differentiation and packaging | Prove added value, rights and independent installation before checkout |
| 5 | S3 — first portable Signal UI composition | Second potential self-serve product family |
| 5a | P3 — one-product checkout and automatic delivery | Only after owner approval and payment/legal readiness; tier expansion later |
| 6 | P2 object-scene feasibility only if demand warrants | Decide R3F vs Threlte; no migration |

Advance one gate at a time with PLAN → CHANGESET → VERIFY → HOSTILE REVIEW → VERDICT. Record reproducible fixtures, screenshots/clips, exact dependencies/licenses, clean-consumer results, performance and rollback. Treat owner aesthetics as a separate gate. Experimental branches can be pushed as draft PRs; **no merge or deployment is authorized by this roadmap**.

## Future research backlog (not commitments)

- OGL: custom GLSL only if Paper/Noisemaker public APIs cannot achieve a required material.
- Web Components/Lit: framework-neutral packaging proof once a React consumer export passes.
- Svelte 5: isolated parameter/editor authoring A/B; keep React as the baseline.
- Svelte Flow / React Flow: node-based editor only after real recipes justify graph authoring.
- Motion Canvas / FFmpeg: video deliverables only after deterministic or documented capture semantics are proven.
- PixiJS: particle/sprite lane; Three.js/Threlte: 3D lane; Rust/WASM only on a measured bottleneck.

## Owner review questions at the next visual checkpoint

- Does Living Typography look distinctive enough to headline Nullworx?
- Does Reactive Signal UI preserve readability and convey useful interaction states?
- Which finished, self-serve composition saves enough implementation time to justify a paid product beyond the existing free MIT effects?
- Does any newly researched library offer an unmistakable advantage over the verified native/Paper/Motion baseline?
