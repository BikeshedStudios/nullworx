# NULLWORX — Agent-Native Kit 01
## Product Requirements Document (PRD)

**Status:** OWNER-SELECTED VERTICAL / REVISED AFTER HOSTILE REVIEW — NO IMPLEMENTATION OR RELEASE AUTHORIZATION  
**Document revision:** 2.0 — 2026-11-15  
**Product owner:** Bikeshed Studios / Nullworx  
**Repository:** https://github.com/BikeshedStudios/nullworx  
**Companion:** `docs/product/agent-native-kit-01/IMPLEMENTATION_PLAN.md`  
**Review prompt:** `docs/product/agent-native-kit-01/CLAUDE_RED_TEAM_PROMPT.md` (hostile review completed as owner-supplied text on 2026-11-15; reviewer did not fetch both complete planning documents)  
**Docs-only branch base:** `main` at `f753eba9f3d5f4e7578636b29aa43707e948cf98` (remote snapshot, 2026-11-15)  
**Important:** Actual implementation baseline must be selected afresh from the owner's approved local integration/worktrees after an explicit authorization. Remote `main` is NOT presumed to be the currently approved local worktree.

---

## 0. Executive decision and owner direction

**OWNER DECISION (2026-11-15):** Choose **A — Cinematic Case Study Kit** for the first experiment, not Interactive Product Launch or a universal agent-native design platform.

**Revised investment verdict:** SMALL EXPERIMENT. Build the smallest visually exceptional, standalone, static-first website specimen using existing cleared assets; test design competitiveness and buyer signals before creating additional agent infrastructure. This is an approved **product direction and documentation revision**, not approval to edit application code, publish a package, or collect money.

**The v1 product:** one finished project index + a reusable case-study detail page, typed local project content, one compact theme/tokens source, short root agent instructions, a customer-installable package and browser verification. Shader effects are optional enhancements; the composition must be distinctive without them.

**Explicitly not v1:** a new site-wide Design DNA schema/registry, recipe.json, rules.json, custom CLI API, JSON error-code ecosystem, MCP server, multi-agent harness or fully reusable design platform. Preserve the existing three-component Design DNA **as an independent internal lab**; its known parity issues are separately tracked maintenance, not prerequisites for testing this product direction.

**New decision sequence:** (G0) rights & local authority → (G1) static-strong visual specimen & blind free-template comparison → (G2) buyer/problem/price signal using a truthful demo → (G3) minimal self-hostable kit + agent smoke/independent install → (G4) optional DNA hypothesis only if observed defects justify it → (G5) owner-approved commercial release.

**First falsification:** Do real target buyers consider the finished, non-shader design significantly more useful than strong free alternatives? Do they show concrete intent to pay? The advanced agent-uplift experiment is **not** the first decision gate.

**Review disposition:** Adopt Claude's sequencing, scope and evaluation critiques; reject an automatic "3 deposits from 20 or kill" threshold as unsupported and avoid taking paid preorders before buyer terms, licenses and consumer obligations are settled. Neither Claude nor this document establishes demand or technical test passes.

## 1. Product truth, authority, and known evidence

### 1.1 Existing source of truth

1. Read `AGENTS.md` and `docs/PRODUCT_BASELINES.md` before any repository mutation. Read applicable historical receipts and current local worktree state.
2. Preserve accepted homepage/fish media, effects and playback defaults, preview routes, distribution contracts, protected staging, source/rights evidence, and unrelated WIP.
3. Existing `lib/design-dna/` schema version `1.0.0` has three registered components: `signature-hero`, `orbit-bento`, `foil-reactor`. It has ten valid and twelve invalid fixtures, canonical serialization, an internal lab and generated integration snippets.
4. Current remote code is not proof of local build health, current deployment, ownership of all assets, or market demand.
5. Earlier creative roadmap branch `docs/creative-roadmap-01` lists three hypotheses: **A Cinematic Case Study System (lead)**, **B Interactive Product Launch System (alternative)**, **C Interactive 3D Brand Showcase (defer)**. This PRD chooses A for an experiment, not for unconditional productization.

### 1.2 Verified gaps in remote source

