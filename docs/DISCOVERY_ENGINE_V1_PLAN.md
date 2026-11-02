# Nullworx Discovery & Distribution Engine V1 — Comprehensive Engineering Plan

**Status:** PROPOSED / OWNER REVIEW. This is a planning artifact, **not** an implementation approval.
**Date:** 2026-11-02
**Repository:** BikeshedStudios/nullworx
**Authority:** Public main inspected on 2026-11-02; active local Wave A/B work and other unpushed WIP **not inspected**. This document does not override owner-approved effect, visual, or media decisions.
**Execution doctrine:** PLAN → CHANGESET → VERIFY → HOSTILE REVIEW → VERDICT.
**Mutation policy:** No merge, deployment, repository-visibility change, analytics activation, subscriber collection, paid checkout, or autonomous publishing without separate authorization.

## 0. Executive decision

Build an **evidence-driven distribution pipeline inside the existing Next.js application**, not a general-purpose SEO SaaS or a Rankad.ai clone.

The pipeline must turn **one owner-approved, demonstrably working effect** into:
1. a truthful, crawlable, useful public effect page;
2. correct metadata, canonical, sitemap eligibility, optional grounded JSON-LD and rights-cleared preview media;
3. verified installation instructions and, when appropriate, a shadcn-compatible GitHub registry item;
4. reviewable release notes and social/community distribution drafts;
5. reproducible technical SEO, performance, accessibility, installation, and AI-discovery evidence.

**Differentiator:** a generic SEO auditor can read a page; Nullworx can validate its content against the actual component, dependency closure, demo, rights ledger, browser behavior and public installation recipe.

**Non-goal:** promising first-page rankings, controlling model answers, manufacturing keyword pages, buying GitHub stars, or auto-spamming communities.

**Working decision:** BUILD NOW for baseline + metadata/release core; SMALL EXPERIMENT for shadcn distribution and AI-search eval; DEFER Shopify App Store and Stripe Apps; KILL mass-produced SEO content.

## 1. Success criteria and falsifiable hypotheses

### North-star outcome

**Verified external reuse:** a developer outside the project can discover a relevant effect, install it in a clean application, reproduce the documented demo within stated constraints, and voluntarily link or contribute back.

Track **separately**, never combine into a synthetic "SEO score":

| Layer | Measurement | Evidence | Anti-gaming note |
| --- | --- | --- | --- |
| Technical quality | eligible indexable URLs with correct HTTP/metadata | built HTML, curl, Playwright, Lighthouse | CI pass is not organic ranking |
| Search discovery | impressions, queries, clicks, page indexing | Search Console, Bing Webmaster Tools | branded and non-branded split |
| AI-search discovery | mentions, grounded citations, qualified recommendations | saved search-enabled answers, provider/mode/date | no self-referential prompts |
| Developer adoption | clean installs, repeat visits, independently confirmed usage | smoke fixtures, opt-in analytics, public references | stars ≠ installations |
| Business | newsletter confirmed opt-ins, support clicks, actual purchases | provider receipts, consent evidence | no fabricated conversion data |

Proposed **experiment decision thresholds**, not forecasts:
- First public launch: every approved indexable page passes mandatory technical gates; **0 critical rights/security/metadata failures**.
- First 30 days: seek **5 independently verified uses**, **25 confirmed opt-ins**, and first actual paid contribution. Ambitious goals, not a requirement to claim a product is successful.
- The GitHub-star target (e.g. 100 in 30 days) is secondary and must never justify fake activity or degrading developer experience.
- 60–90 days: compare non-branded search signals, qualified installs and AI-search mentions against a frozen baseline; report uncertainty and sample sizes.

Hypotheses to falsify:
- "ASCII attracts intent-qualified React/creative-coding users." Falsifier: impressions but no meaningful installations or engagement after sufficient exposure.
- "Pointillism/stippling is a distinguishable niche." Falsifier: little verified demand or users cannot find an application for it.
- "Our discovery changes increase grounded recommendations." Falsifier: no repeatable change on an independent, frozen query set relative to controls.
- "The registry reduces installation friction." Falsifier: clean installs fail, are slower than copying code, or require undocumented repair.
- "Newsletter and optional purchase CTAs do not harm the showcase." Falsifier: material negative change in usage or user complaints.

