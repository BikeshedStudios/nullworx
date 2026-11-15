# NULLWORX — Cinematic Case Study Kit 01
## Implementation and Verification Plan (v2.0)

**Status:** OWNER-SELECTED VERTICAL / CODE NOT AUTHORIZED — documentation revision following Claude hostile review  
**Revision:** 2.0 — 2026-11-15  
**Owner decision:** Cinematic Case Study is the first product experiment; Interactive Product Launch is a fallback, not an additional simultaneous build.  
**PRD:** `docs/product/agent-native-kit-01/PRD.md` (v2.0)  
**Repo:** https://github.com/BikeshedStudios/nullworx  
**Planning branch:** `planning/agent-native-kit-01-redteam-20261115`, initially forked from remote `main` at `f753eba9f3d5f4e7578636b29aa43707e948cf98`. This branch is docs-only. **Never use its source ancestry as evidence of the latest approved local integration baseline.**

## 0. Decision and governing constraints

**Build hypothesis:** a visually exceptional, static-strong project index + reusable case-study page could justify a premium self-serve template. A lightweight agent guide and typed content may make it easier to personalize. Do NOT add a new site-wide Design DNA engine unless a concrete failed customer/agent task demonstrates that it solves a problem a short guide cannot.

**Sequence, not six speculative infrastructure stages:**
- **G0:** Local authority, rights, source distribution boundaries.
- **G1:** Static-strong case-study specimen and independent visual comparison.
- **G2:** Early, honest buyer/price signal.
- **G3:** Minimal portable customer kit + agent usability smoke tests.
- **G4:** Optional evidence-triggered Design DNA experiment only if G3 reveals need.
- **G5:** Separate owner-approved commercial release, documentation and consumer/legal terms.

**Global constraints:**
- Read `AGENTS.md` and `docs/PRODUCT_BASELINES.md`, plus approved receipts. Never reset/clean/delete WIP or promote an older experimental branch.
- Follow shared agent discipline: surface material ambiguity; choose the simplest sufficient solution; only touch requested files; define and actually run verification. Preserve existing accepted output and dependencies.
- Implement in an isolated, owner-approved local worktree/experiment. No changes to production, app routes, sitemap, shaders, media provisioning, paywall, Gumroad or public main in this experiment.
- Do not put premium code or internal receipts into public GitHub, Next `public/`, production bundles, shadcn registries or served source maps.
- No new full CMS, MCP, CLI package, general DSL, agent service, shader framework, account system, third-party tracking or subscription.
- No push, merge, deploy, commerce change, paid marketing or distribution without separate explicit owner approval.
- No fabricated performance, conversion, benchmark, source-license or test receipts. A plan ≠ a passed test.

## 1. Phase G0: audit actual baseline and rights (read-only first)

### 1.1 Locate actual source and current WIP safely

The local user machine, not remote GitHub main, is the authority for pending work. Ask the implementer to run read-only commands against the **verified actual repo path**, not blindly using a remembered path:

~~~bash
git -C /VERIFIED/REPO status --short --branch
git -C /VERIFIED/REPO rev-parse HEAD
git -C /VERIFIED/REPO worktree list --porcelain
git -C /VERIFIED/REPO branch -vv
git -C /VERIFIED/REPO log --oneline --decorate -15
git -C /VERIFIED/REPO remote -v
~~~

Read complete local `AGENTS.md`, `docs/PRODUCT_BASELINES.md`, new branch plan and immutable historical receipts. Verify the owner-approved integrated checkpoint and note divergences between stale AGENTS statements and later release decisions. Do not repair those unrelated documents as part of this experiment.

After the owner authorizes a SHA/path, create a **new unique** isolated worktree or experiment. Verify target does not exist; never force. Keep original WIP, index, branches, recovery archives and production controller untouched.

~~~bash
# Example only, AFTER verifying base SHA, repo path and destination:
git -C /VERIFIED/REPO worktree add /VERIFIED/NEW/EXPERIMENT \
  -b experiment/cinematic-case-study-01 <OWNER_APPROVED_SHA>
~~~

### 1.2 Source and license ledger