- `lib/design-dna/snippets.ts` generates Signature Hero with hard-coded `preset="cobalt"` even when the preview adapter selects a different approved preset from palette. Preview-only `layout.maxWidth` is not represented in the exported integration wrapper.
- Orbit and Foil schemas accept `motion.mode` without the adapters evidently forwarding it to the rendered components. Confirm actual component behavior before deciding repair vs removal.
- Palette validation compares accent/background against 2:1, inadequate as a universal claim for readable accent text or meaningful UI graphics. Distinguish decorative vs textual/functional use and verify actual rendered colors.
- Existing unit tests check schema and snippet text but do not independently compile all snippets against consumer fixtures or check render equivalence.
- Existing Playwright Design DNA lab tests check schema and component presence, not exhaustive recipe portability or real customer installation.

### 1.3 Commercial and licensing caveats

- `components/bento-duo/orbit/` and `components/bento-duo/foil/` exist on public GitHub and their exact `LICENSE` files have been read and confirmed MIT (2026-11-15). Existing public MIT permissions persist; paid offering must add real incremental layout/content/asset/packaging value, not claim exclusive access to these sources.
- `components/signature-hero/LICENSE.txt` states internal owner-review/no customer license and flags unresolved inherited Living Type licensing. Do NOT redistribute Signature Hero or incorporate it in a paid candidate until each source/asset is cleared. The file is already exposed on public GitHub: investigate provenance and exposure without deleting/relabeling/revoking any existing permission as a side effect. Public availability is not proof of redistribution rights.
- `docs/PRODUCT_BASELINES.md` contains historical assertions about premium source not being public which conflict with current public Bento code; reconcile with exact file paths and hashes. No secrets, original permission receipts or premium ZIP artifacts should be put into the public repository.
- Existing €39 Bento Duo Gumroad product is a separate offer; zero observed sales and extremely low view counts are **not** adequate evidence that this new offer will or will not sell.
- Verify all third-party assets (fonts, textures, images, audio, UI blocks) by file and version. Do not infer redistribution rights from a homepage badge.
- This document is not a legal opinion. Address applicable digital-sale terms, consumer rights, taxes, privacy/cookies and promised updates before commercial release.

---

## 2. Target customer, job, and hypothesis

### 2.1 Initial target

**Primary:** Independent React/Next.js developers, creative freelancers and small studios wanting a distinctive portfolio/case-study site that they can adapt with Claude Code, Codex or another coding agent.

**Buyer is a hypothesis**, not a confirmed segment. The initial offer is self-serve code/templates, not consultancy or bespoke development.

### 2.2 Core job-to-be-done

"When I have real client projects, images and a brand identity, I want to deploy a striking case-study site without designing every page from scratch, and ask my coding agent to personalize it without breaking the original composition or interactions."

### 2.3 User value assumptions to test

- Visual finish and credible examples are worth paying for beyond free blocks.
- Initial installation plus first personalization can be completed unaided with a standard coding agent.
- Constrained adaptation reduces repair cost versus conventional agent instructions.
- Customers prefer code ownership and no required account/runtime fee.
- Users tolerate a constrained aesthetic system in return for a coherent result.

### 2.4 Market alternatives

- Free shadcn/ui + Tailwind and manually authored compositions.
- Finished premium website templates and design assets.
- Existing portfolio starters and open-source case-study sites.
- AI design/build tools that export code or accept design descriptions.

**Differentiation claim to test:** Less time to a distinctive, usable and accessible finished site; lower visual drift under agent customization; fewer manual fixes. Do not claim unique AI capability.

---

## 3. Product definition and user experience

### 3.1 Deliverable: independent, finished website

Ship a self-hostable **Next.js/React/TypeScript** project, initially static-exportable if the verified route/features matrix permits. Check actual Next docs and build behavior; do not assume `output: "export"` supports runtime server functions or dynamic routes without `generateStaticParams`.

**Mandatory v1:**
1. **Project Index / Home:** distinct visual composition, real navigation, clear project hierarchy, contact path and meaningful sample media/copy.
2. **Case Study Detail:** generated route(s) from finite local content slugs, with problem/process/work/results/media and back/related navigation.
3. **Content:** typed JSON or TypeScript records of site/project data (choose ONE canonical content source) with accessible alt text, stable metadata and valid slugs.
4. **Theme:** a single compact source for approved color/type/spacing parameters; avoid parallel recipe/token/variant schemas.
5. **Visual fallback:** good composition before shaders, accessible static state and reduced motion, no forced GPU runtime.
6. **Agent instructions:** repository-root `AGENTS.md` (shared rules), plus a **customer-kit-specific concise guide (target ≤60 lines)** only when useful; tests and exact edit paths.
7. **Proof of portability:** clean installation of the **exact shipped archive**; no required Nullworx account/API key/telemetry, clear source rights and pinned environment.
8. **Validation:** standard package scripts for content/schema, TS build and browser smoke checks; no custom public CLI contract unless a real buyer failure requires it.