## 2. Verified baseline: public main, not a production audit

Inspected repository code:
- Next.js App Router, React 19, TypeScript, Zod, Playwright, Vitest, FFmpeg/media provisioning tooling.
- "lib/effect-registry.ts" aggregates "lib/forge-studies.ts" and "lib/material-studies.ts".
- "app/effects/[slug]/page.tsx" has "generateStaticParams" and basic "generateMetadata" (name + description only).
- "app/effects/page.tsx" currently has "robots: { index: false, follow: false }". Do **not** remove until the catalog and release rights are approved.
- "app/layout.tsx", "lib/site.ts" and footer still contain UI Forge-era names/metadata.
- "lib/site.ts" has "DEFAULT_SITE_ORIGIN = https://nulllworx.site". **Domain spelling, ownership, live DNS, redirect and canonical authority are unverified.** Do not normalize to another domain by assumption.
- No "app/sitemap.ts", "app/robots.ts", "public/sitemap.xml", or "public/robots.txt" found at inspected paths on main; still verify actual HTTP behavior before claiming absence in production.
- "scripts/validate-effects.ts" asserts the exact registered count of eight; future additions require updating registry validations without hard-coded brittle assumptions.
- "app/privacy/page.tsx" says no accounts, newsletter, checkout or analytics; changing this requires real provider setup and privacy copy review.
- Buy Me a Coffee support URL validation already exists in "lib/site.ts"; reuse, do not duplicate.
- Public README is titled "UI Forge"; package.json is "private: true"; MIT code LICENSE identifies CipherCuttle. An OSS repo is not the same as a published npm package, and historical copyright must not be rewritten blindly.
- Some media requires manual provisioning and source-specific rights checks; Digital Wake is experimental/beta and must not be represented as production-safe.
- Owner-approved Wave A/B WIP may be ahead of public main. Inspect local worktree before edits and preserve it, including non-accepted experiments and rejected/parked effects.

**Sprint 0 must inspect:** local branch HEAD, git status, untracked/ignored relevant files, exact deployment origin and live HTTP, rights ledger, effect status/approval ledger, preview assets, current CI. No claim of live website performance is supported by the GitHub file snapshot alone.

## 3. Design principles and trust boundaries

1. **One authority for implementation facts:** existing effect registry and source tree. Add discovery metadata as a validated sidecar, not copies of function signatures or code.
2. **Publish eligibility is explicit and fail-closed.** Preview/beta/demo-ready is not automatically indexable, reusable, rights-cleared, or commercially licensed.
3. **Separate code facts, editorial decisions, and observed data.** LLMs may propose descriptions; owner reviews claims and intent; external observations remain raw immutable artifacts.
4. **Render helpful server-side text.** All indexable pages must explain use cases, installation, constraints and fallbacks in readable HTML, even when Canvas/WebGL is unavailable.
5. **No keyword-stuffed clones.** One canonical page per unique search intent; topic pages only when materially unique. No "doorway" pages for unbuilt Shopify/Stripe integrations.
6. **No Cloudflare dependency.** Reuse existing Hetzner where capacity/permissions allow; static files and browser-side rendering; external CDN only if measurements justify it.
7. **Bounded evaluation and spending.** No unbounded crawling, scraping proxies, automatic paid API loops or invisible publishing. Rate limits and hard run budgets.
8. **No modification to accepted visual art/effect runtime merely to improve SEO audits.** Performance optimizations need isolated visual re-review.

### Release-state model

Treat these as separate axes:
- **component maturity:** experimental / preview / approved;
- **rights:** unverified / cleared (with evidence);
- **installation:** untested / passed (with fixture evidence);
- **indexing:** noindex / approved for index;
- **distribution:** draft / reviewed / published.

A boolean "approved" without provenance is insufficient. Owner authorization and rights/installation receipts should be referenced by stable file paths or IDs, checked for existence and consistency. Missing or contradictory evidence means NOINDEX / NO_RELEASE.

## 4. Search-intent taxonomy, not a keyword farm

### Pillar A — ASCII, highest priority

Candidate queries to verify using actual SERP/Search Console data (not assumed search volumes):
- react ascii effect
- ascii video renderer
- video to ascii art
- webgl ascii shader
- colored ascii video
- real-time ascii video
- ascii animation react
- ascii background animation
- ascii typography shader

