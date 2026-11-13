import { z } from "zod";
import { COMPONENT_IDS, type ComponentId } from "./registry";

/**
 * Agent Design DNA — schema 1.0.0.
 *
 * A recipe is data. It cannot carry JSX, HTML, CSS, imports, URLs, event
 * handlers, dependency names or code. The renderer is selected from the
 * registry by component id and an exact compatible version.
 */
export const DESIGN_DNA_SCHEMA_VERSION = "1.0.0" as const;
export const DESIGN_DNA_MAX_BYTES = 256 * 1024;

const noControl = (value: string) => !/[\u0000-\u0009\u000b-\u001f\u007f]/.test(value);
const boundedText = (max: number) => z.string().min(1).max(max).refine(noControl, "control characters are not allowed");
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected a six-digit hex color").transform(value => value.toLowerCase());
const palette = z.object({
  background: hex,
  ink: hex,
  muted: hex,
  accent: hex,
  line: hex,
}).strict();

const signatureTokens = z.object({
  palette: palette.extend({ material: z.tuple([hex, hex, hex, hex]) }).strict(),
  typography: z.object({
    weight: z.union([z.literal(200), z.literal(300), z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800), z.literal(900)]),
    tracking: z.number().finite().min(-0.04).max(0.08),
  }).strict(),
  content: z.object({
    brand: boundedText(40),
    wordmark: z.string().min(2).max(12).regex(/^[A-Za-z0-9][A-Za-z0-9 .&'!?+\-/]*$/, "unsupported wordmark character"),
    counterline: boundedText(60),
    description: boundedText(220),
    primaryLabel: boundedText(40),
  }).strict(),
  motion: z.object({
    mode: z.enum(["auto", "static"]),
    speed: z.number().finite().min(0).max(0.6),
    pointer: z.boolean(),
  }).strict(),
  layout: z.object({ maxWidth: z.number().int().min(640).max(1600) }).strict(),
}).strict();

const orbitPalette = z.object({
  background: hex,
  ink: hex,
  muted: hex,
  line: hex,
}).strict();

const orbitTokens = z.object({
  palette: orbitPalette,
  content: z.object({
    eyebrow: boundedText(60),
    title: boundedText(80),
    subtitle: boundedText(180),
  }).strict(),
  layout: z.object({
    accent: z.enum(["iris", "lagoon"]),
    radius: z.number().int().min(8).max(32),
  }).strict(),
  motion: z.object({ mode: z.enum(["auto", "static"]) }).strict(),
}).strict();

const foilTokens = z.object({
  content: z.object({
    title: boundedText(60),
    subtitle: boundedText(160),
    specimen: z.string().min(1).max(20).regex(/^[A-Za-z0-9 /._-]+$/, "unsupported specimen character"),
  }).strict(),
  layout: z.object({
    material: z.enum(["spectral", "brushed", "oxide"]),
    phase: z.enum(["folded", "annealed"]),
    lightX: z.number().finite().min(0).max(100),
    lightY: z.number().finite().min(0).max(100),
  }).strict(),
  motion: z.object({ mode: z.enum(["auto", "static"]) }).strict(),
}).strict();

const envelope = {
  $schema: z.string().max(240).optional(),
  schemaVersion: z.literal(DESIGN_DNA_SCHEMA_VERSION),
  id: z.string().min(1).max(64).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "expected kebab-case id"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "expected semver"),
  title: z.string().min(1).max(120).refine(noControl, "control characters are not allowed"),
  description: z.string().max(400).refine(noControl, "control characters are not allowed").optional(),
};

const component = (id: ComponentId) => z.object({ id: z.literal(id), version: z.literal("1.0.0") }).strict();

export const signatureRecipeSchema = z.object({
  ...envelope,
  component: component("signature-hero"),
  tokens: signatureTokens,
}).strict();

export const orbitRecipeSchema = z.object({
  ...envelope,
  component: component("orbit-bento"),
  tokens: orbitTokens,
}).strict();

export const foilRecipeSchema = z.object({
  ...envelope,
  component: component("foil-reactor"),
  tokens: foilTokens,
}).strict();

export const designRecipeSchema = z.union([signatureRecipeSchema, orbitRecipeSchema, foilRecipeSchema]);
export type SignatureRecipe = z.infer<typeof signatureRecipeSchema>;
export type OrbitRecipe = z.infer<typeof orbitRecipeSchema>;
export type FoilRecipe = z.infer<typeof foilRecipeSchema>;
export type DesignRecipe = z.infer<typeof designRecipeSchema>;
export type SignatureTokens = SignatureRecipe["tokens"];
export type OrbitTokens = OrbitRecipe["tokens"];
export type FoilTokens = FoilRecipe["tokens"];

