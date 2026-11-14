# React / TypeScript installation

Copy **all** of `components/visual-frontier/` into your project at the same path.
Keep `renderers/`, JSON, CSS Module, embedded font/WASM constants and licenses.
The playground's **Load complete source & copy files** action exposes the exact
allowlist at `/api/effects/visual-frontier/source`. This is a multi-file installation.

```sh
pnpm add --save-exact three@0.187.0 three-text@0.6.5
pnpm add -D --save-exact @types/three@0.187.0
```

Use React 19, TypeScript 5.9, `resolveJsonModule: true` and CSS Modules (Next.js 16
or Vite 8). No Tailwind, app alias, Next runtime, remote font, OGL, runtime compiler
or external media is required by the copied files.

From a root component beside `components/`:

```tsx
"use client";
import { RefractiveType } from "./components/visual-frontier/frontier";

export function MyInterface() {
  return <div style={{ height: 520, width: "100%" }}>
    <RefractiveType variant="spectral-mass" dispersion={0.5}
      deformation={0.45} mode="full" paused={false} />
  </div>;
}
```

Use `split-signal` for A2. C exports `ImpossibleMaterial`; variants are
`quicksilver` and `folded-mineral`, with `tension={0.5}`, `iridescence={0.55}`.
Values clamp to 0–1; nonfinite inputs use defaults. Approved words are fixed PHASE
and VOID. No arbitrary-text API is claimed.

Default `mode="light"` renders a labelled live Canvas2D companion. Activate
`mode="full"` explicitly to load the approved WebGL2 renderer. Give the parent a
height. `paused` freezes the clock but permits control and pointer/arrow edits.
Increment `resetKey` to reset clock and pointer, resetting external control values
as well. Reduced motion starts still; explicit Play may set
`motion="user-activated"`. Unmounting disposes the renderer.

The clock gates intersection, visibility, connection and debounced resize. A shared
lease serializes full creation and disposal. Another full effect releases the
previous one to its live companion. Context errors show a real error and fallback.
Unavailable Canvas2D leaves the accessible name and error. Software GPUs can be
slow, especially A2/C2; no frame-rate promise is made for them.
