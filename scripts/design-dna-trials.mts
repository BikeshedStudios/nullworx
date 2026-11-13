/**
 * Two independent agent-style Design DNA trials.
 *
 * Each trial starts from a pinned fixture, applies a small dot-path patch,
 * validates it, mounts the real component in the lab, screenshots it, then
 * proves a forbidden modification is rejected without replacing the preview.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { parseDesignRecipe, stringifyDesignRecipe, type DesignRecipe } from "../lib/design-dna/schema";

type Trial = {
  id: string;
  agent: string;
  goal: string;
  base: string;
  changes: Record<string, unknown>;
  rationale: string;
  forbidden: Record<string, unknown>;
};

const root = process.cwd();
const trials = JSON.parse(readFileSync("fixtures/design-dna/trials.json", "utf8")) as Trial[];
const baseUrl = process.env.DNA_BASE_URL ?? "http://127.0.0.1:3213";
const output = process.env.DNA_OUTPUT ?? join(root, "evidence/design-dna-trials");
mkdirSync(output, { recursive: true });

function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  let cursor: Record<string, unknown> = target;
  for (const part of parts.slice(0, -1)) {
    const next = cursor[part];
    if (typeof next !== "object" || next === null || Array.isArray(next)) throw new Error(`Trial path is not an object: ${path}`);
    cursor = next as Record<string, unknown>;
  }
  cursor[parts.at(-1)!] = value;
}

function apply(base: Record<string, unknown>, changes: Record<string, unknown>): Record<string, unknown> {
  const clone = structuredClone(base);
  for (const [path, value] of Object.entries(changes)) setPath(clone, path, value);
  return clone;
}

const browser = await chromium.launch({
  headless: true,
  args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader", "--disable-dev-shm-usage"],
});
const results: Record<string, unknown>[] = [];

for (const trial of trials) {
  const base = JSON.parse(readFileSync(join("fixtures/design-dna/valid", trial.base), "utf8")) as Record<string, unknown>;
  const candidate = apply(base, trial.changes);
  const parsed = parseDesignRecipe(candidate);
  if (!parsed.ok) throw new Error(`${trial.id} was rejected: ${JSON.stringify(parsed.issues)}`);
  const recipe: DesignRecipe = parsed.recipe;
  const canonical = stringifyDesignRecipe(recipe);

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${baseUrl}/lab/design-dna`, { waitUntil: "networkidle" });
  const editor = page.getByLabel("Design DNA recipe JSON");
  await editor.fill(canonical);
  await page.getByRole("button", { name: "Validate + apply" }).click();
  await page.getByText(/^Valid .* recipe/).waitFor();
  const preview = page.locator(`[data-dna-preview='${recipe.component.id}']`);
  await preview.waitFor();
  const visual = await preview.evaluate(element => {
    const hero = element.querySelector<HTMLElement>("[data-signature-hero]");
    const orbit = element.querySelector<HTMLElement>("[data-accent]");
    const style = getComputedStyle(element);
    return {
      signaturePreset: hero?.dataset.signatureHero ?? null,
      signatureAccent: hero ? getComputedStyle(hero).getPropertyValue("--sh-accent").trim() : null,
      orbitAccent: orbit?.dataset.accent ?? null,
      radius: orbit ? getComputedStyle(orbit).getPropertyValue("--radius").trim() : style.getPropertyValue("--radius").trim(),
      previewWidth: Math.round(element.getBoundingClientRect().width),
      canvasCount: element.querySelectorAll("canvas").length,
    };
  });
  const screenshot = join(output, `${trial.id}-accepted.png`);
  await preview.screenshot({ path: screenshot });

  const forbidden = apply(candidate, trial.forbidden);
  await editor.fill(`${JSON.stringify(forbidden, null, 2)}\n`);
  await page.getByRole("button", { name: "Validate + apply" }).click();
  await page.getByText(/^Rejected/).waitFor();
  const issues = await page.locator("[aria-label='Validation issues']").innerText();
  const retained = await preview.isVisible();
  const forbiddenScreenshot = join(output, `${trial.id}-rejected.png`);
  await page.screenshot({ path: forbiddenScreenshot });

  results.push({
    id: trial.id,
    agent: trial.agent,
    goal: trial.goal,
    base: `fixtures/design-dna/valid/${trial.base}`,
    baseSha256: createHash("sha256").update(readFileSync(join("fixtures/design-dna/valid", trial.base))).digest("hex"),
    changes: trial.changes,
    rationale: trial.rationale,
    accepted: {
      canonical,
      sha256: createHash("sha256").update(canonical).digest("hex"),
      validation: "PASS",
      component: recipe.component,
      visual,
      screenshot,
    },
    forbidden: {
      patch: trial.forbidden,
      result: "REJECTED",
      issues,
      lastValidPreviewRetained: retained,
      screenshot: forbiddenScreenshot,
    },
    pageErrors: errors,
  });
  await context.close();
}
await browser.close();
writeFileSync(join(output, "trials.json"), `${JSON.stringify({ recordedAt: new Date().toISOString(), baseUrl, results }, null, 2)}\n`);
console.log(`Wrote ${results.length} trials to ${join(output, "trials.json")}`);
