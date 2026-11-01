# UI Forge

A small React/TypeScript effect library and interactive website. The approved offwhite, purple and teal site, original ASCII renderer and Digital Wake now share one application.

## Run locally

Requires Node 24 and pnpm 12.15.0.

```sh
pnpm install --frozen-lockfile
pnpm dev --port 3350
```

Open http://127.0.0.1:3350. Production preview: `pnpm build && pnpm start --port 3350`.

## Effects

- Magnetic Focus — pointer attraction with keyboard/touch support.
- Glyph Morph — deterministic accessible character transitions.
- Prism Text — selectable CSS spectrum text.
- ASCII Waves — the original WebGL character renderer, with Fine settings.
- Digital Wake 01.2 — **Experimental/Beta**, manually defined caudal-fin sectors and measured relative motion. SUBTLE and EXPRESSIVE presets, Original/ASCII/Pointillism/Hybrid views, controls, preset JSON import/export and source-trace debugging.

Navigate Home → Effects → playground → controls → installation. The three small React effects show their actual source and usage examples. Video effects include their own integration notes.

## Media

No third-party media is bundled. A clean clone builds and runs with explicit unavailable-media states and browser-local video selectors. Fish-bound wake requires the exact accepted 30s loop plus matching masks/motion. Files selected in the browser are never uploaded. Public playback is pending source-specific hosting rights and separate deployment authorization.

For this workspace:

```sh
pnpm media:provision --experiments ~/DevHub/experiments
```

See [MEDIA_PROVISIONING.md](MEDIA_PROVISIONING.md) for hashes, rights findings, stable hosting paths and manual fin correction.

## Develop

`pnpm verify` runs lint, typecheck, registry validation, unit tests, build and secret scanning. `pnpm test:e2e` runs browser checks. Provisioned-data tests skip explicitly on clean clones.

Use [EFFECT_REGISTRY.md](EFFECT_REGISTRY.md) and [ADDING_AN_EFFECT.md](ADDING_AN_EFFECT.md) to add another effect. See [CONSOLIDATION_REPORT.md](CONSOLIDATION_REPORT.md) for source authority and verification. No deployment is part of this release.
