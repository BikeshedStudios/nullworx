# NULLWORX — Agent-Native Kit 01
## Product Requirements Document (PRD)

**Status:** PROPOSED / ADVERSARIAL REVIEW PENDING — NOT APPROVED FOR IMPLEMENTATION OR RELEASE  
**Document revision:** 1.0 — 2026-11-15  
**Product owner:** Bikeshed Studios / Nullworx  
**Repository:** https://github.com/BikeshedStudios/nullworx  
**Companion:** `docs/product/agent-native-kit-01/IMPLEMENTATION_PLAN.md`  
**Review prompt:** `docs/product/agent-native-kit-01/CLAUDE_RED_TEAM_PROMPT.md`  
**Docs-only branch base:** `main` at `f753eba9f3d5f4e7578636b29aa43707e948cf98` (remote snapshot, 2026-11-15)  
**Important:** Actual implementation baseline must be selected afresh from the owner's approved local integration/worktrees after an explicit authorization. Remote `main` is NOT presumed to be the currently approved local worktree.

---

## 0. Executive decision

**Decision hypothesis:** Build **one complete, visually exceptional, self-hostable React/Next.js case-study website kit** with a narrow agent-editing contract and reproducible installation/behavior tests. Do not build a universal design system, an AI service, a proprietary runtime, a CMS, a new shader engine, or an MCP server.

The paid-product advantage is **finished design + easier safe personalization + portable source**, not the mere presence of AI instructions, individual MIT components, or design rules.

**Investment verdict:** SMALL EXPERIMENT. No premium publication or broader product expansion until visual, technical, buyer, and rights gates pass.

**Most important falsification:** Compare (A) kit only, (B) kit + short agent skill, and (C) kit + skill + Design DNA. If C cannot meaningfully outperform B on unseen personalization tasks, simplify or retire the extra DNA layer. Compare the finished Nullworx kit separately against a credible free shadcn-based case-study implementation.

---

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

- `components/bento-duo/orbit/` and `components/bento-duo/foil/` exist on public GitHub and contain MIT `LICENSE` files. Existing public MIT permissions must be respected; paid offering must add genuine value beyond exclusive access to these sources.
- `components/signature-hero/LICENSE.txt` states internal owner-review/no customer license and flags unresolved inherited Living Type licensing. Do NOT redistribute Signature Hero or incorporate it in the paid candidate until each relevant source file and asset is independently cleared. Presence in the public repository does not establish commercial rights.
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

Ship a complete, source-available-to-buyer **Next.js + React + TypeScript** project with:

1. **Project Index / Home**: intentional visual hero, semantic navigation, credible project index, project metadata, clear primary interaction and contact route.
2. **Case Study Detail**: slug-based project page with problem, process, work, results, media, captions and next/previous or related navigation.
3. **Content system**: typed or schema-validated local project data, text/image placeholders with real dimensions, accessible alt-text and stable metadata.
4. **Personalization system**: bounded global brand information, typography/palette choices and approved section variants; no need to rewrite components for normal personalization.
5. **Material and motion**: reuse selected owned/cleared Nullworx effects, sparingly, with static, reduced-motion and low-power fallbacks.
6. **Full code ownership**: no mandatory Nullworx account, API key, telemetry, license server, runtime AI service or proprietary build step.
7. **Docs**: installation, what-to-edit, licensing/provenance manifest, supported versions, screenshots and troubleshooting.
8. **Agent contract**: short skill, compact authoring instructions and a versioned recipe; generated or referenced from canonical metadata where practical.
9. **Verification**: local one-command validation plus independent install/build/behavior tests.

**Do not market as a drag-and-drop editor.** Editors are source code and bounded content/recipe files.

### 3.2 Primary customer journey

- **Discover**: view live real-component demo and truthful screenshots; content and license inventory visible.
- **Evaluate**: see desktop/mobile and at least two independently applied brand transformations; understand the exact file/package contents and supported environment.
- **Acquire**: use existing payment/delivery mechanism if and only if commercial gate is approved.
- **Install**: unpack, install pinned dependencies, run and build without Nullworx services.
- **Personalize**: replace project content/branding using human edit OR coding agent.
- **Verify**: one command reports actionable validation failures; browser test assures basic behavior.
- **Deploy independently**: customer-controlled host, no supported-host lock-in.
- **Maintain**: clear compatibility and update policy, no promise of indefinite free changes.

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
| US-08 | Agent makes invalid recipe edit | Validator rejects with stable path/code and never silently applies broken state |
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

## 5. Agent-native contract (customer-facing)

### 5.1 Principles