**Primary product page:** the actual approved ASCII renderer, currently "/effects/ascii-waves" unless slug changes are explicitly approved.

Potential deep guides **only when supported by experiments**:
- how color-preserving video-to-ASCII works;
- WebGL2 density, glyph selection, contrast, palette and accessibility;
- local browser video input, media rights, fallbacks and performance.

Do not claim support for MP4 export, arbitrary browser codecs, SSR video processing, GPU optimization or Shopify until independently verified.

### Pillar B — pointillism / stippling / digital noise

Disambiguate rather than treat as synonyms:
- **pointillism:** tone/color built from points;
- **stippling:** dot-density tone representation;
- **halftone:** patterned printing-style dot approximation;
- **dithering:** quantization approximation using distributed errors/noise;
- **blue-noise:** distribution characteristics, not a generic aesthetic label;
- **particle trails / flow fields:** motion or force-field driven particles, not inherently pointillism.

Candidate intent queries: react pointillism effect, video stippling shader, WebGL halftone effect, generative dot art, particle trails react, dithering video effect. An actual approved effect with documented behavior is a prerequisite for dedicated indexed claims. Digital Wake's pointillism/hybrid beta view is **not** proof of a standalone finished pointillism product.

### Pillar C — integration and comparisons

- React + TypeScript + Next.js and Vite installation examples can be indexed **after clean-fixture tests**.
- shadcn-compatible registry pages can be indexed after the relevant item installs from a public ref.
- "React Bits alternatives" comparisons require factual, dated, fair feature comparisons and original demonstrations; no unsupported superlatives.
- Shopify theme extension: one bounded experiment only, **not** a prewritten claim of one-click support.
- Stripe Apps: deferred; payments dashboard integration is not a sensible default distribution surface for visual effects.

### Content map and anti-cannibalization rules

Maintain a table of URL → unique user intent → primary query → owner-approved copy → canonical → evidence link. Reject any proposed new URL if existing content already satisfies the same intent. Update the existing page instead of duplicating it. The content program should be curated, not auto-published from a keyword list.

## 5. Target repository architecture (minimal safe diffs)

Suggested additions, subject to Sprint 0 conflict/WIP inspection:

~~~text
lib/
  discovery/
    schema.ts              # Zod discovery sidecar contract
    manifest.ts            # Reviewed copy & intent mapped to existing slugs
    eligibility.ts         # Fail-closed indexing/rights/approval gate
    metadata.ts            # Stable per-page metadata/canonical/OG
    structured-data.ts     # Escaped, truth-matching JSON-LD where justified
app/
  sitemap.ts               # Only owner-approved indexable URLs
  robots.ts                # Crawl policy, sitemap URL, no pseudo-security
  effects/
    page.tsx               # Remove noindex only after release gate
    [slug]/page.tsx        # Integrate manifest-driven metadata + semantic content
components/
  discovery/
    effect-documentation.tsx  # HTML FAQ/usage/limits; no fake FAQ markup
scripts/
  discovery/
    audit.ts
    validate.ts
    render-assets.ts       # Reuse existing media/FFmpeg pipeline
tests/
  discovery/
    eligibility.test.ts
    metadata.test.ts
    structured-data.test.ts
    crawl.spec.ts
    install.spec.ts
.github/workflows/
  discovery-check.yml
registry.json              # Only after first clean shadcn proof
reports/discovery/         # Local generated evidence, no private data in public repo
docs/
  DISCOVERY_ENGINE_V1_PLAN.md  # This document
~~~

Keep existing "EFFECTS", "FORGE_STUDIES" and "MATERIAL_STUDIES" authoritative for component metadata and source locations. Do **not** rewrite effect renderers, replace the white/offwhite approved UI, or integrate rejected/parked effects.

### Discovery manifest contract (illustrative, not implemented)

~~~ts
import { z } from "zod";

export const DiscoveryManifestSchema = z.object({
  slug: z.string().min(1),
  search: z.object({
    primaryIntent: z.enum(["learn", "build", "integrate", "compare"]),
    primaryQuery: z.string().min(2),
    relatedQueries: z.array(z.string()).max(8),
    title: z.string().min(10),
    description: z.string().min(40),
    canonicalPath: z.string().startsWith("/")
  }),
  proof: z.object({
    ownerApprovalRef: z.string().nullable(),
    rightsEvidenceRef: z.string().nullable(),
    installEvidenceRef: z.string().nullable(),
    mediaEvidenceRef: z.string().nullable()
  }),
  publish: z.object({
    indexStatus: z.enum(["draft", "approved"]),
    distributionStatus: z.enum(["draft", "reviewed", "published"])
  })
});
~~~

