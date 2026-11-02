import { expect, test } from "@playwright/test";

const routes = [
  ["ashfall-type", "Ashfall", "AshfallType"],
  ["seam-erosion", "Seam", "SeamErosion"],
  ["sediment-reveal", "Sediment", "SedimentReveal"],
];

test("registry cards open the approved routes with complete source and working comparison settings", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const [slug, title, component] of routes) {
    await page.goto("/effects");
    await expect(page.locator("article h3 a")).toHaveCount(8);
    await page.locator(`article h3 a[href="/effects/${slug}"]`).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
    await expect(page).toHaveTitle(new RegExp(title));
    await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-material-surface]")?.dataset.ready === "true");
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => window.__materialWaveA!.snapshot().phase)).toBe("IDLE");
    await page.evaluate(() => window.__materialWaveA!.seek(0));
    const candidate = await page.locator("[data-material-surface] canvas").evaluateHandle(canvas => {
      const image = canvas as HTMLCanvasElement;
      return { width: image.width, height: image.height, pixels: image.getContext("2d")!.getImageData(0, 0, image.width, image.height).data };
    });
    await page.getByRole("button", { name: "A / Original", exact: true }).click();
    await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-material-surface]")?.dataset.ready === "true");
    // The accepted compositor adds one premultiplied-alpha Canvas copy. Chromium
    // rounds a few translucent text channels by one byte; the art is unchanged.
    const delta = await page.locator("[data-material-surface] canvas").evaluate((canvas, reference) => {
      const image = canvas as HTMLCanvasElement;
      const pixels = image.getContext("2d")!.getImageData(0, 0, image.width, image.height).data;
      let max = 0;
      for (let i = 0; i < pixels.length; i++) max = Math.max(max, Math.abs(pixels[i] - reference.pixels[i]));
      return { max, sameDimensions: image.width === reference.width && image.height === reference.height };
    }, candidate);
    expect(delta.sameDimensions).toBe(true);
    expect(delta.max).toBeLessThanOrEqual(1);
    await candidate.dispose();
    const original = await page.locator("[data-material-surface] canvas").evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL());
    await page.getByRole("button", { name: "B / CSS control", exact: true }).click();
    await page.waitForFunction(() => document.querySelector<HTMLElement>("[data-material-surface]")?.dataset.ready === "true");
    expect(await page.locator("[data-material-surface] canvas").evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL())).toBe(original);
    await page.evaluate(() => window.__materialWaveA!.seek(1700));
    const styles = await page.locator("[data-material-surface] canvas").evaluate(canvas => ({ opacity: getComputedStyle(canvas).opacity, clip: getComputedStyle(canvas).clipPath, mask: getComputedStyle(canvas).maskImage }));
    if (slug === "ashfall-type") expect(Number(styles.opacity)).toBeLessThan(.6);
    if (slug === "seam-erosion") expect(styles.clip).toContain("inset");
    if (slug === "sediment-reveal") {
      expect(styles.mask).toContain("conic-gradient");
      await expect(page.locator("img[data-source]")).toHaveAttribute("src", "/material-wave-a/mineral-study.webp");
    }
    await page.getByRole("tab", { name: "Usage", exact: true }).click();
    await expect(page.locator("#source-panel code")).toContainText(`<${component}`);
    await page.getByRole("button", { name: "Copy example" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(`<${component}`);
    for (const file of ["material-effects/material-components.tsx", "material-effects/presets.ts", "material-core/trigger-clock.ts", "material-core/use-material.ts"]) {
      await page.getByRole("tab", { name: file, exact: true }).click();
      await expect(page.locator("#source-panel code")).not.toBeEmpty();
    }
    await expect(page.locator("[data-material-surface] svg")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("unapproved experiment effects stay outside canonical routes", async ({ request }) => {
  for (const slug of ["particle-morph", "depth-theatre", "scroll-smoosh", "ascii-diffusion", "kintsugi-fracture", "holographic-foil"]) {
    expect((await request.get(`/effects/${slug}`)).status()).toBe(404);
  }
});
