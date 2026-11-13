import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  DESIGN_DNA_MAX_BYTES,
  designRecipeSchema,
  parseDesignRecipe,
  parseDesignRecipeJson,
  stringifyDesignRecipe,
  migrateDesignRecipe,
  type FoilRecipe,
  type OrbitRecipe,
  type SignatureRecipe,
} from "../../lib/design-dna/schema";
import { COMPONENT_IDS, componentContract } from "../../lib/design-dna/registry";
import { foilReactorProps, orbitBentoProps, signatureHeroProps } from "../../lib/design-dna/adapters";
import { installInstructions, integrationSnippet } from "../../lib/design-dna/snippets";

const validDir = "fixtures/design-dna/valid";
const invalidDir = "fixtures/design-dna/invalid";
const read = (file: string) => readFileSync(file, "utf8");
const validFiles = readdirSync(validDir).sort();
const invalidFiles = readdirSync(invalidDir).sort();

describe("Agent Design DNA 1.0.0", () => {
  it("keeps exactly the reviewed fixture inventory", () => {
    expect(validFiles).toHaveLength(10);
    expect(invalidFiles).toHaveLength(12);
  });

  it.each(validFiles)("accepts and round-trips %s", file => {
    const first = parseDesignRecipeJson(read(join(validDir, file)));
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const serialized = stringifyDesignRecipe(first.recipe);
    const second = parseDesignRecipeJson(serialized);
    expect(second).toEqual(first);
    expect(serialized).toBe(stringifyDesignRecipe(second.ok ? second.recipe : first.recipe));
    expect(serialized.endsWith("\n")).toBe(true);
  });

  it.each(invalidFiles)("rejects %s with a path", file => {
    const result = parseDesignRecipeJson(read(join(invalidDir, file)));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].path.length).toBeGreaterThan(0);
  });

  it("rejects unknown components and versions before rendering", () => {
    const unknown = parseDesignRecipe({ schemaVersion: "1.0.0", component: { id: "freeform", version: "1.0.0" } });
    expect(unknown.ok).toBe(false);
    if (!unknown.ok) expect(unknown.issues[0].code).toBe("unknown-component");
    const old = parseDesignRecipe({ schemaVersion: "1.0.0", component: { id: "signature-hero", version: "0.9.0" } });
    expect(old.ok).toBe(false);
    if (!old.ok) expect(old.issues[0].code).toBe("version-mismatch");
    const future = migrateDesignRecipe({ schemaVersion: "2.0.0" });
    expect(future.ok).toBe(false);
    if (!future.ok) expect(future.issues[0].code).toBe("unsupported-version");
  });

  it("is deterministic across key order", () => {
    const value = JSON.parse(read(join(validDir, "signature-cobalt.json")));
    const parsed = parseDesignRecipe(value);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const reversed = Object.fromEntries(Object.entries(value).reverse());
    const reparsed = parseDesignRecipe(reversed);
    expect(reparsed.ok).toBe(true);
    if (!reparsed.ok) return;
    expect(stringifyDesignRecipe(reparsed.recipe)).toBe(stringifyDesignRecipe(parsed.recipe));
  });

  it("rejects oversized, malformed and code-shaped input", () => {
    expect(parseDesignRecipeJson("{").ok).toBe(false);
    expect(parseDesignRecipeJson("x".repeat(DESIGN_DNA_MAX_BYTES + 1)).ok).toBe(false);
    const base = JSON.parse(read(join(validDir, "signature-cobalt.json"))) as Record<string, unknown>;
    for (const extra of ["imports", "code", "html", "css", "script", "dependencies"]) {
      expect(parseDesignRecipe({ ...base, [extra]: "<script>alert(1)</script>" }).ok).toBe(false);
    }
    expect(designRecipeSchema.safeParse({ ...base, tokens: { ...(base.tokens as Record<string, unknown>), palette: { ...((base.tokens as Record<string, unknown>).palette as Record<string, unknown>), ink: "red" } } }).success).toBe(false);
  });

  it("maps every component to its actual public props", () => {
    for (const file of validFiles) {
      const parsed = parseDesignRecipeJson(read(join(validDir, file)));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) continue;
      if (parsed.recipe.component.id === "signature-hero") expect(["cobalt", "carbon", "porcelain"]).toContain(signatureHeroProps(parsed.recipe as SignatureRecipe).preset);
      if (parsed.recipe.component.id === "orbit-bento") expect(orbitBentoProps(parsed.recipe as OrbitRecipe).initialRadius).toBeGreaterThanOrEqual(8);
      if (parsed.recipe.component.id === "foil-reactor") expect(foilReactorProps(parsed.recipe as FoilRecipe).initialLight?.x).toBeGreaterThanOrEqual(0);
    }
  });

  it("generates runnable, dependency-explicit snippets without executable payloads", () => {
    for (const file of validFiles) {
      const parsed = parseDesignRecipeJson(read(join(validDir, file)));
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) continue;
      const snippet = integrationSnippet(parsed.recipe);
      const install = installInstructions(parsed.recipe);
      expect(snippet).toContain(componentContract(parsed.recipe.component.id).label.split(" ")[0]);
      expect(snippet).not.toMatch(/<script|javascript:|eval\(|new Function/);
      for (const dependency of componentContract(parsed.recipe.component.id).dependencies) {
        expect(install).toContain(dependency);
      }
      expect(install).toContain("Compatible component version: 1.0.0");
    }
  });

  it("registers exactly the supported component ids", () => {
    expect(COMPONENT_IDS).toEqual(["signature-hero", "orbit-bento", "foil-reactor"]);
    for (const id of COMPONENT_IDS) {
      expect(componentContract(id).version).toBe("1.0.0");
      expect(componentContract(id).dependencies.length).toBeGreaterThan(0);
    }
  });
});