Add validation beyond shape: slug must resolve to a real effect, canonicalPath must be unique and on the authorized host, source references must exist, rights must apply to each asset, and every public claim must have a corresponding feature/test/docs source. Never derive the URL origin from an unverified string.

### App Router SEO requirements

- Native Next.js Metadata API: stable title/description, metadataBase, alternates.canonical, Open Graph, Twitter card when there is a rights-cleared image.
- app/sitemap.ts: owner-approved public URLs only; lastModified from a **real content timestamp**, never current build time on every build. Avoid meaningless changefreq/priority manipulation.
- app/robots.ts: match actual crawler strategy; robots disallow does not ensure deindexation. Keep private endpoints access-controlled; noindex accessible draft pages when necessary; use appropriate HTTP status for missing routes.
- Any user-agent-specific policy for OAI-SearchBot versus GPTBot must be a conscious project policy; search indexing and model training are not the same.
- JSON-LD: use schema-dts when it adds safety; WebSite/Organization/SoftwareSourceCode/VideoObject only if meaningfully truthful. No fake review stars, ratings, installation counts or offers. Schema markup does not guarantee rich results.
- Escaped/serialized JSON-LD must not create script injection. Match visible HTML.
- HTML heading hierarchy, meaningful alt text, reduced-motion, client fallback, and sensible lazy-loading.
- Canonical tests cover slash, query parameters, www/non-www, redirects and chosen host.
- Critical pages must have usable server-rendered description, not require shader boot to reveal all content.
- If public publishing is not approved, retain noindex; do not flip indexing from local build success.

## 6. High-leverage OSS dependencies and rejection policy

| Choice | Source | Why | Phase |
| --- | --- | --- | --- |
| Next.js native metadata/sitemap/robots | https://nextjs.org/docs/app/api-reference/file-conventions/metadata | Framework-supported; avoid duplicate SEO frameworks | Sprint 1 |
| Zod (already installed) | https://github.com/colinhacks/zod | Validate manifest and release gates | Sprint 1 |
| schema-dts | https://github.com/google/schema-dts | Typed JSON-LD when used | Sprint 1, optional if justified |
| Lighthouse CI | https://github.com/GoogleChrome/lighthouse-ci | Regressions, not rank prediction | Sprint 3 |
| Lychee | https://github.com/lycheeverse/lychee | Markdown/docs link integrity | Sprint 3 |
| Unlighthouse | https://github.com/harlan-zw/unlighthouse | Site-wide baseline and sampled audits | Sprint 0/3 (CLI) |
| shadcn registry | https://ui.shadcn.com/docs/registry/github | Direct GitHub-distributed component install | Sprint 2 |
| web-vitals | https://github.com/GoogleChrome/web-vitals | Optional production field metrics | Post-launch |
| Promptfoo | https://github.com/promptfoo/promptfoo | Versioned small LLM eval suite | Sprint 4 experiment |
| Google Search Console | https://search.google.com/search-console | Primary real search data | Post-launch |
| Bing Webmaster Tools | https://www.bing.com/webmasters | Primary Bing discovery/citation data | Post-launch |
| IndexNow | https://www.indexnow.org/documentation | Notify participating engines of changed URLs | Post-launch only |
| listmonk | https://github.com/knadh/listmonk | Self-host newsletter option, requires real email ops | DEFER |
| Umami | https://github.com/umami-software/umami | Optional analytics, adds DB/ops | DEFER |

Explicitly **reject for V1**:
- multiple overlapping Next.js SEO metadata libraries (e.g. next-seo + next-sitemap) without demonstrated missing capabilities;
- a separate always-running AI SEO agent, large crawling database, generic Rankad clone, SERP proxy/scraping fleet;
- llms.txt as a ranking strategy (optional convenience document only, not a Search requirement);
- paid keyword-volume claims without traceable data source and observation time;
- mass-generated locale/keyword pages, automatically submitted community posts, bought stars or link schemes;
- server-side user-video inference/transcoding at request time.

