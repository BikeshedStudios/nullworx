# Magnetic Focus installation

Verified public source: [`4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e`](https://github.com/BikeshedStudios/nullworx/tree/4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e). All three Magnetic Focus files match the deployed polish source exactly. No npm package is published.

## Install from GitHub

In an initialized React/TypeScript shadcn consumer:

```sh
pnpm dlx shadcn@4.23.0 registry validate BikeshedStudios/nullworx#4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e
pnpm dlx shadcn@4.23.0 add BikeshedStudios/nullworx/magnetic-focus#4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e --dry-run
pnpm dlx shadcn@4.23.0 add BikeshedStudios/nullworx/magnetic-focus#4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e --yes
curl -fsS https://raw.githubusercontent.com/BikeshedStudios/nullworx/4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e/LICENSE -o NULLWORX-LICENSE
```

The installer does not copy the MIT notice automatically. Retain the downloaded notice with substantial reused source; the original copyright is unchanged.

Configure `components.json`'s `components` alias consistently with your TypeScript/bundler aliases. The registry's `@components/nullworx/` targets resolve through that configuration. With the committed fixture configuration, installation creates exactly:

```text
components/nullworx/magnetic-focus.tsx
components/nullworx/magnetic-focus.module.css
components/nullworx/use-reduced-motion.ts
```

React and a CSS Modules capable bundler are required. No Tailwind classes, site-global CSS, fonts, images or additional runtime packages are needed. Source files stay together so their relative imports resolve. See the minimal [Next configuration](../tests/distribution/fixtures/next/components.json) and [Vite configuration](../tests/distribution/fixtures/vite/components.json).

For Next App Router, put event-handler usage in a client component:

```tsx
"use client";
import { MagneticFocus } from "@/components/nullworx/magnetic-focus";

export function Action() {
  return <MagneticFocus label="Open field" intensity={0.6}
    onClick={() => console.log("Activated")} />;
}
```

Vite uses the same import and JSX. Its bundler warns that `use client` directives are ignored; the tested client behavior passes.

## Reproduce the public installation proof

Use Node **24.20.0**, pnpm **12.15.0** and Chromium:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium --with-deps
pnpm test:distribution
```

The runner creates two new temporary projects from committed manifests and independent lockfiles, then invokes the real shadcn **4.23.0** CLI against the full public SHA. It fetches the registry, three sources and MIT notice from public GitHub, verifies source hashes against this checkout, and installs both consumers through GitHub transport. No local registry server, built local item JSON or source-copy installation path exists. A network/ref error fails the run. `GH_TOKEN` and `GITHUB_TOKEN` are removed from CLI child environments.

Both **Next.js 16.4.3** and **Vite 8.3.7**, with **React 19.3.1 / TypeScript 5.9.3**, pass:

- CLI schema validation, dry-run without writes, installation of exactly three files, unchanged existing fixture files, exact source-byte parity.
- Typecheck and production build.
- Click, Enter/Space/Tab, visible focus, disabled state, pointer leave/cancel/reset, touch, pause/resume and initial/live reduced-motion preferences.
- 1280/390/320px layouts, zero axe WCAG 2 A/AA and 2.1 AA violations, zero console/page errors or failed browser requests.

Logs, installed sources, source hashes and screenshots are retained under the printed temporary receipt directory. The compact [public receipt](releases/remote-install.json) records this run. Consumer tests ran in Chromium/Linux; other consumer browser platforms and dependency versions were not tested. Automated accessibility checks do not replace screen-reader testing.

To test a later approved public commit, supply its full SHA:

```sh
NULLWORX_PUBLIC_REGISTRY_SHA=FULL_PUBLIC_COMMIT_SHA pnpm test:distribution
```

The default remains the already-tested public SHA. A later site/documentation release does not invalidate this pin while the source closure is unchanged. GitHub source registries require no registry server or generated public JSON; see the [official GitHub registry guide](https://ui.shadcn.com/docs/registry/github).
