# Effect registry

`lib/effect-registry.ts` is the canonical list used by cards and static routes. `lib/forge-studies.ts` owns the three small React effects; `lib/material-studies.ts` owns the three material effects. **Catalog Preview is not owner release approval or a clean-consumer installation pass.**

| Slug | Source authority | Catalog status |
| --- | --- | --- |
| magnetic-focus | components/forge-factory-01/magnetic-focus.tsx | Preview |
| glyph-morph | components/forge-factory-01/glyph-morph.tsx | Preview |
| prism-text | components/forge-factory-01/prism-text.tsx | Preview (not PrismLens) |
| ascii-waves | components/white-journey/original-ascii/renderer.ts | Preview; separate local media |
| digital-wake | components/digital-wake/engine.ts + fin012.ts | Experimental/Beta; manual caudal proof |
| ashfall-type | components/material-effects/ashfall-type.ts | Preview |
| seam-erosion | components/material-effects/seam-erosion.ts | Preview |
| sediment-reveal | components/material-effects/sediment-reveal.ts | Preview; rights for referenced asset must be retained |

One site header/footer surrounds the playgrounds. `/lab/forge-factory-01` preserves the original three-effect lab. Other experiments and rejected concepts remain outside this canonical list.

The root `registry.json` contains **Magnetic Focus only**. Real shadcn 4.23.0 installs from public GitHub commit `4cd0e4b6f8efc95dfd2e4fd2e641c7d194ac378e`, Next.js/Vite builds and browser interactions pass with no local-source fallback. Its source closure is identical to the deployed polish. Catalog maturity and installation proof remain separate; the other seven effects have no independent public-install proof. See [installation](docs/MAGNETIC_FOCUS_INSTALL.md).
