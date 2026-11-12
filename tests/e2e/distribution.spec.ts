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

test("published Bento Duo is discoverable but the premium files are not public", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Explore Bento Duo" })).toHaveAttribute("href", "/kits/bento-duo");
  await page.goto("/kits/bento-duo");
  await expect(page.getByRole("heading", { name: /Two ways to/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Orbit Bento 02" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Foil Reactor" })).toBeVisible();
  const checkout = page.locator("[data-bento-checkout]").first();
  await expect(checkout).toHaveAttribute("href", "https://bikeshedstudios.gumroad.com/l/dordxw");
  await expect(checkout).toHaveAttribute("target", "_blank");
  await expect(checkout).toHaveAttribute("rel", "noopener noreferrer");
  await expect(page.getByText(/MIT-licensed/).first()).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(4);
  const pathNames = await page.locator("main a[href]").evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute("href")));
  expect(pathNames.some((value) => !!value && /\.(tgz|zip)(\?|$)/i.test(value))).toBe(false);
  if (isMobile) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test("Bento Duo keeps the separate unpublished Creator Pack invisible", async ({ page }) => {
  await page.goto("/kits/bento-duo");
  await expect(page.locator('[href="https://bikeshedstudios.gumroad.com/l/lkcagw"]')).toHaveCount(0);
  await expect(page.locator("[data-bento-checkout]")).toHaveCount(2);
});
