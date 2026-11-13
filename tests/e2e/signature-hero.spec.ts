import { test, expect } from "@playwright/test";

test("Signature Hero is a live component for Cobalt, Carbon and Porcelain", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto("/kits/signature-hero?preset=cobalt");
  expect(response?.status()).toBe(200);
  await expect(page.locator('[data-signature-hero="cobalt"]')).toBeVisible();
  await page.goto("/kits/signature-hero?preset=carbon");
  await expect(page.locator('[data-signature-hero="carbon"]')).toBeVisible();
  await page.goto("/kits/signature-hero?preset=porcelain");
  await expect(page.locator('[data-signature-hero="porcelain"]')).toBeVisible();
  await page.goto("/kits/signature-hero?preset=cobalt");
  await expect(page.locator('[data-signature-hero="cobalt"]')).toBeVisible();
  await expect(page.locator("[data-signature-hero] img")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: /Three directions/ })).toBeVisible();
  const robots = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("content") ?? ""));
  expect(robots.length).toBeGreaterThan(0);
  expect(robots.every(value => value.includes("noindex"))).toBe(true);

  await page.getByRole("button", { name: /carbon/i }).click();
  await expect(page.locator('[data-signature-hero="carbon"]')).toBeVisible();
  expect(page.url()).toContain("preset=carbon");
  await page.getByRole("button", { name: /porcelain/i }).click();
  await expect(page.locator('[data-signature-hero="porcelain"]')).toBeVisible();
  expect(page.url()).toContain("preset=porcelain");

  await page.getByRole("tab", { name: "Customize" }).click();
  await page.getByRole("textbox", { name: /Wordmark/ }).fill("FIELD");
  await page.getByRole("textbox", { name: /^Brand/ }).fill("Field Studio");
  await expect(page.locator("[data-signature-hero]")).toContainText("Field Studio");
  await expect(page.locator("[data-signature-hero]")).toContainText("FIELD");
  await page.getByLabel("accent color").evaluate((element) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, "#ffcc00");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(await page.locator("[data-signature-hero]").evaluate(element => getComputedStyle(element).getPropertyValue("--sh-accent"))).toBe("#ffcc00");

  await page.getByRole("tab", { name: "Code" }).click();
  await expect(page.locator("pre").first()).toContainText('wordmark": "FIELD"');
  await expect(page.locator("pre").first()).toContainText('preset="porcelain"');
  await page.getByRole("tab", { name: "Share" }).click();
  const share = page.getByLabel("Shareable URL");
  await expect(share).toHaveValue(/preset=porcelain/);
  await expect(share).toHaveValue(/wordmark=FIELD/);

  const shareHref = await share.inputValue();
  await page.goto(shareHref);
  await expect(page.locator('[data-signature-hero="porcelain"]')).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Wordmark/ })).toBeHidden();
  await page.getByRole("tab", { name: "Customize" }).click();
  await expect(page.getByRole("textbox", { name: /Wordmark/ })).toHaveValue("FIELD");
  expect(errors).toEqual([]);
});

test("Signature Hero pointer light and reduced-motion state are real", async ({ page }) => {
  await page.goto("/kits/signature-hero?preset=cobalt");
  const hero = page.locator("[data-signature-hero]");
  await expect(hero).toHaveAttribute("data-pointer", "active");
  const box = await hero.boundingBox();
  expect(box).not.toBeNull();
  if (box) await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.25);
  await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-signature-hero]")!).getPropertyValue("--sh-px").trim() !== "50.00%");
  const px = await hero.evaluate(element => getComputedStyle(element).getPropertyValue("--sh-px"));
  expect(px.trim()).not.toBe("50.00%");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator("[data-signature-hero]")).toHaveAttribute("data-motion", "static");
  await expect(page.locator("[data-signature-hero] canvas")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /still composition/i })).toBeDisabled();
});

test("Signature Hero is responsive at 390px without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kits/signature-hero?preset=cobalt");
  await expect(page.locator("[data-signature-hero]")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole("button", { name: "Mobile 390" }).click();
  await expect(page.locator('[data-viewport="mobile"]').first()).toBeVisible();
});

test("static Signature Hero images and public assets remain excluded", async ({ request }) => {
  for (const preset of ["carbon", "cobalt", "porcelain"]) for (const width of [1440, 390]) {
    const image = await request.get(`/signature-hero-01/${preset}-${width}.png`);
    expect(image.status()).toBe(404);
  }
  const sitemap = await request.get("/sitemap.xml");
  const body = await sitemap.text();
  expect((body.match(/<loc>/g) ?? [])).toHaveLength(10);
  expect(body).not.toContain("signature-hero");
});