**Possible after evidence:** optional agent skill, extensible variation schema, generated DESIGN.md or Design DNA; these are not v1 delivery promises.

**Do not market as:** a drag-and-drop builder, hosted AI product, or universal agent-native design system.

### 3.2 Primary customer journey

- **See & compare:** a truthful interactive/static demonstration with desktop and mobile captures, content, license disclosure and clear boundaries.
- **Qualify:** buyer identifies an actual case-study/portfolio need; sees a proposed public price and exact contents; provides opt-in feedback or a specific purchase-intent signal.
- **Test demand:** around 20 relevant personal outreaches is a useful *initial exploration*, not a statistical benchmark. Count qualified responses, buyer objections, follow-up requests and later real purchases; zero deposits is not an automatic product KILL without examining audience and offer.
- **Acquire only when legal/rights ready:** approved checkout and buyer terms, including applicable digital-content consumer law, withdrawal/information handling, taxes and delivery.
- **Install:** unzip, install pinned dependencies and build with no Nullworx service.
- **Personalize:** replace local content and design parameters directly or via a standard coding agent following a concise guide.
- **Verify and deploy:** customer runs standard checks and deploys to a supported static host or ordinary Next environment as documented; do not imply unrestricted static-export support.
- **Maintain:** scoped version/compatibility promise; no perpetual support assumptions.

### 3.3 User stories and acceptance criteria

| ID | Story | Observable acceptance |
| --- | --- | --- |
| US-01 | Visitor navigates projects | Home → case study → another project; links, back navigation, keyboard focus work |
| US-02 | Owner replaces 4–6 projects | Content updates without editing JSX; cards and details render deterministically |
| US-03 | Owner changes name/logo/brand | Approved palette/type edit updates intended regions; visual hierarchy remains |
| US-04 | Owner uses long headings | No clipping, unexpected overflow or unusable controls at 320/390/768/desktop |
| US-05 | Owner uses broken/missing media | Helpful fallback preserves aspect ratio and usable page |
| US-06 | User prefers reduced motion | No unnecessary animation/forced motion; content remains accessible |
| US-07 | Agent personalizes a site | Same task passes clean consumer checks and leaves audited source diffs |
| US-08 | Owner supplies invalid project content | Typed content validation/build rejects invalid or missing required fields with actionable diagnostics |
| US-09 | Buyer installs from ZIP | Cold install and production build pass in locked supported Node/dependency setup |
| US-10 | Buyer can inspect rights | Source/assets/provenance and license terms are complete and comprehensible |
| US-11 | Site works without JavaScript-enhanced effects | Content, navigation and contact remain accessible under fallback conditions |

### 3.4 Non-functional requirements

- Accessible semantic HTML, keyboard handling and visible focus; no serious known WCAG 2.2 AA regressions in testable flows. Do not equate a clean axe scan with exhaustive compliance.
- Minimum viewport check: 320, 390, 768 and 1440 CSS px. Add actual touch-device testing before shipping if interactive gestures matter.
- No unrequested horizontal scroll, unreadable small type or low contrast. Motion respects `prefers-reduced-motion`; offscreen resources suspend and unmount cleans up.
- Contrast based on actual roles: 4.5:1 for normal text, 3:1 for large text / applicable meaningful non-text UI under WCAG rules; exceptions must be documented. Accent color can be decorative only if semantics and contrast remain correct.
- Performance: use measurable browser lab budgets plus a real mobile device or representative throttling. Record JS, network, memory, CPU/GPU, LCP, INP where feasible; set binding thresholds only after an initial measured baseline. Avoid invented FPS/performance claims.
- No user tracking by default in shipped kit. If external fonts/media are used, document their network/privacy behavior.
- Fixed supported environment for v1 (selected Next/React/Node ranges and lockfile), with known constraints in README.