Before any media/code enters a *customer archive* or public prototype, inventory each intended source file:

`path | SHA256 | origin URI/commit | author | exact license | redistribution rights | third-party notice | public/private boundary | decision`

Mandatory checks:
- `components/bento-duo/orbit/LICENSE` and `.../foil/LICENSE` already confirmed as MIT on public GitHub. Preserve those rights and notices. Paid value cannot honestly be "exclusive MIT source."
- `components/signature-hero/LICENSE.txt` states internal/owner-review with unresolved inherited Living Type code. **Exclude Signature Hero** and its derivatives from this shipped candidate until written rights/clean-room replacement are documented. Do not rewrite its license or delete public files without separate review.
- Images, textures, fonts, audio, shaders, Tailark, content examples and every other distributed asset must have exact provenance and resale/redistribution permission. A product demo using third-party material is not automatically a distributable buyer ZIP.
- Check existing public repo and €39 Bento Duo package only when legitimate owned material is locally accessible; never claim identical ZIP content without a hash comparison.
- Protect private permissions, server addresses, API keys, ZIPs, customer data and unreleased media. Do not copy them into public receipts.

**G0 PASS:** Candidate can be produced with only owned/cleared material, and proposed free vs paid boundary is truthful. If unclear, replace or omit. Distribution remains blocked while unresolved.

### 1.3 Receipts

`receipts/agent-kit-01/preflight.json` and `RIGHTS_MANIFEST.md` in a private isolated experiment. Record exact commands/results/hashes, blocked assets, accepted source SHA and owner sign-off. Review before sharing anything publicly.

## 2. Phase G1: build ONE static-strong visual proof

**Objective:** Is the product visually desirable without any AI/Design DNA mechanism? Build this before editing `lib/design-dna/`.

### 2.1 Exact slice (no full CMS or second vertical)

Two real pages:
- **Project Index**: purposeful hero, semantic navigation, 3–5 credible sample projects, meaningful hierarchy/imagery and contact action.
- **Case Study Detail**: finite `/work/[slug]` project path with title, problem, approach, visual work, outcome, media/caption, related project navigation.

Use existing Next.js + React + TypeScript stack in a **private isolated consumer app** (or a carefully scoped new directory), with project content from one typed JSON/TS source and a single small theme/tokens file. No duplicated recipes or registries.

Example *proposed* tree, not yet created:

~~~text
cinematic-case-study-01/
  app/
    page.tsx
    work/[slug]/page.tsx
    layout.tsx
  components/
    kit-header.tsx
    project-index.tsx
    project-card.tsx
    case-study.tsx
    kit-footer.tsx
  content/
    site.ts
    projects.ts
  design/
    theme.ts
  public/
    cleared-assets/
  tests/
    visual-smoke.spec.ts
  AGENTS.md
  README.md
~~~

Choose typed `.ts` or parsed JSON per content class, not both for the same data. `AGENTS.md` must explain local edit paths. Reuse existing owned/editorial ideas with minimal dependencies. Generic free blocks may be used only where their exact license and value are clear; avoid stacking frameworks.

### 2.2 Static export is a tested option, not a slogan

Test `output: "export"` against the actual Next.js version and features. For finite `/work/[slug]` routes, precompute every supported slug with `generateStaticParams` and verify generated HTML under `out/`. Avoid Server Actions, runtime API endpoints, unconfigured default image optimization and dynamic runtime features that break static export. If static export is not feasible without sacrificing the product, record the exact limitation; do not silently migrate to Astro/Vite or a new deployment product.

Provide a no-effect mode; optionally add **at most one** cleared visual material/effect after the static proof survives. Respect reduced motion, keyboard focus and readable contrast. No unnecessary scroll hijacking, full-page GPU animation, blanket animated section entrances or shader preloads.

### 2.3 Required visual acceptance evidence

- Desktop 1440×900 and mobile 390×844 captures **without animation/effects**.
- 320px overflow and 768px breakpoint captures.
- Long project title, multi-line heading, empty/missing image, large content block and navigation states.
- Real, honest text and images; do not fabricate customer clients/revenue.
- Owner KEEP/REVISE/KILL before agent layer.
- Blind comparison with **three competent free templates**, same representative content and viewports. Record source/version, reviewers, selection reasons and uncertainty. Do not intentionally choose weak free comparators.