Dependency policy: introduce packages only in the sprint that uses them; pin/lock versions and licenses; compare maintenance status, transitive weight and security; favor command-line audits over persistent services; avoid adding runtime dependencies for offline CI tasks.

## 7. shadcn-compatible GitHub registry as first distribution proof

Official capability: a public GitHub repo containing root "registry.json" can be used as a shadcn registry without hosting generated JSON yourself (see official GitHub registry guide).

Start with **Magnetic Focus**, not ASCII/video or complex material effects.
- Trace full source closure (TSX, CSS module, hooks, relevant utilities).
- Respect client boundaries, accessibility/reduced-motion, CSS modules and framework differences.
- Define correct registry schema paths, dependencies and license notice; no private/proprietary or uncleared assets.
- Freeze an actual commit/tag for reproducibility where supported; do not treat mutable main as immutable production source.
- Test clean Next.js and Vite integrations independently. Document unsupported paths.

Proposed command to test **only after registry is implemented**:

~~~sh
pnpm dlx shadcn@latest add BikeshedStudios/nullworx/magnetic-focus
~~~

PASS only if the command works unattended in a clean fixture and the installed component builds/renders with the documented interaction. If the direct GitHub registry requires changes beyond agreed scope, stop and report rather than patching in an unrelated framework migration.

ASCII comes later, after a working public-media-free setup, WebGL fallback and an honest dependency/asset contract.

## 8. Video, hosting and performance

**Infrastructure rule:** no Cloudflare. Prefer existing Hetzner VM if safe to share, statically served site/docs/video, local FFmpeg-generated posters and optimized MP4/WebM, browser-side GPU/Canvas effect rendering. No GPU server required for browser-side effects.

Media production:
- offline conversion of rights-cleared clips; hash and log source, ownership/license, output recipe, quality and duration;
- small thumbnails, explicit video preload policy, lazy load below-fold media, one active heavy WebGL preview on mobile;
- local user-selected videos stay browser-local and are not uploaded without an explicit product change;
- no automatic import of licensed fish loops or experimental masks into the public package;
- videos may be loaded from existing origin initially, separate CDN later if cache/traffic tests justify it;
- CDN integration should be configurable by media origin, with rollback to poster-only mode when data transfer becomes anomalous.

Cost control:
- capture transferred bytes and cache ratio; use estimates, not fake precise bills;
- configure actual provider caps/alerts where available; alerts are **not** necessarily hard caps;
- disable video autoplay or substitute thumbnails under a documented degraded mode;
- perform a separate capacity review before any new paid service or server-side transcoding endpoint.

Performance gates: mobile CPU/GPU and memory; usable non-WebGL fallback; no crashes on unsupported WebGL2; protect LCP, INP, CLS; no automatic "fix" that lowers effect quality without owner review. Core Web Vitals recommended field thresholds: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 at p75 when enough real-user data exists.

## 9. Organic and community distribution workflow

Each owner-approved effect should generate a **review bundle**, not publish automatically:
- 1 accurate canonical effect page; concise install example and limits;
- 1 public-safe poster and short demo clip (media ledger validated);
- 1 README/release/changelog draft;
- 1 short technical explanation; optional original "how it works" guide if distinct;
- 2–3 platform-adjusted posts for X/Reddit/dev communities; respect their rules and avoid duplication/spam;
- an optional human-reviewed submission to relevant curated lists; no mass PRs.

Distribution doctrine: show *real preview → working source → minimal install → credible proof*. Star CTA is subtle and voluntary; measure qualified installs and external uses separately. Do not distribute user-provided private clips, WIP screenshots, or restricted material.

GitHub public-profile cleanup is a **different owner-review operation**: audit each repo's visibility, externally linked docs, GitHub Actions/releases and dependent automations before any public-to-private changes. Do not bulk privatize to promote Nullworx; it may break existing projects and release monitors.

## 10. Monetization / opt-in funnel (feature-gated)

Proposed user experience: free visible demo + free source; subtle, non-blocking CTA after useful content; footer sponsor link; single optional email subscription form; separate creator-pack offer. No popups that interrupt playground or block code copy.

