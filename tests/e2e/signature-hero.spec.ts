import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const route = "/kits/signature-hero";
const output = path.resolve(process.env.SIGNATURE_REVIEW_DIR ?? "evidence/signature-hero-01");
const receipt = JSON.parse(readFileSync("docs/signature-hero-01/PREVIEW_RECEIPT.json", "utf8")) as {
  assets: { path: string; sha256: string; width: number; height: number; preset: string; viewport: number }[];
};

test("Signature Hero serves exactly the six approved bytes and stays outside discovery and commerce", async ({ page, request }) => {
  expect((await page.goto(route))?.status()).toBe(200);
  await expect(page.locator("main article")).toHaveCount(3);
  await expect(page.locator("main h3")).toHaveText(["Carbon", "Porcelain", "Cobalt"]);
  await expect(page.locator("main img")).toHaveCount(6);
  for (const asset of receipt.assets) {
    const url = "/" + asset.path.replace(/^public\//, "");
    const response = await request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    expect(createHash("sha256").update(await response.body()).digest("hex")).toBe(asset.sha256);
    const image = page.locator(`main img[src="${url}"]`);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element: HTMLImageElement) => element.decode());
    expect(await image.evaluate((element: HTMLImageElement) => [element.naturalWidth, element.naturalHeight])).toEqual([asset.width, asset.height]);
    await expect(image).toHaveAttribute("width", String(asset.width));
    await expect(image).toHaveAttribute("height", String(asset.height));
    await expect(image.locator("..")).toHaveAttribute("href", url);
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await expect(page.locator('meta[name="googlebot"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://nullworx.space" + route);
  await expect(page.locator("main")).not.toContainText(/[€$£]\s*\d|\d\s*(EUR|USD|GBP)/);
  await expect(page.locator('main form, main button, [data-bento-checkout], [download], a[href*="gumroad.com"], a[href*="checkout"]')).toHaveCount(0);
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(jsonLd.join(" ")).not.toMatch(/"(?:Product|Offer|offers|price)"/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect([...xml.matchAll(/<loc>/g)]).toHaveLength(10);
  expect(xml).not.toContain(route);
  for (const source of ["/", "/effects"]) {
    await page.goto(source);
    await expect(page.locator(`a[href="${route}"]`)).toHaveCount(0);
  }
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  for (const width of [320, 390, 768, 1440]) {
    test(`Signature Hero ${width}px ${reducedMotion}: accessible complete captures and no overflow`, async ({ page }) => {
      await mkdir(output, { recursive: true });
      await page.setViewportSize({ width, height: width >= 768 ? 980 : 844 });
      await page.emulateMedia({ reducedMotion });
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      page.on("requestfailed", request => errors.push(`${request.failure()?.errorText} ${request.url()}`));
      expect((await page.goto(route))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      for (const image of await page.locator("main img").all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((element: HTMLImageElement) => element.decode());
        const dimensions = await image.evaluate((element: HTMLImageElement) => {
          const box = element.getBoundingClientRect();
          return { left: box.left, right: box.right, width: box.width, height: box.height, ratio: element.naturalWidth / element.naturalHeight, fit: getComputedStyle(element).objectFit };
        });
        expect(dimensions.left).toBeGreaterThanOrEqual(0);
        expect(dimensions.right).toBeLessThanOrEqual(width + 1);
        expect(dimensions.width / dimensions.height).toBeCloseTo(dimensions.ratio, 2);
        expect(dimensions.fit).not.toBe("cover");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      // Detect clipped children too; overflow:clip alone must not hide a layout defect.
      const overflow = await page.locator("main *").evaluateAll(elements => elements.filter(element => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && (box.left < -1 || box.right > innerWidth + 1);
      }).map(element => element.outerHTML.slice(0, 180)));
      expect(overflow).toEqual([]);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
      expect(violations).toEqual([]);
      if (reducedMotion === "reduce") {
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
        expect(await page.locator("main").evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
        await expect(page.locator("main a").first()).toHaveCSS("transition-duration", "0s");
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: path.join(output, `showcase-${width}-${reducedMotion}.png`), fullPage: true });
      await writeFile(path.join(output, `showcase-${width}-${reducedMotion}.json`), JSON.stringify({ width, reducedMotion, violations, overflow, errors }, null, 2) + "\n");
      expect(errors).toEqual([]);
    });
  }
}

test("Signature Hero keyboard links have visible focus and open original captures", async ({ page, context }) => {
  await page.goto(route);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.keyboard.press("Tab");
  const explore = page.getByRole("link", { name: "Explore the directions" });
  await expect(explore).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#directions$/);
  for (const link of await page.locator("main a").all()) {
    await link.focus();
    const focus = await link.evaluate(element => ({ visible: element.matches(":focus-visible"), style: getComputedStyle(element).outlineStyle, width: parseFloat(getComputedStyle(element).outlineWidth) }));
    expect(focus.visible && focus.style !== "none" && focus.width >= 2).toBe(true);
    await page.keyboard.press("Tab");
    await expect(link).not.toBeFocused();
  }
  const preview = page.getByRole("link", { name: "Open full-size desktop preview of Carbon" });
  await preview.focus();
  // A computed outline is insufficient when a clipping ancestor hides it.
  expect(await preview.evaluate(element => {
    for (let parent = element.parentElement; parent && parent.tagName !== "MAIN"; parent = parent.parentElement) {
      if (["hidden", "clip"].includes(getComputedStyle(parent).overflow)) return false;
    }
    return true;
  })).toBe(true);
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: path.join(output, "keyboard-preview-focus-1440.png") });
  const popupPromise = context.waitForEvent("page");
  await page.keyboard.press("Enter");
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(new URL(popup.url()).pathname).toBe("/signature-hero-01/carbon-1440.png");
  await popup.close();
  for (const destination of ["/kits/bento-duo", "/effects"]) {
    await page.goto(route);
    await page.locator(`main a[href="${destination}"]`).click();
    await expect(page).toHaveURL(new RegExp(destination + "$"));
  }
});

test("Signature Hero exposes no private package, source, fonts, or source maps", async ({ page, request }) => {
  const html = await request.get(route);
  const text = await html.text();
  expect(text).not.toMatch(/@nullworx\/signature-hero|\.tgz|\.tar\.gz|COMMERCIAL_LICENSE_DRAFT|signature-presets\.ts|signature-hero\.tsx/);
  for (const privatePath of [
    "/signature-hero-01/src/signature-hero.tsx",
    "/signature-hero-01/src/signature-presets.ts",
    "/signature-hero-01/instrument-serif-latin-400-italic.woff2",
    "/signature-hero-01/README.md",
    "/signature-hero-01/nullworx-signature-hero-01-1.0.0-rc.1.tgz",
    "/signature-hero-01/signature-hero-01-1.0.0-rc.1-source.tar.gz",
    "/drafts/premium-release-candidate-01/APPROVED_BASELINE.json",
    "/specimens/signature-hero-01/src/signature-hero.tsx",
  ]) expect((await request.get(privatePath)).status()).toBe(404);
  await page.goto(route);
  for (const script of await page.locator('script[src^="/_next/"]').all()) {
    const src = (await script.getAttribute("src"))!;
    const response = await request.get(src);
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toMatch(/sourceMappingURL=|@nullworx\/signature-hero|COMMERCIAL_LICENSE_DRAFT/);
    expect((await request.get(src + ".map")).status()).toBe(404);
  }
});
