import { expect, test, type Page } from "@playwright/test";

const path = "/effects/ashfall-type";
const slugs: Record<string, string> = { ashfall: "ashfall-type", seam: "seam-erosion", sediment: "sediment-reveal" };
async function select(page: Page, kind: string) {
  await page.getByTestId(`select-${kind}`).click();
  await expect(page).toHaveURL(new RegExp(`/effects/${slugs[kind]}$`));
  await ready(page);
}
const surface = "[data-material-surface]";
async function ready(page: Page) {
  await expect(page.locator(surface)).toHaveAttribute("data-ready", "true");
  await page.waitForFunction(() => Boolean(window.__materialWaveA?.snapshot().renderer));
}
async function snap(page: Page) { return page.evaluate(() => window.__materialWaveA!.snapshot()); }
async function seek(page: Page, ms: number) { await page.evaluate(ms => window.__materialWaveA!.seek(ms), ms); }
async function frame(page: Page) { return page.locator(`${surface} canvas`).evaluate(c => (c as HTMLCanvasElement).toDataURL()); }
async function center(page: Page) {
  await page.evaluate(() => {
    const lane = document.querySelector("[data-scroll-lane]")!;
    window.scrollTo({ top: lane.getBoundingClientRect().top + scrollY - 84, behavior: "instant" });
  });
}

test("all three sources lose real alpha, valid pixel births, deterministic replay and clean endings", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(path);
  for (const kind of ["ashfall", "seam", "sediment"]) {
    await select(page, kind); await center(page);
    await page.evaluate(() => window.__materialWaveA!.reset());
    const original = await frame(page), before = await snap(page);
    expect(await page.locator(`${surface} [data-source]`).evaluate(element => getComputedStyle(element).opacity)).toBe("0");
    expect(before.renderer!.invalidBirths).toBe(0);
    if (kind === "ashfall") expect(before.renderer!.partialAlphaPixels).toBeGreaterThan(100);
    await seek(page, 1700);
    const mid = await snap(page), midImage = await frame(page);
    expect(mid.particles).toBeGreaterThan(0);
    expect(mid.coverage).toBeLessThan(0.99);
    expect(mid.coverage).toBeGreaterThan(0);
    expect(mid.renderer!.remainingAlpha / mid.renderer!.sourceAlpha).toBeCloseTo(mid.coverage, 3);
    if (kind === "sediment") for (const stratum of mid.strata) expect(stratum).toBeGreaterThan(0);
    expect(midImage).not.toBe(original);
    await seek(page, 2600); await seek(page, 1700);
    expect(await frame(page)).toBe(midImage);
    await seek(page, 5400);
    const end = await snap(page);
    expect(end.phase).toBe("COMPLETE"); expect(end.particles).toBe(0);
    expect(end.coverage).toBeLessThan(kind === "seam" ? .7 : .0001);
    expect(end.renderer!.remainingAlpha / end.renderer!.sourceAlpha).toBeCloseTo(end.coverage, 3);
    await page.getByTestId("reset").click();
    expect(await frame(page)).toBe(original);
  }
  expect(errors).toEqual([]);
});

test("scroll crossing, five threshold jitters and reversal produce one monotonic completed run", async ({ page }) => {
  await page.goto(path); await ready(page);
  for (const kind of ["ashfall", "seam", "sediment"]) {
    await select(page, kind); await center(page);
    await page.evaluate(() => window.__materialWaveA!.reset());
    const priorRun = (await snap(page)).runId;
    const positions = await page.evaluate(() => {
      const lane = document.querySelector("[data-scroll-lane]")!;
      const top = lane.getBoundingClientRect().top + scrollY - innerHeight * .28;
      const distance = lane.getBoundingClientRect().height - innerHeight;
      return [top + distance * .55, top + distance * .7];
    });
    for (let i = 0; i < 5; i++) for (const top of positions) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), top);
      await page.waitForTimeout(60);
    }
    const active = await snap(page);
    expect(active.runId).toBe(priorRun + 1); expect(active.elapsedMs).toBeGreaterThan(300);
    await expect.poll(async () => (await snap(page)).phase, { timeout: 16000 }).toBe("COMPLETE");
    expect((await snap(page)).runId).toBe(active.runId);
    expect((await snap(page)).coverage).toBeLessThan(kind === "seam" ? .7 : .0001);
  }
});

