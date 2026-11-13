import type { CSSProperties } from "react";
import type { SignatureHeroProps } from "@/components/signature-hero/signature-hero";
import { SIGNATURE_PRESETS, type SignaturePreset } from "@/components/signature-hero/signature-presets";
import { orbitContent } from "@/components/bento-duo/orbit/content";
import { foilContent } from "@/components/bento-duo/foil/content";
import type { OrbitBentoProps } from "@/components/bento-duo/orbit";
import type { FoilReactorProps } from "@/components/bento-duo/foil";
import type { DesignRecipe, FoilRecipe, OrbitRecipe, SignatureRecipe, SignatureTokens } from "./schema";

function matchingPreset(background: string): SignaturePreset {
  for (const preset of ["cobalt", "carbon", "porcelain"] as const) {
    if (SIGNATURE_PRESETS[preset].background.toLowerCase() === background.toLowerCase()) return preset;
  }
  return "cobalt";
}

export function signatureHeroProps(recipe: SignatureRecipe): SignatureHeroProps {
  const { palette, typography, content, motion } = recipe.tokens;
  return {
    preset: matchingPreset(palette.background),
    copy: content,
    colors: palette,
    settings: {
      motion: motion.mode,
      speed: motion.speed,
      weight: typography.weight,
      tracking: typography.tracking,
      pointer: motion.pointer,
    },
  };
}

export function orbitBentoProps(recipe: OrbitRecipe): OrbitBentoProps {
  const { palette, content, layout } = recipe.tokens;
  return {
    content: { ...orbitContent, eyebrow: content.eyebrow, title: content.title, subtitle: content.subtitle },
    accent: layout.accent,
    initialRadius: layout.radius,
    style: {
      "--paper": palette.background,
      "--ink": palette.ink,
      "--muted": palette.muted,
      "--soft": palette.line,
    } as CSSProperties,
  };
}

export function foilReactorProps(recipe: FoilRecipe): FoilReactorProps {
  const { content, layout } = recipe.tokens;
  return {
    content: { ...foilContent, title: content.title, subtitle: content.subtitle, specimen: content.specimen },
    initialMaterial: layout.material,
    initialState: layout.phase,
    initialLight: { x: layout.lightX, y: layout.lightY },
  };
}

export function recipePreviewStyle(recipe: DesignRecipe): CSSProperties {
  return recipe.component.id === "signature-hero"
    ? { maxWidth: `${(recipe.tokens as SignatureTokens).layout.maxWidth}px` }
    : { maxWidth: "100%" };
}