1. **Kit works without an agent**. AI instructions are optional, not a runtime.
2. **Data, not executable prompts**. Recipe fields cannot contain arbitrary imports, code, HTML, CSS, package names or scripts.
3. **Explicit registry and version**. Only owned/approved components and compatible versions are allowed.
4. **Single canonical source**. Component schema, allowed props, variants and dependencies come from maintained machine-readable structures; generate documentation where practical.
5. **Small, task-specific context**. Skill selects layout, type, motion or a11y guidance relevant to task; no universal giant prompt.
6. **Three freedom levels**:
   - L1 content and bounded brand: supported by schema;
   - L2 composition/variant: approved set, validated;
   - L3 arbitrary source modification: buyer may do it, but exits validated-contract guarantees.
7. **Fail closed at contract boundary**. Invalid recipe yields error path, stable code, diagnosis and no partial apply. Full filesystem agents can still change source: detect with diffs/tests rather than falsely claiming the schema prevents it.
8. **No hidden remote calls**. Offline/local validator by default, no dependency on Nullworx servers.

### 5.2 Minimal v1 interface

- A local `pnpm kit:validate` command: parse/validate recipe, content references, component identities/versions, install closure and selected semantic constraints; stable machine-readable JSON option is desirable only if cheap.
- A bounded `AGENTS.md`/`SKILL.md` explaining supported files, editing workflow, guardrails, tests and when to report inability.
- A documented set of known recipes and a manifest tying their expected results to real React components.
- Not in v1: agent chat UI, design canvas, hosted conversion service, a publicly hosted premium registry, or general-purpose MCP.
- `DESIGN.md` export and an `inspect --json` command are **follow-on hypotheses**, unless a reproducible customer task requires them in the first trial.

---

## 6. Evaluation strategy and success measures

### 6.1 Separate three questions

1. **Aesthetics**: is the base kit exceptionally good and distinctive even with effects disabled?
2. **Agent uplift**: does a recipe actually outperform a conventional skill on equal tasks?
3. **Commerce**: will a real target buyer invest money to use the kit?

One does not prove another.

### 6.2 Agent A/B/C experiment (same kit)

- **A:** kit, normal task prompt; no special skill.
- **B:** kit, concise task-specific agent skill.
- **C:** kit, same skill plus Design DNA + validator.
- Freeze model, tools, time/credit cap, start tree, fixtures and evaluation before runs. Fresh isolated agent per task. Randomize condition order; save all attempts including failures, logs, patches, tokens and costs.
- Pilot: 2 unseen tasks × 3 arms × 1 repetition = 6 runs, preceded by **free grader self-tests**.
- If self-test and pilot pass, expansion: 6 unseen tasks × 3 arms × 2 repetitions = 36 runs. Multiple models only if a signal justifies extra cost.
- Actual tasks: project content replacement, brand adaptation, constrained palette, responsive long text, case-study addition, reduced-motion/motion variant. Prefer project-specific task realism and adversarial variants.
- Compare B vs C as main question. A vs B is secondary. Control total prompt/context exposure as far as practical and report measured tokens.
- Grader: TypeScript + production build + real browser behavior + content fidelity + WCAG diagnostics + bounded layout/visual tests. Screenshots reviewed blind; no universal "looks premium" LLM score accepted as proof.
- **D:** separate comparable build using shadcn/free baseline to judge the product offer. This comparison changes the kit itself and must not be conflated with A/B/C's causal test.

### 6.3 Grader correctness

- Positive reference must pass all probes.
- Negative references (missing module, unsupported prop, no-op control, broken navigation, invalid recipe, low contrast / clip where applicable) must reliably fail their intended checks.
- Agent must not read answer keys, reference solutions or other runs. Use proper isolated folders or containers; transcript audits alone are incomplete security boundaries.
- Use no pre-built expected-components hints in agent task prompts. Keep expected components private to grader.
- Browser probes interact via accessible roles, keyboard/pointer and computed visible state, not implementation-specific class names whenever feasible.
- Cite external methodology: https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval

### 6.4 Proposed numeric gates (decision thresholds, not observed facts)

- 100% independent clean installation/build checks across the explicitly supported v1 environment(s).
- 100% prescribed critical customer paths pass reference behavior probes.
- No known blocking accessibility defects, uncaught browser errors or unacceptable mobile clipping.
- 0 unresolved distribution-rights blockers; 0 unauthorized premium/secrets exposure.
- C should reduce **manual repair effort by at least ~30% vs B** at non-inferior task completion/visual quality to justify maintaining extra DNA complexity. With small sample sizes this is a *pragmatic threshold*, not statistical confidence; use effect size plus failure-case review.
- Blind visual reviewer must not consistently prefer generic free baseline over the paid-kit output for the intended audience.
- Early user test: target 5 relevant independent users, track who installs unaided, time to finish, support requests, attempted real-work use and willingness to take a concrete purchase action. Do not treat verbal praise as paid demand.
- No invented revenue forecast, conversion percentage, benchmarks, release date or price.

