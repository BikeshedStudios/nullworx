import { test, expect } from "@playwright/test";
import { installProceduralProbe } from "../helpers/procedural-probe";

const pixels = (page: import("@playwright/test").Page) => page.locator("[data-procedural-ascii] canvas").evaluate(canvas => {
  const c = canvas as HTMLCanvasElement, bytes = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
  return bytes.some((value, index) => index % 4 !== 3 && value > 40);
});

test.beforeEach(async ({ page }) => { await page.addInitScript(installProceduralProbe); });
test.afterEach(async ({ page }, info) => {
  await info.attach("procedural-lifecycle.json", { body: JSON.stringify(await page.evaluate(() => window.__proceduralProbe.dump()), null, 2), contentType: "application/json" });
});

test("hidden field rejects delayed resize draws, then renders and resumes when visible", async ({ page }) => {
  await page.goto("/effects/ascii-waves");
  const field = page.locator("[data-procedural-ascii]"); await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-playing", "true");
  await expect.poll(() => pixels(page)).toBe(true);
  const suspendedObserver = await page.evaluate(() => window.__proceduralProbe.current());
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(field).toHaveAttribute("data-playing", "false");
  const id = await page.evaluate(() => window.__proceduralProbe.current());
  await expect.poll(() => page.evaluate(id => window.__proceduralProbe.pending(id), id)).toBeGreaterThan(0);
  const held = await page.evaluate(id => window.__proceduralProbe.snapshot(id), id);
  await page.evaluate(id => window.__proceduralProbe.deliver(id), id);
  expect(await field.getAttribute("data-frame")).toBe(held.frame);
  expect((await page.evaluate(id => window.__proceduralProbe.snapshot(id), id)).draws).toBe(held.draws);
  await page.waitForTimeout(640);
  expect(await field.getAttribute("data-frame")).toBe(held.frame);
  expect(await field.getAttribute("data-time")).toBe(held.time);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(field).toHaveAttribute("data-playing", "true");
  await expect.poll(() => pixels(page)).toBe(true);
  const time = await field.getAttribute("data-time"); await expect.poll(() => field.getAttribute("data-time")).not.toBe(time);
  const stale = await page.evaluate(id => {
    const before = window.__proceduralProbe.snapshot(id);
    window.__proceduralProbe.deliver(id, true);
    return { before, after: window.__proceduralProbe.snapshot(id) };
  }, suspendedObserver);
  expect(stale.after).toEqual(stale.before);
  // Deliver an already-disconnected observer callback after a real React unmount.
  const removedId = await page.evaluate(() => window.__proceduralProbe.current());
  await page.locator('header a[href="/effects"]').first().click();
  await expect(page).toHaveURL(/\/effects$/);
  await expect.poll(() => page.evaluate(id => window.__proceduralProbe.snapshot(id).connected, removedId)).toBe(false);
  const before = await page.evaluate(id => window.__proceduralProbe.snapshot(id), removedId);
  await page.evaluate(id => window.__proceduralProbe.deliver(id, true), removedId);
  expect(await page.evaluate(id => window.__proceduralProbe.snapshot(id), removedId)).toEqual(before);
});

test("initial reduced-motion still frame survives hidden resize and returns visibly", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/effects/ascii-waves");
  const field = page.locator("[data-procedural-ascii]"); await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-playing", "false");
  await expect.poll(() => pixels(page)).toBe(true);
  const time = await field.getAttribute("data-time");
  const visibleObserver = await page.evaluate(() => window.__proceduralProbe.current());
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(field).toHaveAttribute("data-playing", "false");
  // Wait for the effect associated with the visibility change, not an arbitrary delay.
  await expect.poll(() => page.evaluate(() => window.__proceduralProbe.current())).not.toBe(visibleObserver);
  const before = await field.getAttribute("data-frame");
  await page.setViewportSize({ width: 390, height: 844 });
  const id = await page.evaluate(() => window.__proceduralProbe.current());
  await expect.poll(() => page.evaluate(id => window.__proceduralProbe.pending(id), id)).toBeGreaterThan(0);
  await page.evaluate(id => window.__proceduralProbe.deliver(id), id);
  expect(await field.getAttribute("data-frame")).toBe(before);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
  await field.scrollIntoViewIfNeeded(); await expect.poll(() => pixels(page)).toBe(true);
  expect(await field.getAttribute("data-time")).toBe(time);
  const still = await field.locator("canvas").evaluate(c => (c as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(640);
  expect(await field.locator("canvas").evaluate(c => (c as HTMLCanvasElement).toDataURL())).toBe(still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(field).toHaveAttribute("data-playing", "true");
  await expect.poll(() => field.getAttribute("data-time")).not.toBe(time);
});
