# UI Forge / Nullworx

A React/TypeScript effects gallery in the Nullworx project. The off-white, purple and teal site, ASCII renderer, and material effects live in one Next.js application. **A registered preview is not a released or independently installable component.**

## Run locally

Requires Node 24 and pnpm 12.15.0.

```sh
pnpm install --frozen-lockfile
pnpm dev --port 3350
```

Open http://127.0.0.1:3350. Production preview: `pnpm build && pnpm start --port 3350`.

## Gallery — eight registered effects

| Effect | Current catalog status |
| --- | --- |
| Magnetic Focus | Preview; candidate for first independent installation proof |
| Glyph Morph | Preview |
| Prism Text | Preview; distinct from rejected PrismLens experiment |
| ASCII Waves | Preview; media provisioned separately |
| Digital Wake | Experimental/Beta; fin-bound motion requires evidence and separate media |
| Ashfall Type | Preview |
| Seam Erosion | Preview |
| Sediment Reveal | Preview; local licensed image included |

Navigate Home → Effects → playground → controls → installation. The three small React studies expose source and usage examples; material effects expose their shared source closure. Video effects have separate media notes.

## Component installation

The [Magnetic Focus source registry](registry.json) includes the component, CSS Module, and reduced-motion hook. Real shadcn 4.23.0 local installs pass in independent Next.js and Vite consumers. Run `pnpm test:distribution` to reproduce. [Install instructions](docs/MAGNETIC_FOCUS_INSTALL.md) distinguish tested local commands from the GitHub command that requires an authorized public ref. No npm package is published.

## Media

No third-party media is bundled. A clean clone builds with explicit unavailable-media states and browser-local selectors. Fish-bound Digital Wake requires the accepted 30-second loop and matching masks/motion. Locally selected files are not uploaded. Public playback requires separate rights and deployment approval.

For this workspace:

```sh
pnpm media:provision --experiments ~/DevHub/experiments
```

See [MEDIA_PROVISIONING.md](MEDIA_PROVISIONING.md) for hashes, rights findings, hosting paths and manual fin correction.

## Develop

`pnpm verify` runs lint, typecheck, effect/registry validation, unit tests, build and secret scanning. `pnpm test:e2e` runs browser checks. Provisioned-data tests explicitly skip on clean clones.

Use [EFFECT_REGISTRY.md](EFFECT_REGISTRY.md) and [ADDING_AN_EFFECT.md](ADDING_AN_EFFECT.md) for effects, and [CONSOLIDATION_REPORT.md](CONSOLIDATION_REPORT.md) for source authority. Indexing and deployment are separate integration responsibilities. No deployment or publication is implied by this changeset.
