# NULLWORX — Agent-Native Kit 01
## Code and Verification Plan

**Status:** PROPOSED / HOSTILE REVIEW PENDING — DO NOT IMPLEMENT OR DEPLOY FROM THIS DOCUMENT ALONE  
**Revision:** 1.0 — 2026-11-15  
**Companion:** `docs/product/agent-native-kit-01/PRD.md`  
**Scope of current GitHub branch:** Documentation only. No application code or existing product baseline is intentionally changed.  
**Proposed first implementer:** Claude/Codex/DeepSeek under owner-controlled local worktree, with independent reviewer.  
**Repo:** https://github.com/BikeshedStudios/nullworx

---

## 0. Mission and stop conditions

**Goal:** Demonstrate one complete, visually differentiated **Cinematic Case Study Kit** with a narrow agent contract and verified customer portability. Use existing Nullworx stack. Establish whether extra Design DNA reduces repairs beyond a concise skill.

**Non-goals:** no universal visual editor, CMS, MCP server, proprietary agent runtime, new shader engine, general token platform, unapproved product launch, or scaling to multiple kits.

**Never**:
- reset/clean an existing working tree, overwrite WIP, rewrite accepted releases or edit protected media without explicit authorization;
- assume remote `main` is the approved local integration baseline;
- copy premium sources, secrets, private receipts, or unlicensed code into the public Git tree;
- merge, deploy, publish, purchase, push implementation branches or mutate production without separate owner approval;
- claim tests, benchmarks, runtime FPS or buyers without actual receipts.

**Success condition:** base kit satisfies visual gate; one clean consumer install and two owner-selected personalizations pass behavior/layout tests; A/B/C determines whether DNA adds meaningful value; rights/commerce pass before any paid launch.

**Abort/DEFER:** rights unresolved, unclear base/WIP authority, install fails beyond bounded repair, generic visual output, uncontrolled scope creep, or expensive eval without budget cap.

---

## 1. Preflight: current truth before any change

The planning docs branch was based on remote `main` SHA `f753eba9f3d5f4e7578636b29aa43707e948cf98` as observed 2026-11-15. That SHA is **not authorization** to base implementation on it.

Local operator should run **read-only first**:

~~~bash
cd ~/DevHub
git -C nullworx status --short --branch
git -C nullworx rev-parse HEAD
git -C nullworx branch -vv
git -C nullworx worktree list --porcelain
git -C nullworx remote -v
git -C nullworx log --oneline --decorate -15
~~~

The actual repo may be in a different path: discover and report; do not create/replace a guess. Read full `AGENTS.md`, `docs/PRODUCT_BASELINES.md` and references to accepted unified integration/release checks. Compare current local refs, owner approvals, dirty edits and existing pending worktrees.

**Preflight receipt:** `evidence/agent-kit-01/preflight.json` in the isolated experiment (or a separate non-public receipts location), recording source SHAs, safe worktree path, dirty files, branch, commands and exclusions. Never record credentials, server addresses or unrelated private data in public artifacts.

### Baseline decision

- Choose latest **owner-approved** unified checkpoint, not oldest convenient feature commit and not a stale plan.
- Preserve dirty original worktrees/index.
- Create a new isolated worktree or independent experiment directory using a safe unique path after verifying no collision; do not checkout over user WIP.
- Confirm accepted release baseline and pre-existing skips/failures via original checks BEFORE edits.
- All changes remain uncommitted locally or committed on new isolated experiment branch only until explicitly approved for push/merge.

**Commands after approved base SHA is identified** (replace placeholders; example only):

~~~bash
# inspect-only until paths and SHA are verified
git -C /verified/path/to/nullworx worktree list
git -C /verified/path/to/nullworx worktree add \
  /verified/new/isolated/path -b experiment/agent-kit-01 <APPROVED_SHA>
~~~

Record rollback: removing only the *new approved isolated worktree* after explicit permission; original worktrees remain untouched.

---

## 2. Dependency / source / rights audit (G0)

Create a per-file inventory; no full-repo license inference.