---

## 4. Visual product standard

Aesthetic direction: **Cinematic Case Study / Material Editorial**, original to Nullworx and specific to project content. Distinctive editorial typography, coherent spatial rhythm and selected material interactions, not a generic SaaS card page.

**Required visual review before agent work:**
- Static screenshots must have a strong original composition without effects.
- Type scale, hierarchy, line length, image rhythm and whitespace are intentionally tuned.
- One memorable visual motif, not many unrelated attention magnets.
- Mobile is composed separately where required; do not rely only on scale-down.
- Copy and sample projects feel like realistic case studies, not generic lorem ipsum or invented customer claims.
- Independent blind reviewer compares against credible contemporary free templates and generic AI-generated pages.
- User-owner taste gate: KEEP / REVISE / KILL, with captured visual receipts.

### 4.1 Design Intelligence classification

Design sources include Charles's verified YouTube Shorts, Rauno Freiberg's Web Interface Guidelines, Anthony Hobday's visual design rules, Emil Kowalski's motion/agent writings, W3C WCAG, and established usability principles. Use **original paraphrases and independent implementation**; preserve attribution and do not repackage others' protected publications/graphics.

- **HARD**: measurable functional/accessibility/security constraints with a real test oracle.
- **HEURISTIC**: scope-bounded advice; may be overridden deliberately with a reason.
- **TASTE**: identity guidance; requires human/visual critique rather than blanket lint errors.

For Kit 01, curate roughly 12–18 applicable rules, not a mandatory 200-rule prompt. Resolve conflicts by task/context and precedence: correctness/security/accessibility > owner-approved product identity > contextual heuristics > fashion.

**Initial candidate examples, NOT blanket hard requirements:** ease-out entrances; 150–250ms dropdowns, 30ms list stagger and 0.97 press feedback where useful; trigger-origin popovers; exit shorter than entrance; immediate held-drag response; cautious motion for high-frequency controls; restrained contrasting accent; correct optical alignment and line length. Default to fewer animations and reduced motion.

**Sources**
- https://youtube.com/shorts/ZDCkA6mx9t0
- https://youtube.com/shorts/aW7cK72E76s
- https://youtube.com/shorts/ee8oolSrxzs
- https://youtube.com/shorts/6TKDklKlsOM
- https://youtube.com/shorts/fQwQhq3fH4k
- https://youtube.com/shorts/XGVvB6ES_Tw
- https://interfaces.rauno.me/
- https://anthonyhobday.com/sideprojects/saferules/
- https://emilkowal.ski/ui/agents-with-taste
- https://www.w3.org/TR/WCAG22/

---

## 5. V1 agent compatibility — minimal instead of a new platform

### 5.1 Implementation rule

**A beautiful finished website is the product; agent compatibility is a practical editing convenience.** The owner selected a case-study site rather than creating an abstract framework.

- Canonical local content + one compact typed theme file; no new recipe/schema registry in v1.
- A short customer-facing agent guide names allowed edit locations, build/verify commands, preservation rules and when to ask.
- Project-wide canonical `AGENTS.md` follows four Karpathy-inspired principles: think before changing, minimize implementation, surgical diffs and verifiable outcomes. These complement, never override, permanent product contracts.
- Buyer may modify arbitrary source code, but custom edits do not inherit guarantees about supported variants. The editing guide must say this plainly.
- One `pnpm check` (or an existing semantically equivalent script, confirmed locally) runs the smallest meaningful validation: content schema/typecheck/build plus available browser checks. Keep separate commands where dependency setup makes a single script impractical.
- No new published CLI, `--json` protocol, `ERR_*` taxonomy, remote runtime, account, registry, MCP, or language-model dependency.
- Existing `lib/design-dna/` stays untouched by v1 unless a separate narrowly approved maintenance task addresses proven defects.

### 5.2 When to revisit Design DNA

Only reconsider extra schema, preview adapters or machine-readable manifest if clean-user installation/agent tasks reveal **repeatable, costly failures** that simpler TypeScript/content validation and short instructions cannot prevent. Compare a bounded fix to the added maintenance/API surface. Do not create a hypothetical A/B/C benchmark to justify a feature nobody needed.

**Reference:** original Karpathy-inspired independent agent guideline repository: https://github.com/multica-ai/andrej-karpathy-skills — not authored by Karpathy.

