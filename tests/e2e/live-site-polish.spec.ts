import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const evidence = process.env.POLISH_EVIDENCE ?? "evidence/live-site-polish";
async function frame(canvas: Locator) {
  const png = await canvas.evaluate(element => (element as HTMLCanvasElement).toDataURL());
  return createHash("sha256").update(png).digest("hex");
}

const slugs = ["magnetic-focus", "glyph-morph", "prism-text", "ascii-waves", "ashfall-type", "seam-erosion", "sediment-reveal"];

for (const width of [360, 390, 430, 1440]) test.describe(`${width}px`, () => {
  test.use({ viewport: { width, height: width > 600 ? 1000 : 844 }, isMobile: width < 600, hasTouch: width < 600 });

  test("real previews, branding, navigation, contrast and layout", async ({ page, browserName }) => {
    test.setTimeout(120_000);
    const errors: string[] = [], failures: string[] = [], media: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("response", response => { if (response.status() >= 400) failures.push(response.status() + " " + response.url()); });
    page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/media/")) media.push(request.url()); });
    mkdirSync(evidence, { recursive: true });
    const shot = (name: string) => path.join(evidence, `${browserName}-${name}-${width}.png`);
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("link", { name: "nullworx.space home" })).toBeVisible();
    await expect(page).toHaveTitle("nullworx.space — UI Forge React effects");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://nullworx.space");
    await expect(page.locator('meta[name="publisher"]')).toHaveAttribute("content", "Bikeshed Studios");
    await page.screenshot({ path: shot("home") });
    const hero = page.locator("[data-procedural-ascii]").first();
    await hero.scrollIntoViewIfNeeded();
    await expect(hero).toHaveAttribute("data-playing", "true");
    const before = await hero.getAttribute("data-time");
    await expect.poll(() => hero.getAttribute("data-time")).not.toBe(before);
    const image = await hero.locator("canvas").evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL());
    await page.waitForTimeout(180);
    expect(await hero.locator("canvas").evaluate(canvas => (canvas as HTMLCanvasElement).toDataURL())).not.toBe(image);
    await page.getByRole("button", { name: "Pause animation", exact: true }).click();
    await expect(hero).toHaveAttribute("data-playing", "false");
    const held = await hero.getAttribute("data-time");
    await page.waitForTimeout(180); expect(await hero.getAttribute("data-time")).toBe(held);
    await page.getByRole("button", { name: "Play animation", exact: true }).click();
    await expect(hero).toHaveAttribute("data-playing", "true");
    await hero.screenshot({ path: shot("ascii") });
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(hero).toHaveAttribute("data-playing", "false");
    const offscreen = await hero.getAttribute("data-time");
    await page.waitForTimeout(180); expect(await hero.getAttribute("data-time")).toBe(offscreen);
    await page.goto("/effects");
    await expect(page).toHaveTitle("UI Forge effect gallery — nullworx.space");
    await expect(page.locator("article")).toHaveCount(7);
    await expect(page.locator('a[href*="digital-wake"],a[href^="/lab/"]')).toHaveCount(0);
    for (const id of ["magnetic", "glyph", "prism", "ascii", "ashfall", "seam", "sediment"]) {
      const preview = page.locator(`[data-live-preview="${id}"]`);
      await preview.scrollIntoViewIfNeeded();
      await expect(preview).toHaveAttribute("data-playing", "true");
      if (["ashfall", "seam", "sediment"].includes(id)) {
        const surface = preview.locator("[data-material-surface]");
        await expect(surface).toHaveAttribute("data-ready", "true");
        await expect(preview.locator("a:visible")).toHaveCount(0);
        await preview.getByRole("button", { name: /^Replay/ }).click();
        await expect.poll(() => surface.getAttribute("data-elapsed").then(Number)).toBeGreaterThan(1400);
        const original = await frame(surface.locator("canvas"));
        await expect.poll(() => frame(surface.locator("canvas"))).not.toBe(original);
        await preview.getByRole("button", { name: /^Pause/ }).click();
        const elapsed = await surface.getAttribute("data-elapsed");
        await page.waitForTimeout(180); expect(await surface.getAttribute("data-elapsed")).toBe(elapsed);
        await preview.screenshot({ path: shot(id) });
      } else if (id === "magnetic") {
        await preview.getByRole("button", { name: "COME CLOSER" }).click();
        await expect(preview.getByRole("button", { name: "YOU FOUND IT" })).toBeVisible();
      } else if (id === "glyph") {
        await preview.getByRole("button", { name: /^Replay/ }).click();
        await expect.poll(() => preview.locator('[data-testid="glyph-morph-visible"]').textContent()).not.toBe("MAKE / MARK");
        await expect(preview.locator('[data-testid="glyph-morph-visible"]')).toHaveText("MAKE / MARK");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: shot("gallery"), fullPage: true });
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    if (width < 600) {
      await page.getByLabel("Open navigation").click();
      await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Live playground" }).click();
    } else await page.getByRole("navigation", { name: "Primary navigation", exact: true }).getByRole("link", { name: "Playground" }).click();
    await expect(page).toHaveURL(/\/effects\/magnetic-focus$/);
    for (const slug of slugs) {
      const r = await page.request.get("/effects/" + slug);
      expect(r.status(), slug).toBe(200);
      expect(await r.text()).toContain('href="https://nullworx.space/effects/' + slug + '"');
    }
    expect(media).toEqual([]); expect(failures).toEqual([]); expect(errors).toEqual([]);
  });
});

