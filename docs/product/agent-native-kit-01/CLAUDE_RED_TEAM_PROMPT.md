# CLAUDE BROWSER — FINAL HOSTILE DESIGN / PRODUCT / ARCHITECTURE REVIEW

You are the **independent adversarial reviewer**, not the implementer and not a cheerleader. Review an early-stage premium product proposal for Nullworx (Bikeshed Studios): a visually exceptional, self-hostable **Agent-Native Cinematic Case Study Kit** (Next.js/React source, content/brand recipes, minimal agent skill, validator and independent consumer tests).

## Objective

Try to **kill the idea** on product economics, weak differentiation, actual customer jobs, agent effectiveness, maintenance cost, technical correctness, evaluation bias, legal/source rights, UI taste, mobile performance, and security. If it survives, propose the **smallest genuinely valuable build** and the proof that would falsify it.

This is the **last design review before the owner decides whether to implement**. Do NOT write code, submit PRs, create branches, push, merge, deploy, buy, access secrets, mutate production, or suggest actions as if executed. Your deliverable is a written verdict with concrete evidence and minimal corrective changes to the PRD/code plan.

## Required reading — open fully before concluding

Planning branch:
1. PRD:
https://github.com/BikeshedStudios/nullworx/blob/planning/agent-native-kit-01-redteam-20261115/docs/product/agent-native-kit-01/PRD.md
2. Implementation plan:
https://github.com/BikeshedStudios/nullworx/blob/planning/agent-native-kit-01-redteam-20261115/docs/product/agent-native-kit-01/IMPLEMENTATION_PLAN.md

Current public repo (read real code and current changes; do not trust proposal alone):
3. https://github.com/BikeshedStudios/nullworx/blob/main/AGENTS.md
4. https://github.com/BikeshedStudios/nullworx/blob/main/docs/PRODUCT_BASELINES.md
5. https://github.com/BikeshedStudios/nullworx/tree/main/lib/design-dna
6. https://github.com/BikeshedStudios/nullworx/blob/main/lib/design-dna/snippets.ts
7. https://github.com/BikeshedStudios/nullworx/blob/main/lib/design-dna/adapters.ts
8. https://github.com/BikeshedStudios/nullworx/blob/main/lib/design-dna/schema.ts
9. https://github.com/BikeshedStudios/nullworx/blob/main/tests/unit/design-dna.test.ts
10. https://github.com/BikeshedStudios/nullworx/blob/main/tests/e2e/design-dna.spec.ts
11. https://github.com/BikeshedStudios/nullworx/tree/main/components/bento-duo
12. https://github.com/BikeshedStudios/nullworx/blob/main/components/signature-hero/LICENSE.txt
13. Earlier roadmap / commercial hypothesis:
https://github.com/BikeshedStudios/nullworx/blob/docs/creative-roadmap-01/docs/ROADMAP.md

Independent comparators / originals:
14. Astryx browser-eval README, actual test code, fairness and limitations:
https://github.com/meta/astryx/tree/main/internal/vibe-tests/eval
https://github.com/meta/astryx/blob/main/internal/vibe-tests/README.md
15. Astryx CLI contract:
https://github.com/meta/astryx/blob/main/packages/cli/README.md
16. Anthropic frontend-design skill:
https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
17. shadcn registry ecosystem:
https://ui.shadcn.com/docs/registry
18. WCAG:
https://www.w3.org/TR/WCAG22/

If a source is unavailable, mark UNVERIFIED and do not pretend you read it. No ungrounded source/benchmark claims.

## Non-negotiable reality checks

- Existing Bento Duo TSX/CSS is exposed in public repo with MIT notices. Challenge any premium-exclusivity narrative.
- Signature Hero owner-review candidate has unresolved rights, including inherited code. Challenge legal/source boundary, and whether a truly good kit can ship while excluding it.
- Existing Design DNA has small registry (three component ids). Investigate `preset="cobalt"` in generated snippets vs selected preset in live adapter, exported maxWidth wrapper, motion fields in Orbit/Foil recipes, and whether color contrast rules match rendered semantic roles. Do not assume code defects are fixed.
- Current remote `main` is NOT necessarily latest owner-approved local integration baseline. The owner has multiple branches/worktrees and protected production releases. A web review cannot verify local dirt.
- No current evidence of meaningful paid demand; Bento sales/view observations are low-sample. Don't extrapolate buyer conversion.
- Tests not actually executed in this proposal. Third-party vendor benchmark results are self-reported and must be interpreted with caution.
- Do not recommend generic Figma replacement, MCP, CMS, new shader framework or ten templates without an independent quantified reason.

## Review procedure: 5 hostile iterations + ten-stack challenge

Perform FIVE revision rounds. In each, state which version you attacked, the fatal objection, evidence needed to settle it, what to remove/rewrite, and whether the revised version survives.