test("pause, hidden tab, resize and DPR preserve clock and release owned resources", async ({ page, browser }) => {
  await page.goto(path); await ready(page); await center(page);
  await page.getByTestId("play").click(); await page.waitForTimeout(500);
  const playing = await snap(page);
  await page.setViewportSize({ width: 1000, height: 900 });
  await expect.poll(async () => (await snap(page)).renderer!.width).toBe(902);
  expect((await snap(page)).runId).toBe(playing.runId);
  expect((await snap(page)).elapsedMs).toBeGreaterThanOrEqual(playing.elapsedMs);
  await page.getByTestId("play").click();
  const held = (await snap(page)).elapsedMs;
  await page.waitForTimeout(150); expect((await snap(page)).elapsedMs).toBe(held);
  await page.setViewportSize({ width: 800, height: 900 }); await ready(page);
  expect((await snap(page)).elapsedMs).toBe(held);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange")); window.__materialWaveA!.play();
  });
  await page.waitForTimeout(200); expect((await snap(page)).elapsedMs).toBe(held);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { value: false, configurable: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.waitForTimeout(120); expect((await snap(page)).elapsedMs).toBeLessThan(held + 250);
  await page.evaluate(() => window.__materialWaveA!.pause());
  for (let i = 0; i < 6; i++) {
    await select(page, i % 2 ? "ashfall" : "sediment");
    expect((await snap(page)).resources).toEqual({ mounted: 1, renderers: 1, raf: 0 });
  }
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setDeviceMetricsOverride", { width: 800, height: 900, deviceScaleFactor: 2, mobile: false });
  await expect.poll(async () => (await snap(page)).renderer!.dpr).toBe(1.75);
  await page.getByRole("link", { name: "Back to effects" }).click();
  await expect.poll(() => page.evaluate(() => window.__materialResources)).toEqual({ mounted: 0, renderers: 0, raf: 0 });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const retina = await context.newPage(); await retina.goto(path); await ready(retina);
  expect((await snap(retina)).renderer!.dpr).toBe(1.75); await context.close();
});

test("390 and 320px, links, keyboard, reduced motion and context loss remain usable", async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 }); await page.goto(path); await ready(page);
    for (const kind of ["ashfall", "seam", "sediment"]) {
      await select(page, kind); await center(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      expect(await page.locator(`${surface} canvas`).evaluate(c => getComputedStyle(c).pointerEvents)).toBe("none");
      expect(await page.locator(`${surface} svg`).count()).toBe(0);
      if (kind === "sediment") await expect(page.locator("[data-reveal-link]")).toHaveAttribute("tabindex", "-1");
      await page.getByTestId("play").focus(); await page.keyboard.press("Enter");
      await expect.poll(async () => (await snap(page)).elapsedMs).toBeGreaterThan(0);
      await seek(page, 5400);
      if (kind === "seam") {
        const fits = await page.locator(surface).evaluate(host => {
          const link = host.querySelector('section[aria-label="Hero section"] a')!.getBoundingClientRect();
          const rect = host.getBoundingClientRect();
          return link.bottom - rect.top <= rect.height * .44;
        });
        expect(fits).toBe(true);
      }
      if (kind !== "ashfall") {
        const link = page.locator(surface).getByRole("link").last();
        await link.click(); await expect(page).toHaveURL(/#field-notes$/);
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const kind of ["ashfall", "seam", "sediment"]) {
    await select(page, kind);
    const state = await snap(page); expect(state.coverage).toBe(1); expect(state.resources.raf).toBe(0);
    await expect(page.getByTestId("play")).toBeDisabled();
    await expect(page.getByRole("status", { name: "Material status" })).toContainText("Reduced motion");
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(`${surface} canvas`).evaluate(c => c.dispatchEvent(new Event("contextlost", { cancelable: true })));
  await expect(page.locator(surface)).toHaveAttribute("data-ready", "false");
  await expect(page.getByRole("status", { name: "Material status" })).toContainText("Canvas context lost");
  expect((await snap(page)).resources.renderers).toBe(0);
});

test("missing raster fails visibly and original semantics survive", async ({ page }) => {
  await page.route("**/material-wave-a/mineral-study.webp", route => route.fulfill({ status: 404, body: "Missing fixture" }));
  await page.goto(path); await ready(page); await page.getByTestId("select-sediment").click();
  await expect(page.getByTestId("phase")).toHaveText("FALLBACK");
  await expect(page.getByTestId("play")).toBeDisabled();
  await expect(page.locator("img[data-source]")).toHaveAttribute("alt", /Original generated raster/);
});