- **Email:** choose a provider only after price/privacy review (e.g. Brevo/Buttondown); confirmed double opt-in, unsubscribe, clear consent purpose, minimal personal data, no marketing cookies by default. Update Privacy and consent evidence before enabling collection.
- **Buy Me a Coffee:** reuse existing validated NEXT_PUBLIC_SUPPORT_URL path; verify final destination and mobile flow.
- **Gumroad:** optional pay-what-you-want ZIP, only when rights/licensing and actual value-added content are ready. Free MIT code cannot be falsely represented as exclusive paid IP. Explain what buyers receive and fees/taxes separately.
- **Premium pack:** avoid locking away the only usable demo/source. Distinguish presets, licensed assets, documentation, convenience or advanced implementation. No perpetual-update promise unless support budget supports it.
- **Shopify:** small single-effect Theme App Extension proof first, with asset size/mobile performance guard and real store test. App Store/listing only after demonstrated use.
- **Stripe Apps:** defer; do not confuse payment processing with web-effect distribution.

Never change Privacy text to claim a running newsletter, checkout or analytics before those systems exist; when enabled, document processor, retention, consent and deletion/unsubscribe mechanism.

## 11. AI-search / GEO evidence experiment

**Objective:** test whether search-enabled AI systems can find and correctly recommend Nullworx for relevant *unbranded* queries. Not to "train" models to always say Nullworx.

Initial corpus (freeze before tuning): 40–60 queries across ASCII, pointillism/stippling, generic React effects, clean install, comparisons and negative controls. Avoid inserting "Nullworx" into the questions. Split into development, control and held-out sets with overlap checks.

Record for **each run**:
- query ID, intent, sample group, date and timezone;
- provider/model/version where exposed, retrieval/search enabled state, locale/context;
- raw response or provider-permitted capture, linked citations, URL and cited snippet;
- whether Nullworx was mentioned, recommended appropriately, linked to the correct page, and described accurately;
- costs, tokens, time and tool errors; uncertainty where mode/model internals are opaque.

Metrics reported independently: mention rate, **qualified** recommendation rate, grounded citation rate, wrong-feature/hallucination rate and confidence intervals/sample sizes where meaningful. Some providers are stochastic; repeated runs and controls are needed. Never treat a plain offline LLM response as live search measurement.

Budget: one bounded pilot, a small predetermined number of queries/repetitions, explicit maximum spend; stop if no reliable search-enabled provider, links or comparable baseline. Use Promptfoo only if it reduces engineering versus a tiny JSONL harness. Prefer Search Console and Bing primary data for actual search discovery.

Do not claim "better than Rankad.ai" without a same-period, comparable, independent benchmark. Stronger internal CI or better first-party evidence does not by itself equal higher SERP placement.

## 12. Sprint plan with exact gates

### Sprint 0 — Baseline and rights/domain preflight (READ-ONLY)

**PLAN:** Inspect local WIP and release authority. No changes.
**Evidence:** branch/commit/status; build/HTTP URL matrix for homepage, /effects, selected effect pages, sitemap/robots/404; metadata screenshots/curl; source and asset rights; approved SEO host; the official domain; current CI.
**Deliverables:** reports/discovery/BASELINE.md, URL_MATRIX.json, RIGHTS_AND_ORIGIN_GAPS.md, initial risk register, baseline Lighthouse/Unlighthouse snapshots (where executable).
**Gate:** source authority and URL canonical domain confirmed by owner; all unknowns labeled. If prod host inaccessible, mark UNVERIFIED, never assume PASS.
**Verdict:** APPROVED_TO_IMPLEMENT or BLOCKED (specific reasons).

### Sprint 1 — Deterministic SEO core (SMALL DIFF)

**CHANGESET:** Discovery sidecar and Zod validation; reuse registry slug; native per-page metadata; canonical builder; sitemap/robots only once domain/indexing authority confirmed; optional safe JSON-LD; index eligibility gate; server-readable effect documentation. Preserve existing noindex until approved.
**VERIFY:** unit, build, HTTP/crawler, basic structured-data, source/rights truth checks, existing pnpm verify and Playwright suite.
**Hostile review:** every newly indexable URL manually inspected for claims, rights and canonical; check draft routes and not-found behavior.
**Gate:** no accidentally indexed WIP/private content, no contradictory metadata, no broken effects, no surprises to the existing app.
**Rollback:** revert only discovery changes; registry and effect implementations untouched.

