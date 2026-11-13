import { test, expect } from "@playwright/test";

test("Design DNA validates, rejects and previews real components", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/lab/design-dna");
  await expect(page.locator("[data-dna-preview='signature-hero'] [data-signature-hero]")).toBeVisible();
  const robots = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("content") ?? ""));
  expect(robots.every(value => value.includes("noindex"))).toBe(true);

  await page.getByRole("button", { name: /Orbit Bento 02/i }).click();
  await expect(page.locator("[data-dna-preview='orbit-bento']")).toBeVisible();
  const editor = page.getByLabel("Design DNA recipe JSON");
  const original = await editor.inputValue();
  await editor.fill(original.replace('"radius": 12', '"radius": 80'));
  await page.getByRole("button", { name: "Validate + apply" }).click();
  await expect(page.getByRole("status").first()).toContainText("Rejected");
  await expect(page.locator("[aria-label='Validation issues']")).toContainText("tokens.layout.radius");
  await expect(page.locator("[data-dna-preview='orbit-bento']")).toBeVisible();

  await editor.fill(original.replace('"radius": 12', '"radius": 28'));
  await page.getByRole("button", { name: "Validate + apply" }).click();
  await expect(page.getByRole("status").first()).toContainText("Valid Orbit Bento 02 recipe");
  await expect(page.locator("[data-dna-preview='orbit-bento']").getByRole("button").first()).toBeVisible();

  await page.getByRole("button", { name: /Foil Reactor/i }).click();
  await expect(page.locator("[data-dna-preview='foil-reactor']")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Design DNA import rejects a schema from the future", async ({ page }) => {
  await page.goto("/lab/design-dna");
  const editor = page.getByLabel("Design DNA recipe JSON");
  const original = await editor.inputValue();
  await editor.fill(original.replace('"schemaVersion": "1.0.0"', '"schemaVersion": "2.0.0"'));
  await page.getByRole("button", { name: "Validate + apply" }).click();
  await expect(page.getByRole("status").first()).toContainText("Rejected");
  await expect(page.locator("[aria-label='Validation issues']")).toContainText("schemaVersion");
});