## 6. Evidence and evaluation — right order, different questions

### 6.1 Visual value FIRST (G1)

- Produce static/no-effects versions of Project Index and Case Study at 390px and desktop; verify 320/768 and text extremes.
- Owner applies KEEP/REVISE/KILL before anything called a finished product.
- Blindly compare against **three competent free templates/starters** with the same subject matter and representative content, not poor strawman baselines.
- Use relevant outside reviewers when possible; record raw preferences, reasons, comparisons and sample size. Small-N is directional, not proof of premium quality.

### 6.2 Demand probe SECOND (G2)

- Present the real prototype with honest package contents and an explicit proposed price to **about 20 qualified prospective buyers**. Do not present 20 as sufficient for statistical confidence.
- Record qualified reach, role, expressed actual use case, reasons to pay/not pay, follow-up actions and *real* purchase commitments when legally/payment-operationally ready.
- A paid refundable preorder is **optional**, not a prerequisite or pre-cleared compliance technique. Never collect money before owner approves terms, legal obligations and deliverable scope.
- **Interpretation:** no qualified buyer interest after credible presentation → pause/reframe; interest without willingness to pay → revise offer or channel; meaningful paid commitments → consider productization. Do not automatically kill on a single arbitrary deposit count.

### 6.3 Minimal agent/consumer smoke THIRD (G3)

- Package the smallest customer-facing kit (local content, one theme file, short agent guide).
- Cold-install the *exact package* and test build, navigation, 320/390/768/1440 layouts, long headings, media failures, keyboard focus and reduced motion.
- Fresh agents: three realistic tasks × up to two distinct models × one run each under an owner-approved budget. Tasks include content/branding change, adding a hard case study, and an explicitly **out-of-lane** request that should be flagged/handled safely.
- Report task-level outcome, changed paths, time/tokens if available and manual repairs, **without statistical uplift claims**.
- Verify positive and negative controls before agent runs; do not expose grader/reference files. A consistent fail indicates a product usability problem, not an automatic need for Design DNA.
- If complex failures persist, propose **one** additional guarded editing rule and test it against a baseline. A/B/C or 36-run extension is a separately approved future experiment, not v1.

### 6.4 No fabricated performance or statistical gates

**Hard gates** are evidence-based: clean supported-environment install/build, actual user workflows, no known blocking a11y defects, no uncontrolled source leak or unresolved shipped-file rights. No unsupported promise of 100% browser or WCAG coverage.

**Quality heuristics** are measured and reviewed: owner visual gate, external blind ranking, mobile behavior, install support burden and buyer response. Do not set fictional FPS, conversion, token savings or 30% repair-advantage thresholds without enough data.

**External reference:** Meta Astryx's browser behavior eval uses fresh independent agents, negative controls, per-task browser probes and known limitations: https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval. We borrow its safeguards, not its entire benchmark infrastructure.

## 7. Revised order, approvals and kill/continue gates

**G0 — Authority & source rights**: Current local accepted checkpoint pinned; public/private source boundary reconciled; no unreleased WIP overwritten; all assets in specimen covered. Exclude unresolved Signature Hero from paid scope. **FAIL blocks customer distribution**.

**G1 — Static-strong visual specimen**: Project Index and Case Study are finished at static/default-low-cost presentation; owner visually approves; outside comparison with strong free alternatives is recorded. Rework or stop if generic.

**G2 — Early buyer-value signal**: Real demo, price proposition and qualified outreach. Record buyer reasons and concrete next steps. Weak signal → reconsider buyer/offer before investing in agent tooling.

**G3 — Independent installation & small agent smoke**: Original ZIP extraction/Next static-export capability verified; typed content and plain agent guide let independent users/agents change the kit; production build and role-based browser probes pass. Stop if user needs extensive manual rescue.

**G4 — Optional Design DNA / skill uplift**: Only if G3 surfaces repeated contract failures that a short guide cannot solve. Propose a narrowly scoped test and budget before new schema work.

**G5 — Commercial publication**: Real buyer package, file rights, accurate product copy, digital-sale terms, taxes, buyer support expectations and owner approval. No automatic checkout/deploy/push/merge.

