import { EFFECTS } from "../lib/effect-registry";
import { existsSync } from "node:fs";
const slugs = EFFECTS.map((effect) => effect.slug);
if (new Set(slugs).size !== slugs.length || EFFECTS.length !== 8)
  throw new Error("Invalid canonical effect registry");
for (const effect of EFFECTS)
  if (!effect.description || !effect.name) throw new Error("Incomplete effect");
for (const file of [
  "app/effects/[slug]/page.tsx",
  "components/digital-wake/preview.tsx",
  "components/white-journey/ascii-study.tsx",
  "components/material-effects/material-playground.tsx",
  "components/material-effects/material-components.tsx",
  "public/material-wave-a/mineral-study.webp",
])
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
console.log(`Validated ${EFFECTS.length} effects: ${slugs.join(", ")}`);