test("motion preference and hidden-page lifecycle stop all visible animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.locator("[data-procedural-ascii]").first();
  await hero.scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-reduced", "true");
  await expect(hero).toHaveAttribute("data-playing", "false");
  const still = await hero.getAttribute("data-time");
  await page.waitForTimeout(180); expect(await hero.getAttribute("data-time")).toBe(still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(hero).toHaveAttribute("data-playing", "true");
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { value: true, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(hero).toHaveAttribute("data-playing", "false");
  const hidden = await hero.getAttribute("data-time");
  await page.waitForTimeout(180); expect(await hero.getAttribute("data-time")).toBe(hidden);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { value: false, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(hero).toHaveAttribute("data-playing", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/effects");
  for (const id of ["glyph", "prism", "ascii", "ashfall", "seam", "sediment"]) {
    const preview = page.locator(`[data-live-preview="${id}"]`);
    await preview.scrollIntoViewIfNeeded();
    await expect(preview).toHaveAttribute("data-playing", "false");
    if (["ashfall", "seam", "sediment"].includes(id)) {
      await expect(preview.locator("[data-material-surface]")).toHaveAttribute("data-ready", "true");
      expect(Number(await preview.locator("[data-material-surface]").getAttribute("data-elapsed"))).toBe(0);
    }
    await expect(preview.getByRole("button", { name: /^Pause/ })).toBeDisabled();
  }
});

test("local video autoplay, pause, visibility and blocked-play recovery", async ({ page }) => {
  test.skip(!process.env.POLISH_VIDEO, "Set POLISH_VIDEO to a locally generated test-pattern video, never restricted footage.");
  const uploads: string[] = [];
  page.on("request", request => { if (!["GET", "HEAD"].includes(request.method())) uploads.push(request.url()); });
  await page.goto("/");
  await page.locator("[data-procedural-ascii]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-procedural-ascii]")).toHaveAttribute("data-frame", /^\d+$/);
  await page.getByLabel("ASCII local video").setInputFiles(process.env.POLISH_VIDEO!);
  const field = page.locator("[data-ascii-field]");
  await field.scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(.1);
  expect(await page.locator("video").evaluate(v => ({ muted: (v as HTMLVideoElement).muted, inline: (v as HTMLVideoElement).playsInline }))).toEqual({ muted: true, inline: true });
  await page.getByRole("button", { name: "Pause local video", exact: true }).click();
  const held = await page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime);
  await page.waitForTimeout(180); expect(await page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime)).toBe(held);
  await page.getByRole("button", { name: "Play local video", exact: true }).click();
  await expect.poll(() => page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime)).not.toBe(held);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("video").evaluate(v => (v as HTMLVideoElement).paused)).toBe(true);
  await field.scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("video").evaluate(v => (v as HTMLVideoElement).paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.locator("video").evaluate(v => (v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole("button", { name: "Use procedural animation" }).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException("Gesture required", "NotAllowedError")); });
  await page.getByLabel("ASCII local video").setInputFiles(process.env.POLISH_VIDEO!);
  await expect(page.locator("[data-ascii-field]")).toHaveAttribute("data-phase", "blocked");
  await expect(page.getByRole("button", { name: "Start local video" })).toBeVisible();
  expect(uploads).toEqual([]);
});