**Required inventory fields**: path, SHA256, origin URL/commit/version, copyright owner, exact license, attribution requirements, redistribution rights for editable source, whether already public MIT, whether premium-private, network dependencies, performance constraints, acceptance verdict.

### Mandatory starting audit

1. `components/bento-duo/orbit/` and `components/bento-duo/foil/`: public GitHub paths include MIT `LICENSE` files, source TSX and CSS. Do not advertise exclusive ownership of those public implementations.
2. `components/signature-hero/LICENSE.txt`: **owner-review/no customer license**, unresolved inherited Living Type provenance. Default = EXCLUDE from paid candidate until explicit rights resolution. If excluded, case study must work without it.
3. `@paper-design/shaders-react`: verify pinned version and Apache-2.0 obligations for delivered code.
4. Fonts: inspect bundled OFL-1.1 obligations and provenance.
5. Every photo, texture, media sample, illustration and sound: original/CC0/explicit commercial-redistribution basis; filenames/hashes and notices.
6. Third-party Tailark/Keystatic/Motion/etc. optional: do not install or copy unless the exact feature gap is demonstrated, license verified for the exact files and independent install benefits.
7. Confirm product artifacts, source maps and internal receipts cannot enter public Next.js bundles, registry or static assets accidentally.

**Output**: `RIGHTS_MANIFEST.md` and machine-readable `rights.manifest.json` in private experiment until vetted.

**Release stop:** one unresolved shipped file = G0 FAIL. Explicit reviewer sign-off required.

---

## 3. Phase P1: repair Design DNA 1.0 parity, no new architecture

### Read first

- `lib/design-dna/schema.ts`
- `lib/design-dna/registry.ts`
- `lib/design-dna/adapters.ts`
- `lib/design-dna/snippets.ts`
- `components/design-dna/lab.tsx`
- `components/signature-hero/signature-hero.tsx` and presets (read only if rights require exclusion)
- `components/bento-duo/orbit/*` and `foil/*`
- `fixtures/design-dna/valid/*`, `invalid/*`
- `tests/unit/design-dna.test.ts`
- `tests/e2e/design-dna.spec.ts`
- `tests/distribution/*` and scripts
- `docs/PRODUCT_BASELINES.md`

### Known issue A — Signature Hero preset

`signatureHeroProps(recipe)` selects a matching preset; `integrationSnippet(recipe)` currently emits `preset="cobalt"`. Either:
- use the same typed mapping as the live adapter to generate correct preset, **or**
- prove the fixed preset is intentionally required and remove misleading variable preset promise from exported recipe.

**Preferred minimal change:** centralize renderer-facing derivation in a pure mapping function and use its output in preview and snippet. Do not create two ad hoc preset-selection implementations.

### Known issue B — Layout wrapper

Preview uses `recipePreviewStyle` with `layout.maxWidth` for Signature Hero, while snippet does not reproduce wrapper sizing. Make exported code apply the same outer layout contract where it is supported. Define intended semantics explicitly: does `maxWidth` apply at outer container vs internal component? Test computed dimensions, not only text in generated snippet.

### Known issue C — Accepted motion values

Orbit/Foil recipe accepts `motion.mode: auto|static` but `orbitBentoProps` and `foilReactorProps` do not visibly forward it. Read actual component implementation:
- if supported motion prop exists, map it and verify;
- if motion is controlled by existing CSS/media query, test the actual effect and document how recipe affects it;
- if neither, **remove/reject the unsupported field** via a versioned schema change only with explicit migration/version plan. Never silently ignore a promise.

### Known issue D — Color role semantics

`paletteIssues` currently checks ink/background ≥4.5 and accent/background ≥2. Neither addresses functional role use, text placed on accent, focus ring and inline material state. Do **not** solve with a single arbitrary accent floor:
- document each rendered semantic color role;
- validate contrast where data proves the role and surface;
- check actual DOM/computed colors with browser/axe where material/backdrop changes matter;
- keep decorative accent distinct from action-label text/active state semantics;
- avoid claiming universal WCAG conformance from recipe validation alone.

### Tests for P1

