# Megasprint 01 — integrated local candidate

Status: **LOCAL REVIEW CANDIDATE**. No production deployment, public media
activation, Git push/merge, Gumroad publication or email campaign occurred.
Private staging is **BLOCKED** on authenticated root access (see the evidence
packet's `OPERATOR_HANDOFF.md`).

Base: `7db32651b8226b21851dd3480db9dd688e50b267` (`repair/release-blockers-01`).
Candidate branch: `sprint/megasprint-01` in
`/home/swirky/DevHub/worktrees/nullworx-megasprint-01`.

## Status matrix

| Lane | Status | Evidence / limit |
| --- | --- | --- |
| Release ops / private staging | **BLOCKED** | SSH and pinned host key work. `sudo -n true` returns `sudo: a password is required`; the staged archive is root-owned 0600. A reviewed approval generator, protected preflight and one-command operator wrapper are prepared and locally validated against the installed controller snapshot. No approval was installed and no stage/attest was invoked. |
| Signature Hero live | **DONE / TESTED** | `/kits/signature-hero?preset=cobalt`, `carbon`, `porcelain`. Real React/CSS/WebGL material, pointer light, pause, reduced-motion static mode, customizer, generated TSX, install contract and share URL. No image preview, no public PNGs. Cobalt is the default. |
| Agent Design DNA | **DONE / TESTED** | Schema 1.0.0 in `lib/design-dna/`; three component contracts; ten valid and twelve invalid fixtures; canonical serialization; import/export; generated snippets; no executable recipe payloads. Lab at `/lab/design-dna` (noindex). Two independent agent-style trials passed in the browser with forbidden patches rejected. |
| Bento Duo live | **DONE / TESTED** | `/kits/bento-duo` mounts the actual Orbit Bento 02 and Foil Reactor components. Homepage teaser mounts the same components in bounded live frames. Static captures remain references/product-schema images, not site previews. Existing €39 Gumroad URL retained; checkout was not re-verified as a purchase. |
| Free material playgrounds | **DONE / TESTED** | Ashfall Type, Seam Erosion and Sediment Reveal keep approved defaults and add bounded `intensity`/`density` controls. Generated usage carries current lines, color, intensity and density. Magnetic Focus, Glyph Morph, Prism Text and ASCII Waves remain intact. Digital Wake remains separate Beta/noindex. |
| Product journey / SEO | **DONE / TESTED** | Live Signature Hero and Bento links in navigation; no public lab link; Signature Hero and Design DNA are noindex with `X-Robots-Tag`; sitemap remains ten URLs; canonical/OG metadata on new routes; no fake product or subscription state. |
| Performance | **DONE / TESTED** | Homepage baseline 13.24 MB post-idle / 17.2 s load replaced by 452 KB / 1.9 s in the same Chromium/SwiftShader harness; initial transfer is 266 KB vs 258 KB. Signature canvas caps at 905×221 ≈ 200k physical pixels; reduced motion mounts 0 canvases; offscreen motion reports `paused`; Bento mounts 0 canvases. |
| Mail funnel | **DEFERRED / BLOCKED EXTERNAL** | Existing Brevo double opt-in remains fail-closed behind `NULLWORX_DROPS_ENABLED`, API key, list/template IDs and privacy email. No live address collected and no campaign sent. |
| Bounded library experiments | **DEFERRED** | No candidate library was installed. The 01A/01B/01C and material renderers already cover the current product gaps without a new runtime. |
| Git / production | **NOT PERFORMED** | No push, merge, activate, finalize, rollback, Caddy/DNS change, public media activation or commerce mutation. Owner review is the final gate. |

## Routes for owner review

- Homepage: `/`
- Signature Hero Cobalt: `/kits/signature-hero?preset=cobalt`
- Signature Hero Carbon: `/kits/signature-hero?preset=carbon`
- Signature Hero Porcelain: `/kits/signature-hero?preset=porcelain`
- Agent Design DNA: `/lab/design-dna`
- Bento Duo: `/kits/bento-duo`
- Free effects: `/effects`, `/effects/magnetic-focus`, `/effects/glyph-morph`,
  `/effects/prism-text`, `/effects/ascii-waves`, `/effects/ashfall-type`,
  `/effects/seam-erosion`, `/effects/sediment-reveal`

## Rights and commercial boundaries

- Signature Hero source carries `components/signature-hero/LICENSE.txt`:
  internal owner-review candidate, no customer license assigned. It is not
  described as MIT and is excluded from the public sitemap.
- Bento source carries the package MIT licenses copied from the reviewed
  packages. The paid ZIP/source remains behind Gumroad; no download or
  copy-source interface is added.
- Public effect source remains MIT. The LOOP30 media remains privately
  provisioned under the owner-attested direct-permission contract; no raw media
  is included in Git or the release artifact. Independently authenticated
  rights-holder proof is still absent.
- No third-party stock media or new runtime dependency was added. Paper Shaders
  remains pinned at `@paper-design/shaders-react@0.0.82` (Apache-2.0).

## Rollback

The candidate is an isolated branch/worktree; no production state changed.
Discard the worktree/branch after owner review, or revert the Megasprint commits.
The release-repair candidate and its archive remain untouched. For a future
private stage transaction, use the installed controller's documented recovery
path; do not hand-edit pointers, services or journals.

## Remaining highest-value work

1. Authenticated operator run of the prepared private-stage command, followed by
   tunnel HTTP/browser/product gates and controller attestation.
2. Owner visual approval of the live Signature Hero at full-bleed consumer width
   and a signed-off source/licence decision before any public route.
3. Verify the live Gumroad listing/checkout and file delivery separately before
   claiming commerce readiness.
4. Firefox/WebKit and real low-end phone runs for Signature Hero, plus a
   GPU-backed performance pass. Current evidence is Chromium/SwiftShader.
5. Only after those: production promotion authorization, public media activation
   and any SEO/indexing decision for the new routes.