**G1 fail:** Looks like generic AI-assembled rounded cards or only becomes interesting with GPU effects; redesign composition, not more animation. If it still fails after bounded revision, KILL current aesthetic approach.

## 3. Phase G2: early market probe BEFORE agent tooling

### 3.1 Offer and target

Present the exact two-page prototype and proposed buyer bundle to relevant independent React developers, creative freelancers and small studios. Initial buyer target is a hypothesis; test adjacent product-launch buyers if case-study value is consistently weak, but **do not build a second product to complete the test**.

State honestly:
- buyer receives finished project-index/case-study design, typed content, cleared original assets, docs, source ownership under specified terms, small agent guide;
- existing public MIT code is not exclusive;
- supported Next/Node versions and actual static-host constraints;
- hypothetical one-time price labeled proposed until approved; no invented demand data;
- if not available for purchase, say so: interest-only pilot rather than checkout.

### 3.2 Research activity, not a revenue claim

Suggested first probe: **~20 qualified outreach contacts**, individual notes and conversations. The count is a sampling target, not statistical evidence; avoid unconsented scraping or spam. Test one price proposition and track objection type and real use case.

Capture `reach | target qualification | viewed demo? | respondent's task | alternative today | value evidence | price response | requested next action | consent`. For real payment ask/checkout, first obtain owner authorization and verify product disclosure, taxes and relevant Swedish/EU distance-sales obligations. Do not automatically publish a prepaid deposit page.

**G2 interpretation:**
- Unclear qualified reach / weak distribution: refine channel and value proposition rather than automatically kill.
- Qualified viewers cannot explain why kit beats free: revise or kill offer.
- Credible evidence of willingness to pay with use cases: continue to package and minimal agent proof.
- A particular three-deposits-out-of-twenty threshold is not a hard gate; do not disguise noisy pilot counts as conversion data.

**G2 FAIL/STOP:** no identifiable differentiated buyer job or owner declines to continue after seeing actual objections. Do not build AI infrastructure to compensate for no demand.

## 4. Phase G3: package simplest agent-compatible customer kit

Start only after G1/G2 outcomes justify packaging; preserve static proof. Keep **no new site-wide Design DNA** and no extra published CLI.

### 4.1 Minimal agent and data surface

- One canonical local content model, type-checked/slugs unique, useful error output.
- One theme token file with role-aware contrast checks or rendered browser diagnostics (not arbitrary "accent contrast means WCAG AA" claims).
- Root customer `AGENTS.md`, **target ~60 lines maximum**, describing what to edit, critical project contract, explicit stopped tasks, current tests and source boundaries. Canonical Nullworx agent rules: clarify only material blockers, minimal change, no unrelated refactors, verify actually.
- `pnpm check` planned script that delegates to existing content/type/build validations. No new tool just to produce a `--json` API; an ordinary failure/exit code and human-readable path are enough.
- Exact buyer archive is self-contained after installation, with frozen lockfile, licenses, attribution, no paid API, no agent model dependency or secret state.
- Keep internal experimental `lib/design-dna/` separate. Do not tell buyers that Orbit/Foil/Signature recipes control entire project header/case study. If a feature is not supported, it is not a v1 marketing claim.

Proposed package scripts (the commands **do not exist yet** until implemented):

~~~json
{
  "scripts": {
    "check": "pnpm content:check && pnpm typecheck && pnpm build",
    "test:kit": "playwright test"
  }
}
~~~

Verify scripts against actual Next.js project dependencies; the task isn't to install a new check framework unnecessarily.

### 4.2 Independent exact-package proof

Create the candidate ZIP/TGZ in a **private path**. Inspect archive contents and SHA256; extract fresh, install, validate, build and run behavior probes from *that extraction*, not the source workspace. Verify no leaked private assets/sourcemaps/licenses/secrets.