1. **Unit**: all approved recipes remain deterministic; invalid schema/code shapes rejected; all supported fields either have a visible effect or are removed from the advertised contract.
2. **Snippet compile**: generate snippet for every approved recipe, put in a real independent consumer fixture with exact dependencies, run `tsc` and production build.
3. **Parity**: compare live lab and exported consumer for semantic content, preset, layout width and key computed styles at 390/1440; if screenshot diffs are used, pin browser/fonts/assets/viewport/motion and mask only justified nondeterminism.
4. **Negative controls**: unknown versions/imports, malformed JSON, impossible layout radius, invalid color roles, missing dependency, code-in-data and unsupported motion.
5. **Source closure**: reject undeclared private code, missing license notices, external unsanctioned media.
6. **Regression**: baseline effect and media suites still pass at unchanged behavior.

**G1 gate:** no known preview/export mismatch in claimed behavior and clean consumer compile/build. Historical passing screenshot receipts alone do not count.

---

## 4. Phase P2: build an isolated, visually excellent kit without AI first

### Suggested isolated product tree (illustrative, not pre-existing)

~~~text
experiments/agent-case-study-01/
  app/
    page.tsx
    work/[slug]/page.tsx
    layout.tsx
  components/kit/
    site-header.tsx
    project-grid.tsx
    project-card.tsx
    project-hero.tsx
    case-study-sections.tsx
    site-footer.tsx
  content/
    site.json
    projects/
      project-a.json
      project-b.json
      project-c.json
  design/
    tokens.ts
    variants.ts
  public/
    licensed-original-assets/
  tests/
    kit.spec.ts
  README.md
~~~

Do not hardcode an independent project location until actual repo paths and deployment build inclusion/exclusion rules are checked. The paid kit must not be published in the public repository. Keep private candidate code separate from the public Next.js source build unless owner approves exposure.

### Owner visual brief

- Use the approved editorial/material direction and real design quality from static composition.
- Large readable typography, high contrast, disciplined spacing, purposeful color accents and composition.
- Avoid generically repeated cards, gratuitous numbered labels, endless marquees or visual effects on every region.
- Reuse owned/cleared Orbit/Foil where helpful, not because present; do not require unresolved Signature Hero.
- Show meaningful project data and working interactions. Honest placeholder descriptions, not fabricated customers/revenue.
- First produce screenshot review of 390×844 and 1440×900 plus 320px overflow check; display static/no-effects variant. Owner decides KEEP/REVISE/KILL.

### Implementation rules

- Keep content data outside layout implementation. Type/check project JSON and slugs; avoid arbitrary HTML injection.
- Accessible headings/order, valid links, keyboard focus, image alt, broken-media fallback, no-scroll traps.
- Use native semantics. No extra component framework until a specific capability gap appears.
- Motion opt-in by meaningful interaction, with `prefers-reduced-motion` and no-Runtime-GPU fallback.
- Avoid preloading heavy effects for offscreen sections; release observers, event handlers and GPU resources on unmount.
- Perf budgets must be tied to captured baseline and device; do not invent ideal FPS.
- Preserve all existing public site routes and approved default fish/media if integrating later; this standalone experiment must not change production.

**G2 gate:** design approved as a standalone website **without** agent instructions or complex shaders.

---

## 5. Phase P3: minimum agent contract layered onto finished kit

### Proposed customer tree

