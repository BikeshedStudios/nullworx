import { componentContract } from "./registry";
import type { DesignRecipe, FoilTokens, OrbitTokens, SignatureTokens } from "./schema";

function json(value: unknown, indent = 2): string {
  return JSON.stringify(value, null, indent);
}

export function integrationSnippet(recipe: DesignRecipe): string {
  if (recipe.component.id === "signature-hero") {
    const { palette, typography, content, motion } = recipe.tokens as SignatureTokens;
    return `// Signature Hero 01 — generated from Design DNA recipe ${recipe.id}@${recipe.version}
import { SignatureHero } from "@/components/signature-hero";

export function StudioHero() {
  return (
    <SignatureHero
      preset="cobalt"
      copy={${json(content)}}
      colors={${json(palette)}}
      settings={${json({ motion: motion.mode, speed: motion.speed, weight: typography.weight, tracking: typography.tracking, pointer: motion.pointer })}}
    />
  );
}
`;
  }
  if (recipe.component.id === "orbit-bento") {
    const { palette, content, layout } = recipe.tokens as OrbitTokens;
    return `// Orbit Bento 02 — generated from Design DNA recipe ${recipe.id}@${recipe.version}
import { OrbitBento, orbitContent } from "@/components/bento-duo/orbit";

const content = {
  ...orbitContent,
  eyebrow: ${JSON.stringify(content.eyebrow)},
  title: ${JSON.stringify(content.title)},
  subtitle: ${JSON.stringify(content.subtitle)},
};

export function ProjectIndex() {
  return (
    <OrbitBento
      content={content}
      accent=${JSON.stringify(layout.accent)}
      initialRadius={${layout.radius}}
      style={${json({ "--paper": palette.background, "--ink": palette.ink, "--muted": palette.muted, "--soft": palette.line })}}
    />
  );
}
`;
  }
  const { content, layout } = recipe.tokens as FoilTokens;
  return `// Foil Reactor — generated from Design DNA recipe ${recipe.id}@${recipe.version}
import { FoilReactor, foilContent } from "@/components/bento-duo/foil";

const content = {
  ...foilContent,
  title: ${JSON.stringify(content.title)},
  subtitle: ${JSON.stringify(content.subtitle)},
  specimen: ${JSON.stringify(content.specimen)},
};

export function MaterialStudy() {
  return (
    <FoilReactor
      content={content}
      initialMaterial=${JSON.stringify(layout.material)}
      initialState=${JSON.stringify(layout.phase)}
      initialLight={{ x: ${layout.lightX}, y: ${layout.lightY} }}
    />
  );
}
`;
}

export function installInstructions(recipe: DesignRecipe): string {
  const contract = componentContract(recipe.component.id);
  return `# ${contract.label} — recipe ${recipe.id}@${recipe.version}
# Compatible component version: ${contract.version}
# Runtime dependencies:
${contract.dependencies.map(item => `# - ${item}`).join("\n")}
#
# ${contract.install}
# Import the component from the path shown in the generated snippet.
# No arbitrary recipe-supplied package, URL or code is installed or executed.`;
}
