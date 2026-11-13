import { test, expect } from "@playwright/test";

// Owner-scoped release exclusion: reference captures are preserved in 882f194.
test("unfinished static Signature Hero route and assets are not released", async ({ page, request }) => {
  const response = await page.goto("/kits/signature-hero");
  expect(response?.status()).toBe(404);
  await expect(page.locator('[data-signature-hero-showcase]')).toHaveCount(0);
  const robots = await page.locator('meta[name="robots"]').evaluateAll(nodes => nodes.map(node => node.getAttribute("content") ?? ""));
  expect(robots.length).toBeGreaterThan(0);
  expect(robots.every(value => value.includes("noindex"))).toBe(true);
  for (const preset of ["carbon", "cobalt", "porcelain"]) for (const width of [1440, 390]) {
    const image = await request.get(`/signature-hero-01/${preset}-${width}.png`);
    expect(image.status()).toBe(404);
  }
  for (const route of ["/", "/effects", "/kits/bento-duo"]) {
    await page.goto(route);
    await expect(page.locator('a[href*="signature-hero"], img[src*="signature-hero"]')).toHaveCount(0);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(10);
  expect(await sitemap.text()).not.toContain("signature-hero");
});
