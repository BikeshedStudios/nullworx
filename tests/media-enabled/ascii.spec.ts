import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Run against a separate fixture-configured build. Never a hosting receipt.
test("enabled deployment uses exact fish bytes, attribution and honest missing-media fallback", async ({ page }) => {
  const path = process.env.ASCII_TEST_VIDEO;
  expect(path, "ASCII_TEST_VIDEO must identify accepted local LOOP30").toBeTruthy();
  const bytes = await readFile(path!);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe("807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238");
  await page.route("**/media/ascii/loop30-v2-807bb27e.mp4", route => route.fulfill({ body: bytes, contentType: "video/mp4" }));
  for (const route of ["/", "/effects/ascii-waves"]) {
    await page.goto(route);
    const field = page.locator("[data-ascii-field]");
    await field.scrollIntoViewIfNeeded();
    await expect(field).toHaveAttribute("data-phase", "live");
    await expect(page.getByLabel("local video character detail")).toHaveValue("12");
    await expect(page.locator("[data-ascii-attribution]")).toContainText("Animal Exploration Project");
    await expect(page.locator("[data-ascii-attribution]")).toContainText("No endorsement");
    await expect(page.locator("[data-ascii-attribution] a").first()).toHaveAttribute("href", "https://www.youtube.com/watch?v=B30S0Vr9N9A&t=3512s");
  }
  await page.unrouteAll();
  await page.route("**/media/ascii/loop30-v2-807bb27e.mp4", route => route.fulfill({ status: 404 }));
  await page.reload();
  await expect(page.locator("[data-procedural-ascii]")).toBeVisible();
  await expect(page.getByText(/Featured fish video is unavailable/)).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByLabel("ASCII local video").setInputFiles(path!);
  await page.locator("[data-ascii-field]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-ascii-field]")).toHaveAttribute("data-phase", "live");
  await expect(page.locator("[data-ascii-attribution]")).toHaveCount(0);
});