Checks at 320/390/768/1440:
- finite slug routes, project navigation, contact link and actionable controls;
- semantic heading structure, labels, keyboard focus/visible focus, no keyboard traps;
- long/empty content, missing media, image aspect ratio, link errors;
- reduced motion and no-effects state;
- unknown slug behavior within static generation constraints;
- browser page errors, error messages and copy completeness;
- static export contents served through a static host if advertised.

Run existing media/product baseline tests only if shared core code is touched; record skips with reasons, never fake protected fish-media attestation.

### 4.3 Agent usability smoke (NOT a benchmark claim)

Use three unseen tasks × two available models × one pass each, with same exact product and fresh isolated starting copy. Suggested:
1. Replace project data and brand palette without touching kit internals.
2. Add a fifth project with long title, a missing image and realistic content.
3. Request an *out-of-lane* feature (e.g., automatic testimonials/CMS) requiring agent to state scope and avoid unauthorized architecture.

One failed run is a diagnostic, not a significance test. Record exact model/effort, prompt, allowed read/write paths, output SHA, git diff, compile/build/Playwright results, screenshots, estimated/manual repair time and known limitations. Do not expose hidden reference code. Positive and negative grader controls first.

**G3 PASS:** a stranger can install and modify core content; browser checks pass; normal agents can perform representative bounded edits. If this works, **ship a simple kit** instead of creating DNA to prove a preselected architecture.

## 5. Phase G4: optional Design DNA maintenance / expansion

### 5.1 Known remote DNA issues (NOT G1/G2 blockers)

Remote `lib/design-dna/snippets.ts` hardcodes `preset="cobalt"` while `adapters.ts` chooses preset by palette. `recipePreviewStyle` uses Signature Hero `layout.maxWidth` without equivalent integration wrapper; Orbit/Foil schemas accept `motion.mode` while adapters do not explicitly forward it; palette validator's decorative accent check does not establish text/UI contrast compliance. Existing tests check syntax/presence, not the full customer generated-code path.

**Separate maintenance task** (owner approved independently): change the minimum code necessary, add direct parity/field-consumption/negative tests, confirm component behavior/rights before any source inclusion. Do not treat this as a reason to block the standalone case-study design proof.

### 5.2 Evidence-triggered agent experiment only

Trigger only if G3 repeatedly fails due to *preventable variation drift* and not because starter content/README was poor. Then compare:
- B: exact kit + short guide/skill;
- C: same kit + **one minimal guarded recipe rule** for the failed task;
- same model/fixtures/permissions/budget;
- tests assess actual field and rendered behavior, not arbitrary "used design DNA" score.

No mandatory 36-run harness, no claimed 30% repair uplift from small sample, no MCP/registry builder. Reject DNA if a TypeScript/content guard solves the same failure at lower cost.

## 6. Phase G5: buyer usability, licensing, explicit release decision

After independent package proof, observe up to five relevant people attempting a cold install and first content/theme change. This is a small usability probe, not definitive demand. Record support intervention, actual project fit and any real payment commitments.

**Release checklist:** agreed one-time offer and contents, exact licensed ZIP, license manifest and source rights, version/build tests, media and font attributions, privacy/security, digital content purchase terms, refund/withdrawal handling, VAT/merchant mechanics, updates/support limits, owner review. No automatic staging/production/checkout or GitHub merge.

**Possible decisions:** PRODUCTIZE if buyer, visual, rights and portable kit gates survive; SELL SIMPLE KIT if advanced agent tools bring no uplift; REVISE BUYER/OFFER if good product with weak channel/price; DEFER if unqualified exposure; KILL if persistent undifferentiated design + no credible buyer value.

## 7. File-level impact and protected zones

