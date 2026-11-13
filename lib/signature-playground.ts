import {
  DEFAULT_SIGNATURE_COPY,
  SIGNATURE_PRESETS,
  supportedWordmark,
  type SignatureCopy,
  type SignaturePreset,
} from "@/components/signature-hero/signature-presets";
import type { LivingTypeColors } from "@/components/signature-hero/living-type/living-type-recipe";

export const SIGNATURE_PRESET_IDS = ["cobalt", "carbon", "porcelain"] as const;
export type SignatureMotion = "auto" | "static";
export type SignatureViewport = "desktop" | "mobile";

export type SignatureSettings = {
  motion: SignatureMotion;
  speed: number;
  weight: number;
  tracking: number;
  pointer: boolean;
};

export type SignatureConfig = {
  preset: SignaturePreset;
  copy: Pick<SignatureCopy, "brand" | "wordmark" | "counterline" | "description" | "primaryLabel">;
  colors: {
    background: string;
    ink: string;
    muted: string;
    accent: string;
    line: string;
    material: LivingTypeColors;
  };
  settings: SignatureSettings;
};

const HEX = /^#[a-fA-F\d]{6}$/;
const plain = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);

export function isSignaturePreset(value: string | null): value is SignaturePreset {
  return value === "cobalt" || value === "carbon" || value === "porcelain";
}

export function signatureDefaults(preset: SignaturePreset = "cobalt"): SignatureConfig {
  const direction = SIGNATURE_PRESETS[preset];
  return {
    preset,
    copy: {
      brand: DEFAULT_SIGNATURE_COPY.brand,
      wordmark: DEFAULT_SIGNATURE_COPY.wordmark,
      counterline: DEFAULT_SIGNATURE_COPY.counterline,
      description: DEFAULT_SIGNATURE_COPY.description,
      primaryLabel: DEFAULT_SIGNATURE_COPY.primaryLabel,
    },
    colors: {
      background: direction.background,
      ink: direction.ink,
      muted: direction.muted,
      accent: direction.accent,
      line: direction.line,
      material: [...direction.colors] as LivingTypeColors,
    },
    settings: {
      motion: "auto",
      speed: direction.material.speed,
      weight: direction.weight,
      tracking: direction.tracking,
      pointer: true,
    },
  };
}

function hex(value: string | null, fallback: string) {
  return value && HEX.test(value) ? value.toLowerCase() : fallback;
}

