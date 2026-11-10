# Magnetic Focus installation

The real shadcn **4.23.0** CLI installs this source closure into clean Vite 8.3.7 and Next.js 16.4.3 consumers using React 19.3.1. Local HTTP and local item-JSON installs, builds, and browser interactions pass. **GitHub-remote installation is blocked until an authorized commit containing this registry is publicly accessible.** No npm package is published.

## Reproduce the local proof

Use Node 24 and pnpm 12.15.0 (the app supports Node >=22.12; only Node 24.20.0 was tested here):

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm verify
pnpm test:distribution
E2E_PORT=3420 CLEAN_CLONE=1 pnpm test:e2e
pnpm test:distribution:site
```

`test:distribution` creates two new OS-temporary projects from committed manifests/lockfiles, runs the official schema validator and registry builder, and runs real CLI dry-runs and installations. Vite installs over local HTTP; Next installs the built item JSON from disk. Each installation must create exactly three files, preserve every pre-existing fixture file, and match the canonical source bytes. Both consumers typecheck, build, and exercise click, Enter/Space/Tab, focus, disabled state, pointer/reset/cancel, touch, pause/resume, live/initial reduced motion, 1280/390/320px, and axe WCAG 2 A/AA + 2.1 AA checks. No site-global CSS or runtime dependency is copied.

Each run prints the temporary receipt directory. It retains logs, installed sources, manifests and screenshots. Test servers stop when the run exits. `test:distribution:site` needs the production build from `verify`. Integration applies scoped contrast and focus fixes; `pnpm test:launch` checks Digital Wake's default/selected/expanded/mobile states in both motion preferences.

## Install locally into an existing consumer

From this source checkout:

```sh
pnpm dlx shadcn@4.23.0 registry validate ./registry.json
pnpm dlx shadcn@4.23.0 build --output /absolute/temporary/nullworx-registry
```

From your initialized React/TypeScript shadcn consumer:

```sh
pnpm dlx shadcn@4.23.0 add /absolute/temporary/nullworx-registry/magnetic-focus.json --dry-run
pnpm dlx shadcn@4.23.0 add /absolute/temporary/nullworx-registry/magnetic-focus.json --yes
```

The fixtures include minimal `components.json` configurations. An existing app must configure its `components` alias and TypeScript/bundler aliases consistently. The target `@components/nullworx/` resolves through that configuration. Keep the component, CSS Module and hook together:

```text
components/nullworx/magnetic-focus.tsx
components/nullworx/magnetic-focus.module.css
components/nullworx/use-reduced-motion.ts
```

Requires React and a CSS Modules capable bundler. No Tailwind classes, Next runtime imports, fonts, images, or other packages are needed. Retain [the MIT notice](../LICENSE) when reusing substantial source; the installer does not copy that notice automatically. The root source registry intentionally has no stale embedded file contents.

For Next App Router, put event-handler usage in a client component:

```tsx
"use client";
import { MagneticFocus } from "@/components/nullworx/magnetic-focus";

export function Action() {
  return <MagneticFocus label="Open field" intensity={0.6}
    onClick={() => console.log("Activated")} />;
}
```

Vite uses the same import and JSX. It may warn that `use client` directives are ignored in client bundling; the verified browser behavior works. Only the listed React/Next/Vite/TypeScript versions and Chromium were tested; other versions and browsers are NOT TESTED.

## GitHub install after an authorized remote integration

These are **future commands with a placeholder, not a currently working public ref**. Replace `PUBLIC_COMMIT_SHA` with a reviewed, remotely accessible full commit SHA that contains the root registry and all three sources:

```sh
pnpm dlx shadcn@4.23.0 registry validate BikeshedStudios/nullworx#PUBLIC_COMMIT_SHA
pnpm dlx shadcn@4.23.0 add BikeshedStudios/nullworx/magnetic-focus#PUBLIC_COMMIT_SHA --dry-run
pnpm dlx shadcn@4.23.0 add BikeshedStudios/nullworx/magnetic-focus#PUBLIC_COMMIT_SHA --yes
# Repeat both clean consumers using only GitHub transport, with no local fallback:
NULLWORX_PUBLIC_REGISTRY_SHA=PUBLIC_COMMIT_SHA pnpm test:distribution
```

GitHub source registries need no registry server or generated public JSON. The CLI resolves the ref and reads root `registry.json` plus the declared files. A raw URL to the root source registry is not a built item-JSON URL. Before advertising the public command, repeat both clean consumer installations with the GitHub address and record the resolved SHA, exact source manifests, typecheck/build and browser receipts. Local success does not prove GitHub transport, ref accessibility, or release approval.

Official references checked through Context7: [GitHub registries](https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/changelog/2026-06-github-registries.mdx), [registry CLI](https://ui.shadcn.com/docs/cli), [Next client boundary](https://nextjs.org/docs/app/api-reference/directives/use-client). Installed CLI help and actual executions are the version-specific receipts.
