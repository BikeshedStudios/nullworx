import { test, expect } from "@playwright/test";

test("Bento Duo product page mounts both real interactive kits", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/kits/bento-duo");
  await expect(page.locator("[data-live-kit='orbit']")).toBeVisible();
  await expect(page.locator("[data-live-kit='foil']")).toBeVisible();
  await expect(page.locator("main img[src*='previews']")).toHaveCount(0);

  const orbit = page.locator("[data-live-kit='orbit']");
  await orbit.getByRole("button", { name: /Common ground/i }).first().click();
  await expect(orbit.locator("[data-live-receipt]")).toContainText("common selected");
  await orbit.getByRole("checkbox").nth(1).click();
  await expect(orbit.getByText(/completed\./).first()).toBeVisible();

  const foil = page.locator("[data-live-kit='foil']");
  await foil.getByRole("button", { name: /Brushed alloy/i }).click();
  await expect(foil.locator("[data-live-receipt]")).toContainText("brushed");
  const surface = foil.locator("[data-material='brushed']").first();
  await expect(surface).toBeVisible();
  await foil.getByRole("button", { name: /Release/i }).click();
  await expect(foil.locator("[data-live-receipt]")).toContainText("annealed");
  expect(errors).toEqual([]);
});

test("Bento Duo is live and responsive at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kits/bento-duo");
  await expect(page.locator("[data-live-kit='orbit']")).toBeVisible();
  await expect(page.locator("[data-live-kit='foil']")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("homepage Bento teaser is interactive, not a screenshot", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-teaser='orbit']")).toBeVisible();
  await expect(page.locator("[data-teaser='foil']")).toBeVisible();
  await expect(page.locator("[data-teaser] img")).toHaveCount(0);
  await page.locator("[data-teaser='orbit']").getByRole("button", { name: /Still objects/i }).first().click();
  await expect(page.locator("[data-teaser='orbit']")).toContainText("Still objects");
  await page.locator("[data-teaser='foil']").getByRole("button", { name: /Oxide bloom/i }).click();
  await expect(page.locator("[data-teaser='foil'] [data-material='oxide']").first()).toBeVisible();
});