---

## 7. Release gates and decision tree

**G0 — Repository and rights**: accepted local worktree/base pinned; no dirty WIP overwritten; all candidate sources/assets rights-mapped; public MIT vs premium boundary reconciled.

**G1 — Existing contract reliability**: known Design DNA defects resolved or explicitly disabled; export and preview agree; consumer builds and tests run.

**G2 — Visually finished product**: real index and case-study pages; accepted owner visual review; mobile/keyboard/reduced-motion pass with original/cleared assets.

**G3 — Agent usability**: independent agent can personalize project content and theme through supported editing path; validator and browser probes catch regression; no hidden dependencies.

**G4 — Agent uplift proof**: B vs C tested; if no meaningful improvement, drop complicated DNA parts and ship kit + short skill.

**G5 — Commercial validation**: target users attempt installation, there is meaningful evidence of intent to pay, deliverables/license/terms clear; explicit owner approval before checkout, publication, pricing or production release.

**Outcome choices:**
- BUILD / PRODUCTIZE only if G0–G5 support it.
- KEEP SIMPLE KIT if design is good but C fails vs B.
- PIVOT BUYER / OFFER if technical utility is proven but buyers do not value it.
- KILL if visual identity is generic or independent install fails beyond bounded repair.
- DEFER optional feature if benefits cannot be distinguished from existing stack.

---

## 8. Out of scope and rejected distractions

- No universal Figma replacement, CMS editor, drag-and-drop layout builder, new rendering framework, blockchain, cloud sync or account model.
- No generalized AI agent orchestration, proprietary model, subscription service or automated design generation SaaS.
- No ten product tiers, catalogue expansion or pricing change without validation.
- No new WebGL framework, scroll library or dependency just to demonstrate technical ambition.
- No wholesale import of creators' courses, examples or diagrams into a commercial product.
- No release of Signature Hero's unresolved rights or private media/receipts.
- No production deploy, merge, push of implementation code, purchase or irreversible operation without separate explicit user authorization.

---

## 9. Risks, triggers, owner decisions

| Risk | Trigger | Mitigation | Decision |
| --- | --- | --- | --- |
| Visually generic | Blind reviewers see ordinary AI template | Redesign static composition | Kill aesthetic direction if repeated |
| Unreal differentiator | B≈C or C worse | Remove unnecessary recipe/CLI complexity | Keep kit + skill |
| Framework compatibility | Fails clean Next install | Pin/fix one supported environment | No release |
| Asset/license conflict | Missing owner/right provenance | Replace asset, remove feature, or obtain rights | Block release |
| Source exposure | Premium source copied into public main/ZIP not gated | Audit Git tree and build artifacts | Block release |
| Performance | Mobile lag or excessive GPU use | Static fallback, reduce effects | Feature reject |
| Agent security | Agent uses arbitrary recipe payload or reads answer keys | Schema, isolation and tamper-evident receipts | Block benchmark |
| Context bloat | Skill consumes tokens without benefit | Split by task; compare simple baseline | Simplify |
| Weak distribution | No qualified visits or user attempts | Test demo and channel before more code | Pause expansion |
| Support burden | Repeated installation issues | Small support matrix and better docs | Re-scope |
| Poor legal claims | Public MIT asserted premium-exclusive | Honest inventory and offer positioning | Block publication |
| Evaluation bias | Nullworx-only test passes, external loses | Blind grading, strong free competitor | Reassess |

**Owner decisions required after independent Claude review**:
1. Is Case Study the right first buyer-facing vertical vs Product Launch?
2. Does a complete kit justify payment absent proven extra Design DNA uplift?
3. What explicit budget cap and model(s) for A/B/C experiments?
4. Which licensed original assets may be in paid ZIP and which must be replaced?
5. What is the current approved integration checkpoint and protected local WIP?

These are **decision gates**. They need not block documents or small read-only research.

---

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

## 11. Implementation handoff

Proceed to `IMPLEMENTATION_PLAN.md` only after owner reviews the hostile Claude critique. Implementation plan must independently reverify the local repository and use smallest reversible changes. This PRD intentionally contains no permission to release or merge.