| Area | Phase | Intent | Hard boundary |
| --- | --- | --- | --- |
| Verified private experiment path | G1 | New index/case-study source with one content and one theme layer | Do not assume old local path or expose paid source on public main |
| Private `RIGHTS_MANIFEST.md` + media ledger | G0 | Exact asset/source inventory | Never publish private permission receipts |
| Experiment `AGENTS.md` / readme | G3 | Compact customer guidance based on shared agent principles | No large system prompt or untested platform promises |
| Experiment package scripts & Playwright | G3 | Customer installation and behavior verification | No fake passes/skipped media attestations |
| `lib/design-dna/{schema,adapters,snippets}.ts` | Separate future maintenance only | Repair known exported/live mismatch if separately approved | Not an experiment prerequisite |
| `tests/unit/design-dna.test.ts` & `tests/e2e/design-dna.spec.ts` | Separate future maintenance only | Regression tests for claimed DNA semantics | No mass refactor |
| Existing `app/page.tsx`, fish and protected media | NEVER in this experiment | Preserve accepted site | No accidental changes |
| Existing protected commercial and deployment paths | NEVER in this experiment | Preserve commercial/production decisions | Explicit approval required |
| Remote planning branch PRD/plan/AGENTS.md | Current docs-only scope | No product code modifications | No merge to main without owner approval |

## 8. Verification matrix and honest receipts

**On existing Nullworx if shared code touched later:**

~~~bash
pnpm install --frozen-lockfile
pnpm verify
pnpm build
# Run additional product/distribution/browser gates required by the actual accepted baseline.
~~~

**On private customer kit when `check` exists:**

~~~bash
pnpm install --frozen-lockfile
pnpm check
pnpm test:kit
# For approved static-export: inspect and serve ./out; browser smoke its routes.
~~~

Never report these as executed until real terminal output exists. Preserve full logs with exact exit status; classify `PASS / FAIL / SKIP(reason) / NOT_RUN`. If a user-visible widget says PASS but the real browser check fails, report FAIL.

**Recommended per-task receipt (fields may be unknown, never invented):**

~~~json
{
  "taskId": "add-case-study",
  "input": {"sourceSha": null, "fixtureSha256": null},
  "agent": {"modelId": null, "instructionsHash": null},
  "changedFiles": [],
  "checks": {"install": "NOT_RUN", "typecheck": "NOT_RUN", "build": "NOT_RUN", "browser": "NOT_RUN"},
  "qualitative": {"ownerVisual": "NOT_REVIEWED", "externalVisual": "NOT_REVIEWED"},
  "measurements": {"tokens": null, "costUsd": null, "repairMinutes": null},
  "evidence": []
}
~~~

*Comparators:* same content and subject on strong free starter; blind rank results and caveats. Record all failed or unflattering evaluations; don't selectively publish winners.

## 9. Rollback, hazards, stopping rule

- All new implementation code stays in new private worktree/experiment; rollback is to leave it untouched or retire it after owner approval, **not to delete original worktrees**.
- Source rights may be unclear even if code is public. Default exclude, do not relabel without evidence.
- Static Next export has actual feature restrictions; test once early. Do not introduce Next server/runtime functionality if product promises static-only.
- Overcomplication includes speculative schema, state machines, generic theme editors, new infrastructure and unnecessary stylized effects; reject unless the product demonstrably needs them.
- Stop before expensive evaluation, new architecture, external publication or legal/commercial commitments, and request owner approval.

## 10. Execution handoff and acceptance summary

**S0 Rights/read-only:** source map, approved SHA, private experiment path, blocked assets (G0).  
**S1 Visual proof:** two real pages; screenshot and owner static gate; free competitor compare (G1).  
**S2 Market probe:** 20 qualified outreach target, real price concept, actual objection ledger (G2).  
**S3 Portable kit:** local content/theme, short AGENTS, clean bundle, real-browser tests, six-run diagnostic agent smoke (G3).  
**S4 Optional:** one Design DNA repair or new guard only if a repeated failure demands it (G4).  
**S5 Optional launch:** license/compliance/packaging, explicit owner approval (G5).

At each step: **PLAN → CHANGESET → VERIFY → VERDICT** with exact commands, files and hashes, measured vs inferred vs unknown, rollback and next smallest falsifier.

**External references:** https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval ; https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md ; https://github.com/multica-ai/andrej-karpathy-skills ; https://ui.shadcn.com/docs/registry ; https://www.w3.org/TR/WCAG22/ .

**Status:** This plan is documentary; no kit, install, browser probe, agent test, buyer test or release has been executed by writing it.
