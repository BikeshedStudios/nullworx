import { test, expect } from "@playwright/test";

test("support link goes to Bikeshed Studios", async ({ page }) => {
  await page.goto("/");
  const support = page.getByRole("link", { name: "Support the experiments" }).first();
  await expect(support).toHaveAttribute("href", "https://buymeacoffee.com/bikeshedstudios");
  await expect(support).toHaveAttribute("rel", /noopener/);
});

test("Drops destination doesn't silently collect emails without explicit activation", async ({ page }) => {
  await page.goto("/drops");
  await expect(page.getByRole("heading", { name: "Get Nullworx Drops" })).toBeVisible();
  const input = page.getByRole("textbox", { name: "Email address" });
  await expect(input).toHaveCount(0);
  await expect(page.getByText("Signups are not active yet.", { exact: false })).toBeVisible();
});