**Outcomes:** SMALL EXPERIMENT continues while G0–G2 are sound; SELL SIMPLE KIT if G3 succeeds without DNA; REVISE OFFER if useful but no credible payment signal; DEFER if qualified reach is too low; KILL current vertical if both visual differentiation and qualified buyer value remain absent after bounded revisions. Avoid treating low-N as a statistical proof.

## 8. Out of scope and rejected distractions

- No universal Figma replacement, CMS editor, drag-and-drop layout builder, new rendering framework, blockchain, cloud sync, account model or new site-wide Design DNA engine in v1.
- No generalized AI agent orchestration, proprietary model, subscription service or automated design generation SaaS.
- No ten product tiers, catalogue expansion or pricing change without validation.
- No new WebGL framework, scroll library or dependency just to demonstrate technical ambition.
- No wholesale import of creators' courses, examples or diagrams into a commercial product.
- No release of Signature Hero's unresolved rights or private media/receipts.
- No production deploy, merge, push of implementation code, purchase or irreversible operation without separate explicit user authorization.

---

## 9. Critical risks and decisions after Claude's hostile review

| Priority | Threat | Cheap falsifier / mitigation | Disposition |
| --- | --- | --- | --- |
| P0 | Buyer doesn't need/pay for portfolio templates | Demo + real proposed price + qualified outreach, record objections | Before agent infrastructure |
| P0 | Generic AI editorial aesthetics | Static screenshots + blind compare against strong free layouts | Rework or kill direction |
| P0 | Public MIT/paid offer mismatch | File-level source rights and honest incremental paid value | No exclusive MIT claim |
| P0 | Signature Hero rights and exposed internal notices | Separate provenance/legal review, exclude pending clearance | Block shipped file |
| P0 | Stale local baseline, conflicting historical docs | Inspect actual worktrees and current accepted receipts | No code edit until pinned |
| P1 | Next static export restrictions | Cold build with representative finite project slugs and output inspection | Change hosting/export claim if unsupported |
| P1 | Agent can't use kit with short guide | Three-task smoke + diff/browser checks | Improve docs/content before DSL |
| P1 | Theme/content model already complicated | One source per concern, no duplicate recipe surfaces | Remove abstraction |
| P2 | Unmeasured performance/mobile/a11y | Static baseline, browser and physical-device checks | Disable expensive effect |
| P2 | Source-derived creative heuristics wrongly treated as law | Own wording, rights-aware attribution and manual review | No rule dogma |

**Only outstanding owner execution gates:** (1) approve a specific isolated implementation checkpoint/worktree after local inspection, (2) approve candidate original asset rights and realistic external demo content, (3) approve price/reach strategy before any payment collection. The **first vertical is already chosen**: Cinematic Case Study.

## 10. Source and research links

- Nullworx source and instructions: https://github.com/BikeshedStudios/nullworx
- Historical creative roadmap: https://github.com/BikeshedStudios/nullworx/blob/docs/creative-roadmap-01/docs/ROADMAP.md
- Meta Astryx benchmark and fixture discipline: https://github.com/meta/astryx/tree/main/internal/vibe-tests
- Meta Astryx real-browser eval: https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval
- Anthropic frontend-design skill: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- shadcn registry / agent patterns: https://ui.shadcn.com/docs/registry
- Web Interface Guidelines: https://interfaces.rauno.me/
- Visual rules: https://anthonyhobday.com/sideprojects/saferules/
- Agents with Taste: https://emilkowal.ski/ui/agents-with-taste
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

**Evidence classification:** External benchmark numbers are vendor/self-reported, not reproduced locally. No build/test/user purchase result for this PRD has been newly generated. Docs-only branch creation and contents API commit are not implementation validation.

---

## 11. Implementation handoff and hostile-review record

The owner supplied Claude's hostile review on 2026-11-15 and selected Cinematic Case Study. Claude's review concluded **SMALL EXPERIMENT**, recommending static design + buyer probe before building DNA and shrinking agent tests. **Known limits:** reviewer saw pasted PRD and a truncated implementation plan; several component licenses, actual eval code and browser spec were not opened; none of these are test results. The reviewer's arbitrary three-deposits-from-twenty bar and speculative sample-power estimate are **not adopted as hard gates**.

`IMPLEMENTATION_PLAN.md` version 2.0 is the execution handoff. No product code changes, paid presales, external distribution, merge or deploy are authorized by this revision.