### Sprint 2 — Installable distribution (ONE COMPONENT)

**CHANGESET:** shadcn GitHub registry descriptor for Magnetic Focus, pinned compatible source paths, installation docs, clean Next/Vite fixture tests. No npm publish until product and rights readiness.
**VERIFY:** clean clone, CLI installation, TS build, actual preview, keyboard/touch and reduced-motion in both fixtures.
**Hostile review:** license attribution, full import closure, bundling/perf, stability of GitHub version used.
**Gate:** reproducible source-install receipt. Failure means DEFER wider registry rollout.
**Rollback:** remove registry item/metadata, preserve functioning app.

### Sprint 3 — Audit automation and distribution bundles

**CHANGESET:** add LHCI + Lychee under CI, Unlighthouse for bounded pre-release audit, deterministic rights-cleared FFmpeg preview outputs, OG assets, release notes and human-review post drafts.
**VERIFY:** inject bad canonical / missing evidence / broken link / excessive asset in fixtures and require expected failure. Check actual media decoding and mobile performance. Inspect generated social claims.
**Gate:** no critical regressions, zero unsupported publication claims, no automatic push/post, bounded CI runtime.
**Rollback:** disable new workflow/generator without touching published content.

### Sprint 4 — External evidence and funnels (AFTER PUBLIC APPROVAL)

**CHANGESET:** configure Search Console/Bing Webmaster properties as authorized, initial AI query eval, reporting snapshots, optional IndexNow for actual changed URLs, low-friction opt-in and support/pay-what-you-want CTA only when configured and legally reviewed.
**VERIFY:** real data provenance, private credential storage, consent/unsubscribe, no fake submissions/metrics, cost ceiling, external CTA destination.
**Gate:** benchmark has a repeatable baseline and useful decision value; conversion funnel is usable and privacy copy accurate.
**Rollback:** disable telemetry/form/provider, retain compliant consent records if required, keep free effects public.

**Bounded completion:** DEFINE → IMPLEMENT → TEST → ONE hostile review → fix Critical/High → ONE re-review → CLOSE. Don't turn this into endless verification.

## 13. Suggested commands and acceptance fixtures

Run only in a deliberate local checkout after branch and WIP preflight:

~~~sh
git status --short
git rev-parse HEAD
git branch --show-current
pnpm install --frozen-lockfile
pnpm verify
pnpm test:e2e
pnpm build
~~~

Then inspect actual HTTP from a locally started production build (do not equate JS DOM snapshots with crawler-visible HTML):

~~~sh
pnpm start --port 3350
# Separate terminal:
curl -sS -I http://127.0.0.1:3350/effects
curl -sS http://127.0.0.1:3350/effects/ascii-waves
curl -sS -I http://127.0.0.1:3350/robots.txt
curl -sS -I http://127.0.0.1:3350/sitemap.xml
~~~

Expected outcomes are conditional on release gate: in Sprint 0, noindex and absent sitemap can be correctly *observed*, not interpreted as implementation failures. In Sprint 1 after approval, assert stable canonical origin, correct sitemap inclusion, public HTML content and explicit exclusion of experimental assets.

Add a fixture test to prove that changing a manifest entry does **not** alter effect runtime; inject manifest invalid/duplicate slug and missing rights proofs to assert fail-closed behavior.

## 14. Hostile review / 10-stack decision register

1. **Socratic:** target real developer adoption, not raw traffic. Ask who searches and why.
2. **Hegelian:** automate mechanical metadata, keep editorial/rights approvals human.
3. **Popper:** predefine ways search, AI-discovery, registry and funnel ideas can fail.
4. **Causal inference:** compare against frozen baselines and controls; do not attribute a mention jump to one SEO edit without evidence.
5. **Systems architecture:** registry/source → proof → indexed docs → distribution → installation → external feedback.
6. **Cybernetics:** observe quality, search, AI citation and adoption separately; no uncontrolled autopublisher loop.
7. **Bayesian calibration:** high confidence technical gates can work; unknown confidence in external ranking superiority.
8. **MDL/information theory:** prefer one metadata sidecar and three outputs, not a second SaaS.
9. **Design of experiments:** freeze query sets and isolate changes, include negative controls.
10. **Adversarial:** challenge rights leaks, keyword cannibalization, hidden WIP indexing, bot-only pages, AI eval gaming, fake stars, broken mobile fallback, uncontrolled bills.