function number(value: string | null, fallback: number, min: number, max: number) {
  if (value === null || !/^(?:0|[1-9]\d*)(?:\.\d{1,3})?$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function text(value: string | null, fallback: string, max: number) {
  if (!value) return fallback;
  let decoded = value;
  try { decoded = decodeURIComponent(value.replaceAll("+", " ")); } catch { return fallback; }
  return decoded.length > 0 && decoded.length <= max && plain(decoded) ? decoded : fallback;
}

/** Bounded, versioned URL state. Unknown or invalid fields fall back; they never select code. */
export function parseSignatureQuery(query: string): { config: SignatureConfig; custom: boolean } {
  const fallback = signatureDefaults("cobalt");
  if (query.length > 4096) return { config: fallback, custom: false };
  let params: URLSearchParams;
  try { params = new URLSearchParams(query); } catch { return { config: fallback, custom: false }; }
  const version = params.get("v");
  if (version !== null && version !== "1") return { config: fallback, custom: params.size > 0 };
  const requestedPreset = params.get("preset");
  const preset: SignaturePreset = isSignaturePreset(requestedPreset) ? requestedPreset : "cobalt";
  const base = signatureDefaults(preset);
  const config: SignatureConfig = {
    preset,
    copy: {
      brand: text(params.get("brand"), base.copy.brand, 40),
      wordmark: supportedWordmark(text(params.get("wordmark"), base.copy.wordmark, 24)),
      counterline: text(params.get("counterline"), base.copy.counterline, 60),
      description: text(params.get("description"), base.copy.description, 220),
      primaryLabel: text(params.get("primary"), base.copy.primaryLabel, 40),
    },
    colors: {
      background: hex(params.get("bg"), base.colors.background),
      ink: hex(params.get("ink"), base.colors.ink),
      muted: hex(params.get("muted"), base.colors.muted),
      accent: hex(params.get("accent"), base.colors.accent),
      line: hex(params.get("line"), base.colors.line),
      material: [0, 1, 2, 3].map(index => hex(params.get(`m${index + 1}`), base.colors.material[index])) as LivingTypeColors,
    },
    settings: {
      motion: params.get("motion") === "static" ? "static" : "auto",
      speed: number(params.get("speed"), base.settings.speed, 0, 0.6),
      weight: Math.round(number(params.get("weight"), base.settings.weight, 200, 900) / 100) * 100,
      tracking: number(params.get("tracking"), base.settings.tracking, -0.04, 0.08),
      pointer: params.get("pointer") !== "0",
    },
  };
  return { config, custom: true };
}

export function signatureQuery(config: SignatureConfig): string {
  const base = signatureDefaults(config.preset);
  const params = new URLSearchParams({ v: "1", preset: config.preset });
  if (config.copy.brand !== base.copy.brand) params.set("brand", config.copy.brand);
  if (config.copy.wordmark !== base.copy.wordmark) params.set("wordmark", config.copy.wordmark);
  if (config.copy.counterline !== base.copy.counterline) params.set("counterline", config.copy.counterline);
  if (config.copy.description !== base.copy.description) params.set("description", config.copy.description);
  if (config.copy.primaryLabel !== base.copy.primaryLabel) params.set("primary", config.copy.primaryLabel);
  if (config.colors.background !== base.colors.background) params.set("bg", config.colors.background);
  if (config.colors.ink !== base.colors.ink) params.set("ink", config.colors.ink);
  if (config.colors.muted !== base.colors.muted) params.set("muted", config.colors.muted);
  if (config.colors.accent !== base.colors.accent) params.set("accent", config.colors.accent);
  if (config.colors.line !== base.colors.line) params.set("line", config.colors.line);
  config.colors.material.forEach((color, index) => { if (color !== base.colors.material[index]) params.set(`m${index + 1}`, color); });
  if (config.settings.motion !== base.settings.motion) params.set("motion", config.settings.motion);
  if (config.settings.speed !== base.settings.speed) params.set("speed", String(config.settings.speed));
  if (config.settings.weight !== base.settings.weight) params.set("weight", String(config.settings.weight));
  if (config.settings.tracking !== base.settings.tracking) params.set("tracking", String(config.settings.tracking));
  if (config.settings.pointer !== base.settings.pointer) params.set("pointer", config.settings.pointer ? "1" : "0");
  return params.toString();
}

export function signatureCode(config: SignatureConfig): string {
  const copy = {
    brand: config.copy.brand,
    wordmark: config.copy.wordmark,
    counterline: config.copy.counterline,
    description: config.copy.description,
    primaryLabel: config.copy.primaryLabel,
  };
  return `"use client";
import { SignatureHero } from "@/components/signature-hero";

export function StudioHero() {
  return (
    <SignatureHero
      preset="${config.preset}"
      copy={${JSON.stringify(copy, null, 6).replace(/\n/g, "\n      ")}}
      colors={${JSON.stringify({
        background: config.colors.background,
        ink: config.colors.ink,
        muted: config.colors.muted,
        accent: config.colors.accent,
        line: config.colors.line,
        material: config.colors.material,
      }, null, 6).replace(/\n/g, "\n      ")}}
      settings={${JSON.stringify(config.settings, null, 6).replace(/\n/g, "\n      ")}}
    />
  );
}
`;
}

export function signatureConfigJson(config: SignatureConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

export const SIGNATURE_INSTALL = `# Add the renderer dependency used by the live material
pnpm add --save-exact @paper-design/shaders-react@0.0.82

# React and React DOM come from your host application.
# Verified: React 19.3.1 / Next.js 16.4.3 / TypeScript 5.9.3

# Copy components/signature-hero/ (including living-type/) into your project,
# then import { SignatureHero } from "@/components/signature-hero".
#
# The two bundled fonts make no CDN requests. Keep their OFL notices.
# Static motion mode mounts no shader. Reduced motion is respected automatically.`;