~~~text
<customer-kit>/
  app/...
  components/kit/...
  content/site.json
  content/projects/*.json
  design/recipe.json
  design/recipe.schema.ts
  design/rules/rules.json
  AGENTS.md
  .agents/skills/nullworx-kit/SKILL.md
  scripts/validate-kit.ts
  tests/...
  package.json
  pnpm-lock.yaml
  README.md
  LICENSES.md
~~~

**Policy**:
- The canonical schema and component registry determine what content, layout and palette fields are allowed. Generated docs must not disagree with code.
- Editing lanes: (1) content/approved theme, (2) declared layout variants, (3) unsupported free-code modifications that are not promised to pass the contract.
- The agent skill must be short and task-oriented: inspect → modify bounded files → validate → screenshot/probe → diff report.
- Instructions are not security controls. External agents can still write arbitrary code; post-change tests and diffs must detect unsupported changes.
- No mandatory remote service, secrets, analytics or background dependency in customer kit.
- Use existing `zod` and `pnpm` scripts. Do not add package publishing, hosted registry or MCP as a prerequisite.

### Minimal command interface (proposed)

~~~bash
pnpm kit:validate
pnpm kit:validate --json
pnpm test:kit
pnpm build
~~~

`kit:validate --json`, if implemented, must return stable error ids/paths and an explicit schema version. Examples:
- `ERR_RECIPE_VERSION`
- `ERR_UNKNOWN_COMPONENT`
- `ERR_CONTENT_MISSING`
- `ERR_PALETTE_ROLE_CONTRAST`
- `ERR_UNSUPPORTED_VARIANT`

Avoid exact string coupling to error prose. Preserve existing Design DNA v1 error behavior unless a versioned migration is justified.

**G3 gate:** two independent brand/project customizations work without direct edits to internal kit components and pass clean consumer install/build/browser checks.

---

## 6. Phase P4: evaluation harness — smallest credible version

### Why this exists

Prove whether extra DNA is worth maintaining. Borrow minimal lessons from the **new** Astryx browser-based vibe eval, not its entire nightly scoring framework:
https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval

### Two separate comparisons

**Agent interface uplift** (same kit in all arms):
- **A** kit-only, normal instruction;
- **B** kit + concise skill;
- **C** kit + same skill + machine-readable Design DNA and validation.

**Product differentiation** (different products):
- **D** a credible free shadcn/Tailwind case-study starter for same realistic buyer job. Judge final visual/product value and total effort; do not present D as part of A/B/C's controlled causal experiment.

### Fixture and evaluation shape

~~~text
evaluation/agent-kit-01/
  arms/
    kit-only/
    kit-skill/
    kit-skill-dna/
    free-comparator/          # separate product comparison
  tasks/
    01-change-brand.task.json
    02-replace-projects.task.json
    03-add-case-study.task.json
    04-long-text-mobile.task.json
    05-accessibility-motion.task.json
    06-creative-variant.task.json
  probes/
    ...
  reference/
    ...                       # never visible to agent
  scripts/
    self-test.mjs
    run.mjs
    grade.mjs
    report.mjs
  receipts/
    ...                       # ignored/private
~~~

Use stable human-observable acceptance criteria with semantic roles rather than expected JSX, implementation class names or hidden answer components. Each task defines start fixture hash, prompt text, allowed changes, behavior probe, visual reference checks, known edge cases, measured costs and report paths.

### Harness self-test FIRST (no model cost)

- A correct reference must pass; empty/broken references must fail expected probes.
- Broken import fails `tsc` and `build`.
- No-op CTA fails behavioral probe.
- Offscreen/overflow fixture fails layout check.
- Low-contrast rendered functional text fixture fails role-aware contrast check.
- Validator must reject invalid recipe and never silently use last-good data in exported output.
- No secret/key/public-premium leakage.

If a negative control unexpectedly passes: **stop**. Do not grade real agents.

### Test isolation

- Unique temp/worktree directory for each fresh agent. Do not expose grader, reference, other arms or private repo files.
- No agent shared chat memory; record model ID/effort, instructions, session IDs, version hashes.
- Same task and tool permissions per arm; only experimental context differs.
- Budget guard before each run, hard per-run limits and total cap, explicit consent for paid expansion.
- Do not run unsafe third-party scripts with credentials. Prefer container isolation. Transcript audit is helpful but not a security sandbox.
- Redact private paths, hosts, tokens, customer data and system prompts from publicly shareable reports.
- Retain all failed attempts. No manual fixing after seeing which arm won without marking the run invalid.

### Scores

**Blocking:** install, typecheck, build, real action behavior, critical accessibility/console, source/license closure.

**Measured, non-blocking pilot:** repair edits/effort, agent wall time, token usage/cost, code changes, visual drift and screenshots at 390/1440, subjective blind quality judgment, initial INP/LCP where practical.

Use per-task pass rates; no exaggerated percentage gains from 1–2 successful tasks. If A/B/C differ only because one receives more task hints, disclose that design.

**Pilot**: 2 tasks × 3 arms × 1 run.  
**Extension**: 6 tasks × 3 arms × 2 runs = 36 agent runs.  
**Second model**: optional independent replication only with owner-approved budget.

**Hypothesis kill**: C is materially no better than B, or worse on qualitative outcome; deprecate complex DNA and keep simple skill + great kit.

---

## 7. Phase P5: real buyer pilot and packaging

### User study

Invite up to five relevant independent React developers/designers; do not use only agent enthusiasts or people who know the implementation. Provide real delivered package and short task, no guided fixes.

Record:
- download/unpack and install success;
- first successful content update;
- time to first usable brand-customized page;
- number/type of support interventions;
- reported real intended application;
- specific price/offer acceptance actions, not generic praise.

Document what they get: source tree, version, compatibility, rights, license, example assets, updates and refund/consumer-law terms.

### Release candidate packaging

1. Build the exact buyer ZIP/TGZ **in a private artifact path**, not under Next public assets or GitHub main.
2. Hash each distributed file and artifact; reconcile rights and README with actual contents.
3. Extract into clean environments and run install/typecheck/build/browser smoke with the *exact shipped archive*.
4. Validate no internal paths, secrets, tokens, owner-only license text or forbidden dependencies.
5. Record release checklist; human approval required for Gumroad attachment, price, public preview and production deployment.

**G4/G5 gates:** bounded agent uplift evaluation complete, buyer usability and concrete payment intent reviewed, all rights resolved, no deployment shortcuts.

---

## 8. Reproducible command matrix (planned; not executed here)

### Existing Nullworx checks

~~~bash
pnpm install --frozen-lockfile
pnpm verify
pnpm test:e2e
pnpm test:distribution
pnpm test:launch
~~~

Some current scripts require a provisioned server, protected media or deployed-site configuration. Read each script's assumptions; **record SKIP with reason** rather than claiming PASS, faking media/hash receipts or altering gates.

### New consumer checks

~~~bash
# inside a private fresh extraction of the eventual customer artifact
pnpm install --frozen-lockfile
pnpm kit:validate
pnpm typecheck
pnpm build
pnpm test:kit
~~~

Do not publish commands until corresponding scripts exist. These are acceptance targets.

### Browser probes (planned)

- 320/390/768/1440 viewport layout including long headings.
- keyboard-only navigation and actual click/focus interactions.
- content switch and slug page navigation.
- missing/slow image fallback.
- no-animation / reduced-motion / static state.
- browser console/page errors and memory/resource cleanup where feasible.
- generated snippet vs live preview parity for approved tokens/components.
- at least one real mobile device/touch check if gesture interactions exist in the shipping scope.

### Receipt schema sketch

~~~json
{
  "taskId": "03-add-case-study",
  "arm": "kit-skill-dna",
  "agent": { "model": "exact-id", "effort": "recorded" },
  "start": { "commit": "sha", "fixtureHash": "sha256" },
  "tests": { "install": "PASS", "build": "PASS", "browser": "FAIL" },
  "errors": ["semantic navigation probe failed"],
  "metrics": { "tokens": null, "costUsd": null, "manualFixMinutes": null },
  "artifacts": ["screenshot-390.png", "diff.patch", "console.txt"]
}
~~~

Use `UNKNOWN` or `null` for unavailable measurements; do not calculate fake precise percentages.

---

## 9. File-level impact plan and do-not-touch boundaries

| Files / module | Action | Risk |
| --- | --- | --- |
| `lib/design-dna/adapters.ts` | REPAIR existing mappings, preserve props | Visual drift |
| `lib/design-dna/snippets.ts` | REPAIR exported integration parity | Consumer API |
| `lib/design-dna/schema.ts` | MINIMAL clarify role checks, version carefully | Existing fixture compatibility |
| `lib/design-dna/registry.ts` | Keep existing three IDs; add only if real kit needs | API expansion |
| `tests/unit/design-dna.test.ts` | ADD real field mapping, negative controls | False test positives |
| `tests/e2e/design-dna.spec.ts` | ADD parity/browser assertions | Fragile snapshot |
| `tests/distribution/*` | ADD isolated consumer tests; preserve existing suites | Build time |
| New isolated product tree | CREATE only after approved local base and rights | Private-code leak |
| New minimal skill/kit validate | CREATE after visual gate | Prompt complexity |
| New eval harness | CREATE after independent install works | Unnecessary spend |
| `AGENTS.md` / `docs/PRODUCT_BASELINES.md` | Read-only for experiment; request additive changes separately | Accepted behavior |
| `app/page.tsx` / media / deployed routes | DO NOT TOUCH in this experiment | Production regression |
| Existing owner WIP and experiment branches | DO NOT RESET/CLEAN/OVERWRITE | Data loss |
| Production host, Gumroad, SEO/sitemap | DO NOT ALTER | Unauthorized launch |

Note: Some fix options for motion or color may require component source changes. If a component's product contract would change, stop and propose a small versioned alternative rather than expanding into unapproved refactors.

---

## 10. Iteration order, execution receipts, owner checkpoints

**Sprint 0 — Evidence + Rights** (STOP at rights failure)  
Deliver: baseline SHA/worktree list, known failing tests, rights/asset matrix, forbidden paths, exact experiments scope. No code.

**Sprint 1 — DNA Parity Repair**  
Deliver: small diff, tests for preset/layout/motion/color, clean independent generated snippets, receipts. If unsupported fields cannot be made truthful, reject them rather than silently accept.

**Sprint 2 — Owner Visual Proof**  
Deliver: two finished pages, visual review screenshots and runnable static/mobile prototype. No agent DSL work until visually accepted.

**Sprint 3 — Minimal Agent Layer**  
Deliver: content schema, recipe, skill, validator and two brand/project transformations. Keep default test path simple.

**Sprint 4 — Bounded A/B/C and comparator**  
Deliver: grader self-test, six-run pilot, then conditional 36-run extension only after an agreed budget. Record blind judge procedure and avoid claiming causal certainty.

**Sprint 5 — External Consumer/Buyer Review**  
Deliver: exact buyer ZIP fixture, independent user attempts, pricing/rights decision memo, suggested product verdict. No automatic publication.

Each sprint reports:
- **PLAN:** target and source commit;
- **CHANGESET:** exact paths, diff summary and what was deliberately untouched;
- **VERIFY:** commands that actually ran, test exit codes, screenshots, timings, limitations;
- **VERDICT:** PASS/FAIL/INCONCLUSIVE, next bounded action and rollback risk.

**Stop escalation rule:** If work grows beyond one isolated kit, a handful of recipe fields and small validator changes, stop for owner approval rather than creating foundational architecture.

---

## 11. Claude adversarial review instructions

The following linked prompt is a mandatory review of assumptions, buyer value, security, benchmark fairness, source rights and hidden implementation cost before any implementation authorization:

`docs/product/agent-native-kit-01/CLAUDE_RED_TEAM_PROMPT.md`

A Claude review must **not** mutate the repository. Ask for independently checkable objections, alternative designs and final BUILD NOW / SMALL EXPERIMENT / DEFER / KILL verdict. Do not interpret Claude's approval as a passed test or authorization to execute.

---

## 12. External technical references

- Astryx source and browser eval: https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval
- Astryx older harness fairness guide: https://github.com/meta/astryx/blob/main/internal/vibe-tests/README.md
- Astryx self-documenting CLI: https://github.com/meta/astryx/blob/main/packages/cli/README.md
- Anthropic frontend design instruction principles: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- shadcn registry docs: https://ui.shadcn.com/docs/registry
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Nullworx source: https://github.com/BikeshedStudios/nullworx

**Truth statement:** This is an implementation plan, not a record of built features or executed tests. The GitHub upload contains planning documents only.