export type DesignIssue = { path: string; message: string; code?: string };
export type DesignParseResult =
  | { ok: true; recipe: DesignRecipe }
  | { ok: false; issues: DesignIssue[] };

function structuralIssues(error: z.ZodError): DesignIssue[] {
  return error.issues.map(issue => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
    code: issue.code,
  }));
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(value: string): number {
  const color = value.slice(1);
  return 0.2126 * channel(Number.parseInt(color.slice(0, 2), 16))
    + 0.7152 * channel(Number.parseInt(color.slice(2, 4), 16))
    + 0.0722 * channel(Number.parseInt(color.slice(4, 6), 16));
}

export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

function paletteIssues(p: { background: string; ink: string; accent: string }): DesignIssue[] {
  const issues: DesignIssue[] = [];
  const inkContrast = contrastRatio(p.ink, p.background);
  if (inkContrast < 4.5) {
    issues.push({ path: "tokens.palette.ink", message: `ink/background contrast ${inkContrast.toFixed(2)} is below 4.5:1`, code: "contrast" });
  }
  const accentContrast = contrastRatio(p.accent, p.background);
  if (accentContrast < 2) {
    issues.push({ path: "tokens.palette.accent", message: `accent/background contrast ${accentContrast.toFixed(2)} is below 2:1`, code: "contrast" });
  }
  if (p.ink === p.background) {
    issues.push({ path: "tokens.palette.ink", message: "ink and background cannot be identical", code: "identity" });
  }
  if (p.accent === p.background) {
    issues.push({ path: "tokens.palette.accent", message: "accent and background cannot be identical", code: "identity" });
  }
  return issues;
}

function semanticIssues(recipe: DesignRecipe): DesignIssue[] {
  if (recipe.component.id === "signature-hero") {
    const tokens = recipe.tokens as SignatureTokens;
    return paletteIssues(tokens.palette);
  }
  if (recipe.component.id === "orbit-bento") {
    const tokens = recipe.tokens as OrbitTokens;
    const accent = tokens.layout.accent === "lagoon" ? "#245f51" : "#59468c";
    return paletteIssues({ ...tokens.palette, accent });
  }
  return [];
}

export function parseDesignRecipe(input: unknown): DesignParseResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, issues: [{ path: "(root)", message: "recipe must be a JSON object" }] };
  }
  const candidate = input as Record<string, unknown>;
  if (candidate.schemaVersion !== DESIGN_DNA_SCHEMA_VERSION) {
    return {
      ok: false,
      issues: [{
        path: "schemaVersion",
        message: `Unsupported schema version ${JSON.stringify(candidate.schemaVersion)}. This build accepts ${DESIGN_DNA_SCHEMA_VERSION}; there is no automatic migration for an unknown version.`,
        code: "unsupported-version",
      }],
    };
  }
  const component = candidate.component;
  if (typeof component === "object" && component !== null) {
    const id = (component as Record<string, unknown>).id;
    if (typeof id === "string" && !(COMPONENT_IDS as readonly string[]).includes(id)) {
      return { ok: false, issues: [{ path: "component.id", message: `Unknown component ${JSON.stringify(id)}. Registered: ${COMPONENT_IDS.join(", ")}.`, code: "unknown-component" }] };
    }
    const version = (component as Record<string, unknown>).version;
    if (typeof version === "string" && version !== "1.0.0") {
      return { ok: false, issues: [{ path: "component.version", message: `No compatible renderer for ${JSON.stringify(id)} version ${version}. This build supports 1.0.0.`, code: "version-mismatch" }] };
    }
  }
  const parsed = designRecipeSchema.safeParse(candidate);
  if (!parsed.success) return { ok: false, issues: structuralIssues(parsed.error) };
  const issues = semanticIssues(parsed.data);
  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, recipe: parsed.data };
}

export function parseDesignRecipeJson(text: string): DesignParseResult {
  if (new TextEncoder().encode(text).byteLength > DESIGN_DNA_MAX_BYTES) {
    return { ok: false, issues: [{ path: "(root)", message: `recipe exceeds ${DESIGN_DNA_MAX_BYTES} bytes` }] };
  }
  let value: unknown;
  try { value = JSON.parse(text); }
  catch (error) { return { ok: false, issues: [{ path: "(root)", message: `invalid JSON: ${error instanceof Error ? error.message : String(error)}` }] }; }
  return parseDesignRecipe(value);
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}

/** Deterministic JSON: keys are sorted recursively before serialization. */
export function stringifyDesignRecipe(recipe: DesignRecipe): string {
  return `${JSON.stringify(sortValue(recipe), null, 2)}\n`;
}

/** Explicit version rejection is the migration policy for 1.0.0. */
export function migrateDesignRecipe(input: unknown): DesignParseResult {
  return parseDesignRecipe(input);
}