Use these ten lenses explicitly (condensed where overlapping):
1. Socratic: what is the exact customer job and why would they pay?
2. Hegelian: conflict between visually opinionated designs and broad agent freedom.
3. Popperian: specific falsifiers and kill criteria.
4. Causal inference: A/B/C fairness, hidden prompt context, baselines and confounders.
5. Systems architecture: dependencies, interfaces, local-first portability and upgrade burden.
6. Cybernetics: feedback loops and ability of tests/agents to self-correct errors.
7. Bayesian calibration: distinguish prior beliefs, observation, interpretation and hypotheses.
8. Information theory/MDL: minimal contract vs excessive schema/instruction complexity.
9. Design of Experiments: blind testing, prompt batteries, negative controls and sample size.
10. Adversarial testing: source rights, security bypass, privacy, broken media, extreme text, accessiblity, motion, low-end phones, agent hallucinations.

## Particular adversarial questions

**Product**
- Is a cinematic case-study site the highest-return first vertical, versus an interactive product-launch site or plain premium template?
- Do buyers actually pay for agent-safe customization, or only for visuals? Is "agent-native" an appealing user-facing phrase or internal implementation jargon?
- What does this provide that a paid Framer template, Astro starter, free Tailark/shadcn or good Claude prompt cannot?
- Could free MIT components and a thin agent skill satisfy 80% of the value? If yes, kill the larger layer.
- Is five-user testing adequate to decide a business? What concrete payments/commitments would change your view?

**Design**
- Does the design remain distinct without shaders? Are Material Editorial, cream backgrounds, single italic word and metadata labels becoming generic AI design clichés?
- How do we measure visual identity without optimizing to an arbitrary model judge? How do we treat owner approval as a taste gate without overfitting?
- Are copied design heuristics safe to use commercially? Separate inspiration from copying published text/images.

**Engineering**
- Does the PRD overspecify hard constraints not mechanically enforceable?
- Are snippet parity and schema truthfulness preconditions or distractions from a real product?
- Are full page recipes actually necessary, or is typed content + CSS tokens + a short skill enough?
- Should v1 be Next.js, Vite, or Astro? Provide concrete trade-offs and costs instead of generic preferences.
- Is the proposed CLI/JSON error surface premature? Where can the existing Zod/Playwright tools be reused?
- What is the smallest real demo that settles the risk in days of work rather than a new framework?

**Evaluation**
- Are tasks chosen to favor Nullworx? Are the three agent arms truly comparable? Does C win solely due to extra information or more constraints?
- Will negative controls detect both functional and aesthetic regressions?
- Can tests run without leaking grader answers or accessing owner worktrees?
- Which claimed thresholds are arbitrary? What metrics do we truly need? What sample size supports each conclusion?
- How do we avoid letting testing infrastructure cost more than the product?

**Legal/distribution**
- Does the entire customer ZIP have a file-by-file redistribution basis?
- Can premium source be kept private while public demo renders real components?
- Is the proposed licensing boundary truthful and compatible with existing MIT grants?
- Are support/update terms and consumer digital sales obligations addressed at an appropriate stage?

## Required final output (strict structure)

### A. Verdict first
One of: **BUILD NOW / SMALL EXPERIMENT / DEFER / KILL**, with confidence (low/medium/high) and why. State which hypothesis must be proven first.

### B. Top 10 failure modes
A table: rank, category, severity, concrete evidence/link, cheapest falsification experiment, and owner action. Separate VERIFIED / INFERRED / UNKNOWN.

### C. Five red-team rounds
R0→R4, strongest objection, cut/fix, surviving architecture. Do not accept unchanged plan just because author wanted it.

### D. Three competing minimal architectures
1. Complete visual kit + plain AGENTS.md (no Design DNA)
2. Complete kit + concise skill + existing Zod/Design DNA
3. Alternative worth considering (e.g. static-export-first or launch-page vertical)

For each: shipping scope, true complexity, distribution risks, agent usability, likely support burden, and disconfirming test. Pick one with a causal reason.

### E. Minimal changes to the two documents
Provide exact proposed changes using section headings or line-specific references. Clearly flag MUST FIX BEFORE CODE, SHOULD FIX LATER, REMOVE ENTIRELY. Avoid writing a replacement 50-page plan.

### F. First bounded implementation experiment
Define inputs, allowed files, commands, expected receipts, agent instructions, tests, owner visual gate, max cost/timebox *as a suggested cap*, abort signals and rollback. Distinguish tasks achievable with only repository access from local-worktree-only verification.

### G. Claim audit
For every high-impact claim: VERIFIED / INFERRED / UNKNOWN, precise source URL, and what would change the claim. List vendor-benchmark methodological caveats.

### H. Final decision question for owner
At most **three** meaningful decisions that could change the build, not twenty vague questions.

## Style and integrity

Be direct, skeptical and concrete. Prefer a smaller reversible experiment over another framework. Use actual source code and primary documentation. Identify where my plan is internally contradictory. Label what was read, what was inferred and what was not executed. Don't fabricate repository status or validation. Conclude with an adversarially defensible handoff, not encouragement.

**IMPORTANT:** This is a REVIEW ONLY. Do NOT modify anything in GitHub or launch a build/deployment. Return findings to the user. The owner decides next.