**Kill criteria:** cancel large-scale SEO content if it cannot prove unique intent/use; stop any feature claiming an unimplemented integration; stop expensive GEO eval without reliable provider and citations; stop Shopify build if app-block performance fails; stop paid-pack marketing if ZIP adds no actual value; do not promote the system if external adopters cannot install the effects.

## 15. Risk register, ownership and gates

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Public live domain / canonical wrong | CRITICAL | Verify owner-controlled DNS, redirects and production host before index release |
| License or video rights missing | CRITICAL | Source-specific rights ledger; fail closed |
| Hidden WIP and proprietary premium material indexed/published | CRITICAL | Explicit eligibility gate, separate source closure, CI audit |
| SSR/metadata claims cannot be reproduced | HIGH | Real HTTP/HTML tests, not purely rendered DOM |
| Uncontrolled third-party automation charges | HIGH | Local-first commands; budget caps, manually initiated pilot |
| Public-to-private GitHub bulk action breaks dependency/release | HIGH | Separate owner-approved repo inventory |
| Prompt benchmark contaminated with branded prompts | HIGH | Frozen control + held-out sets and raw receipts |
| Excessive pages / keyword cannibalization | HIGH | Owner-reviewed intent-to-URL map |
| Analytics/email collection contradicts privacy claims | HIGH | Consent, provider and legal review before activation |
| Heavy previews damage mobile UX | HIGH | Lazy loading, real devices, poster fallbacks, owner visual signoff |
| CI requires expensive all-site crawl on every commit | MEDIUM | Scope PR tests, run broad crawl as bounded release audit |

RACI for this plan: owner approves branding, domain, rights, indexability, prices and distribution; builder implements scoped diffs; hostile reviewer validates claims/security/performance; no autonomous social posting or changing repo privacy.

## 16. Definition of done and final report contract

For each sprint produce a compact report in this exact order:

**PLAN:** baseline, decisions, known unknowns, files in scope, explicit non-goals.
**CHANGESET:** per-file additions/edits; dependencies and lockfile changes; no unrelated runtime rewrite.
**VERIFY:** commands, PASS/FAIL/SKIP with receipts, test count, screenshots/HTTP snippets where useful; rights assertions separate from automated tests.
**HOSTILE REVIEW:** Critical/High findings, one bounded repair/re-review, deferred concerns.
**VERDICT:** BUILD NOW / SMALL EXPERIMENT / DEFER / KILL; owner approvals needed; rollback action; current git status and commit/PR IDs.

Final acceptance for Discovery Engine V1:
- Canonical domain is verified and controlled.
- No accidental indexing of private, draft or rights-unverified content.
- One published effect has helpful SSR-readable copy, accurate metadata, install instructions and a working visual demo.
- One registry component passes two independent clean app installs.
- Technical gates detect seeded metadata/link/rights defects.
- Media files are rights cleared, appropriately optimized and mobile-safe.
- Reporting separates technical compliance from external organic and AI visibility.
- Newsletter, Gumroad and donations remain optional, non-intrusive and truthfully described.
- No unauthorized merge, deployment, social publishing, GitHub visibility change or paid infrastructure activation.

## 17. Primary references (recheck at implementation time)

- Google AI search guidance: https://developers.google.com/search/docs/appearance/ai-features
- Google spam policies / scaled content: https://developers.google.com/search/docs/essentials/spam-policies
- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google structured data principles: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Next.js Metadata API: https://nextjs.org/docs/app/api-reference/file-conventions/metadata
- Next.js sitemap: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js robots: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- shadcn GitHub registry: https://ui.shadcn.com/docs/registry/github
- Core Web Vitals: https://web.dev/articles/vitals
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- Lychee: https://github.com/lycheeverse/lychee
- Unlighthouse: https://github.com/harlan-zw/unlighthouse
- Promptfoo: https://github.com/promptfoo/promptfoo
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster: https://www.bing.com/webmasters
- IndexNow: https://www.indexnow.org/documentation
- OpenAI crawler policy: https://platform.openai.com/docs/bots

**Reminder:** external guidelines, pricing, APIs and provider features change. Verify them when implementing; this document is a design plan, not an attestation that all third-party services were tested or configured.
