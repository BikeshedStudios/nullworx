import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { asciiPlayground as contract, asciiDefaults, proceduralSettings } from "../../lib/ascii-playground";
import { asciiProbe, type AsciiCounts } from "../helpers/ascii-probe";

const receipts = process.env.PLAYGROUND_01C_RECEIPTS;
if (!receipts) throw new Error("Set PLAYGROUND_01C_RECEIPTS to a unique run directory.");
const directory = receipts;
const media = path.resolve(directory, "synthetic-test.webm");
const route = "/effects/ascii-waves";
const counts = (page: Page) => page.evaluate(() => (window as unknown as { asciiCounts: AsciiCounts }).asciiCounts);
const pixel2d = (page: Page) => page.locator("[data-procedural-ascii] canvas").evaluate(c => (c as HTMLCanvasElement).toDataURL());
async function visible(page: Page) { await page.getByTestId("ascii-preview").scrollIntoViewIfNeeded(); }
async function video(page: Page, query = "aw=1&mode=video") {
  await page.goto(`${route}?${query}`);
  await expect(page.getByLabel("Experience")).toHaveValue("video");
  await expect(page.getByTestId("toggle-motion")).toHaveAttribute("aria-pressed", query.includes("paused=1") ? "true" : "false");
  await page.getByLabel("ASCII local video").setInputFiles(media);
  await visible(page);
  await expect.poll(async () => (await counts(page)).uploads).toBeGreaterThan(0);
}
async function idle(page: Page) {
  await page.waitForTimeout(250);
  const before = await counts(page);
  await page.waitForTimeout(250);
  const after = await counts(page);
  expect(after.draws).toBe(before.draws); expect(after.uploads).toBe(before.uploads);
  return after;
}
async function copy(page: Page, name = "Copy example") {
  await page.getByRole("button", { name }).click();
  return page.evaluate(() => navigator.clipboard.readText());
}

test("procedural controls change pixels, preserve defaults, pause, replay, reset and copy", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${route}?aw=1&paused=1`); await visible(page);
  expect(await page.getByRole("slider", { name: "Noise scale" }).count()).toBe(0);
  const field = page.locator("[data-procedural-ascii]");
  await expect(field).toHaveAttribute("data-playing", "false");
  await page.waitForTimeout(100);
  const before = await pixel2d(page);
  await page.getByLabel("Character ramp", { exact: true }).fill(" .#@");
  await visible(page); await expect.poll(() => pixel2d(page)).not.toBe(before);
  const ramp = await pixel2d(page);
  await page.getByLabel("Responsive density", { exact: true }).uncheck();
  await page.getByRole("slider", { name: "Cell size" }).fill("18");
  await visible(page); await expect.poll(() => pixel2d(page)).not.toBe(ramp);
  await page.getByLabel("Original teal / violet palette").uncheck();
  await page.getByLabel("Character color").fill("#00ff00");
  await visible(page);
  const green = await pixel2d(page);
  await page.getByLabel("Invert character mapping").check();
  await visible(page); await expect.poll(() => pixel2d(page)).not.toBe(green);
  const held = await field.getAttribute("data-time");
  await page.waitForTimeout(180); expect(await field.getAttribute("data-time")).toBe(held);
  await page.getByTestId("toggle-motion").click(); await visible(page);
  await expect(field).toHaveAttribute("data-playing", "true");
  await expect.poll(() => field.getAttribute("data-time")).not.toBe(held);
  await page.getByRole("slider", { name: "Animation speed" }).fill("2");
  await page.getByRole("slider", { name: "Pointer intensity" }).fill("1.5");
  const runningUsage = await copy(page);
  await page.getByTestId("toggle-motion").click();
  const usage = await copy(page);
  const settings = { ...contract.defaults, characters: " .#@", cellSize: 18, color: "#00ff00", speed: 2, interactionIntensity: 1.5, invert: true, paused: true };
  expect(usage).toBe(contract.usage(settings));
  await writeFile(`${directory}/copied-procedural.json`, JSON.stringify({ usage, runningUsage, settings }, null, 2));
  await page.getByRole("button", { name: "RESET", exact: true }).click();
  await expect(page.getByLabel("Character ramp", { exact: true })).toHaveValue(contract.defaults.characters);
  await expect(page.locator("#source-panel")).toHaveText(contract.usage(contract.defaults));
  const defaultUsage = await copy(page);
  await writeFile(`${directory}/copied-procedural.json`, JSON.stringify({ usage, runningUsage, defaultUsage, settings }, null, 2));
  await page.getByTestId("replay").click(); await visible(page);
  await expect(field).toHaveAttribute("data-playing", "true");
});

test("video: every control changes shader output, rapid edits keep one context, copy full closure", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(asciiProbe);
  await video(page, "aw=1&mode=video&paused=1");
  await idle(page);
  const checks: unknown[] = [];
  for (const [label, value, uniform] of [["Cell size", "16", "uCellPx"], ["Noise scale", "4", "uNoiseScale"], ["Wave tension", "0.9", "uWaveTension"], ["Wave twist", "1.5", "uWaveTwist"]]) {
    const before = await counts(page);
    if (label === "Cell size") await page.getByLabel("local video character detail").selectOption(value);
    else await page.getByRole("slider", { name: label }).fill(value);
    await visible(page);
    await expect.poll(async () => (await counts(page)).sample, { message: `${label} changes pixels` }).not.toBe(before.sample);
    const after = await counts(page); checks.push({ label, before: before.sample, after: after.sample, uniform: after.uniforms[uniform] });
  }
  for (const [label, value] of [["Character ramp", " .#@"], ["Video color tint", "#88ccff"]]) {
    const before = await counts(page);
    await page.getByLabel(label, { exact: true }).fill(value); await visible(page);
    await expect.poll(async () => (await counts(page)).sample, { message: `${label} changes pixels` }).not.toBe(before.sample);
    checks.push({ label, before: before.sample, after: (await counts(page)).sample });
  }
  const beforeInvert = await counts(page);
  await page.getByLabel("Invert character mapping").check(); await visible(page);
  await expect.poll(async () => (await counts(page)).sample).not.toBe(beforeInvert.sample);
  const initial = await counts(page);
  const slider = page.getByLabel("local video character detail");
  await slider.evaluate(node => {
    const input = node as HTMLSelectElement;
    for (let i = 0; i < 100; i++) { const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!; setter.call(input, String([8, 12, 16][i % 3])); input.dispatchEvent(new Event("input", { bubbles: true })); input.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await visible(page); await page.waitForTimeout(250);
  const rapid = await counts(page);
  expect(rapid.contexts).toBe(initial.contexts); expect(rapid.programs).toBe(1); expect(rapid.textures).toBe(2); expect(rapid.arrays).toBe(1);
  expect(rapid.atlasUploads - initial.atlasUploads).toBeLessThanOrEqual(2);
  await page.getByRole("slider", { name: "Animation speed" }).fill("2");
  await page.getByRole("slider", { name: "Pointer intensity" }).fill("1.5");
  const usage = await copy(page);
  const sources: Record<string, string> = {};
  for (const file of contract.files) {
    await page.getByRole("tab", { name: file, exact: true }).click();
    sources[file] = await copy(page, "Copy file");
    expect(sources[file]).toBe(await readFile(path.join(contract.directory, file), "utf8"));
  }
  await page.getByRole("tab", { name: "Usage", exact: true }).click();
  await page.getByTestId("toggle-motion").click();
  const runningUsage = await copy(page);
  await writeFile(`${directory}/copied-video.json`, JSON.stringify({ usage, runningUsage, sources }, null, 2));
  await writeFile(`${directory}/video-control-output.json`, JSON.stringify({ checks, initial, rapid }, null, 2));
  await page.getByLabel("Experience").selectOption("procedural");
  await page.waitForTimeout(200);
  expect(await counts(page)).toMatchObject({ programs: 0, arrays: 0, textures: 0, urls: 0 });
});

test("video lifecycle: pause, hidden, offscreen, reduced motion, context recovery, errors, replacement and privacy", async ({ page }) => {
  await page.addInitScript(asciiProbe);
  const requests: { method: string; url: string; bytes: number }[] = [], errors: string[] = [];
  page.on("request", request => requests.push({ method: request.method(), url: request.url(), bytes: request.postDataBuffer()?.length ?? 0 }));
  page.on("pageerror", error => errors.push(error.message));
  await video(page);
  const first = await counts(page); await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(first.draws);
  await page.mouse.move(500, 500);
  await page.getByTestId("toggle-motion").click(); await visible(page);
  const paused = await idle(page);
  const time = await page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime);
  await page.waitForTimeout(200); expect(await page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime)).toBe(time);
  await page.getByTestId("toggle-motion").click(); await visible(page);
  await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(paused.draws);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  const hidden = await idle(page);
  await page.evaluate(() => { Reflect.deleteProperty(document, "hidden"); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(hidden.draws);
  await page.locator("footer").last().scrollIntoViewIfNeeded();
  const offscreen = await idle(page);
  await expect(page.locator("video")).toHaveJSProperty("paused", true);
  await visible(page); await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(offscreen.draws);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reduced = await idle(page); await expect(page.locator("video")).toHaveJSProperty("paused", true);
  await page.getByTestId("replay").click(); await visible(page); await idle(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(reduced.draws);
  await page.locator('canvas[data-testid="koi-home-field"]').evaluate(c => {
    const extension = (c as HTMLCanvasElement).getContext("webgl2")!.getExtension("WEBGL_lose_context")!;
    Object.assign(window, { restoreAsciiContext: () => extension.restoreContext() });
    extension.loseContext();
  });
  await expect(page.getByText("WebGL2 context lost.", { exact: false })).toBeVisible();
  await idle(page);
  await page.evaluate(() => (window as unknown as { restoreAsciiContext: () => void }).restoreAsciiContext());
  await expect(page.locator("[data-ascii-field]")).not.toHaveAttribute("data-phase", "error");
  await expect(page.locator("[data-ascii-field]")).toHaveAttribute("data-phase", "live");
  for (let i = 0; i < 4; i++) await page.getByLabel("ASCII local video").setInputFiles(media);
  await visible(page); await expect(page.locator("video")).toHaveCount(1);
  await page.getByLabel("ASCII local video").setInputFiles({ name: "bad.webm", mimeType: "video/webm", buffer: Buffer.from("invalid synthetic video") });
  await expect(page.getByText(/This video format is not supported|Your browser could not decode|This file could not be read|no supported source was found/)).toBeVisible(); await idle(page);
  await page.getByLabel("ASCII local video").setInputFiles(media); await visible(page);
  await expect(page.locator("[data-ascii-field]")).not.toHaveAttribute("data-phase", "error");
  await expect(page.locator("[data-ascii-field]")).toHaveAttribute("data-phase", "live");
  await page.getByRole("button", { name: "Clear local video" }).click();
  await expect(page.getByLabel("Experience")).toHaveValue("procedural");
  await expect(page.locator("[data-procedural-ascii]")).toHaveAttribute("data-settings", JSON.stringify(proceduralSettings(contract.defaults)));
  await expect(page.locator("#source-panel")).toHaveText(contract.usage(contract.defaults));
  expect(await counts(page)).toMatchObject({ programs: 0, arrays: 0, textures: 0, urls: 0 });
  expect(requests.filter(r => r.method !== "GET" || r.bytes > 0)).toEqual([]);
  expect(requests.filter(r => /^\/media\//.test(new URL(r.url).pathname) || /analytics|telemetry/.test(r.url))).toEqual([]);
  expect(errors).toEqual([]);
  await writeFile(`${directory}/lifecycle.json`, JSON.stringify({ paused, hidden, offscreen, reduced, final: await counts(page), requests, errors }, null, 2));
});

test("paused video redraws on preview and viewport resize without resuming or replacing its context", async ({ page }) => {
  await page.addInitScript(asciiProbe);
  await video(page, "aw=1&mode=video&paused=1");
  const first = await idle(page);
  const time = await page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime);
  const evidence = [];
  for (const width of [390, 768, 1440]) {
    const before = await counts(page);
    await page.setViewportSize({ width, height: 950 }); await visible(page);
    await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(before.draws);
    const after = await idle(page);
    const size = await page.getByTestId("koi-home-field").evaluate(c => [(c as HTMLCanvasElement).width, (c as HTMLCanvasElement).height]);
    expect(after.uniforms.uResolution).toEqual(size);
    expect(after.energy).toBeGreaterThan(0.3);
    expect(after.uniforms.uTime).toBe(first.uniforms.uTime);
    expect(after.contexts).toBe(first.contexts);
    expect(await page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime)).toBe(time);
    evidence.push({ width, size, ...after });
  }
  const before = await counts(page);
  await page.getByRole("button", { name: "Mobile · 390px", exact: true }).click(); await visible(page);
  await expect.poll(async () => (await counts(page)).draws).toBeGreaterThan(before.draws);
  const after = await idle(page);
  expect(after.energy).toBeGreaterThan(0.3);
  expect(after.contexts).toBe(first.contexts);
  await expect(page.locator("video")).toHaveJSProperty("paused", true);
  await writeFile(`${directory}/paused-resize.json`, JSON.stringify({ evidence, mobile: after }, null, 2));
});

test("procedural waves work without WebGL2, sleep offscreen and recover from unavailable video rendering", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.assign(HTMLCanvasElement.prototype, { getContext: function (this: HTMLCanvasElement, ...args: unknown[]) {
      return args[0] === "webgl2" ? null : Reflect.apply(getContext, this, args);
    } });
  });
  await page.goto(route); await visible(page);
  const field = page.locator("[data-procedural-ascii]");
  await expect(field).toHaveAttribute("data-playing", "true");
  await page.locator("footer").last().scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-playing", "false");
  const frame = await field.getAttribute("data-frame");
  await page.waitForTimeout(250); await expect(field).toHaveAttribute("data-frame", frame!);
  await visible(page); await expect(field).toHaveAttribute("data-playing", "true");
  await page.getByLabel("Experience").selectOption("video");
  await page.getByLabel("ASCII local video").setInputFiles(media); await visible(page);
  await expect(page.locator("[data-ascii-field]")).toHaveAttribute("data-phase", "error");
  await expect(page.getByText("local video renderer initialization:", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Use procedural animation", exact: true }).click();
  await expect(page.getByLabel("Experience")).toHaveValue("procedural");
  await expect(field).toHaveAttribute("data-playing", "true");
  expect(errors).toEqual([]);
  await writeFile(`${directory}/no-webgl-fallback.json`, JSON.stringify({ offscreenFrame: frame, playing: await field.getAttribute("data-playing"), errors }, null, 2));
});

for (const width of [320, 390, 768, 1440]) test(`responsive, touch, focus, reduced motion and accessibility at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route); await visible(page);
  for (const size of ["Mobile · 390px", "Desktop"]) {
    await page.getByRole("button", { name: size, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await page.getByTestId("ascii-preview").boundingBox())!.width).toBeLessThanOrEqual(size.startsWith("Mobile") ? 390 : 960);
  }
  await page.getByTestId("toggle-motion").focus(); await expect(page.getByTestId("toggle-motion")).toHaveCSS("outline-width", "3px");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("toggle-motion")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("replay").click(); await visible(page);
  await expect(page.locator("[data-procedural-ascii]")).toHaveAttribute("data-playing", "false");
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/axe-${width}.json`, JSON.stringify(axe.violations, null, 2)); expect(axe.violations).toEqual([]);
  await page.screenshot({ path: `${directory}/review-${width}.png`, fullPage: true });
  await writeFile(`${directory}/responsive-${width}.json`, JSON.stringify({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), stage: await page.getByTestId("ascii-preview").boundingBox(), sliders: await page.getByRole("slider").count() }, null, 2));
});

test("URLs, reload, history, invalid input, copy failures and settings-only sharing", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const settings = { ...asciiDefaults("video"), characters: ' ."<>{}\\@', color: "#00ffaa", cellSize: 8, noiseScale: 3, waveTwist: 0.8, waveTension: 0.7, speed: 1.5, cursorInteraction: false, invert: true, paused: true, preview: "mobile" as const };
  await page.goto(`${route}?${contract.query(settings)}`);
  await expect(page.locator("#source-panel")).toHaveText(contract.usage(settings));
  await page.getByRole("button", { name: "Share settings" }).click();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toBe(`${new URL(page.url()).origin}${route}?${contract.query(settings)}`);
  expect(shared).not.toMatch(/blob:|file=|src=/);
  await page.reload(); await expect(page.locator("#source-panel")).toHaveText(contract.usage(settings)); await expect(page.locator("video")).toHaveCount(0);
  await page.evaluate(() => { history.pushState(null, "", "?aw=1&characters=History"); dispatchEvent(new PopStateEvent("popstate")); });
  await expect(page.getByLabel("Character ramp", { exact: true })).toHaveValue("History");
  await page.goBack(); await expect(page.getByLabel("Character ramp", { exact: true })).toHaveValue(settings.characters);
  for (const query of ["aw=2", "aw=1&aw=1", "aw=1&characters=%ZZ", "aw=1&characters=%00", `aw=1&characters=${"a".repeat(2100)}`, "aw=1&mode=wrong&speed=NaN&paused=yes&preview=giant"]) {
    await page.goto(`${route}?${query}`); await expect(page.locator("#source-panel")).toHaveText(contract.usage(contract.defaults));
  }
  await page.getByLabel("Character ramp", { exact: true }).fill("");
  await expect(page.locator("#source-panel")).toHaveText(contract.usage(contract.defaults));
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("Denied")) } }));
  await page.getByRole("button", { name: "Copy example" }).click();
  await expect(page.getByText("Select the code below and copy it manually.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Share settings" }).click(); await expect(page.getByLabel("Settings link")).toBeVisible();
  await writeFile(`${directory}/shared-url.txt`, shared);
});

test("procedural speed and pointer strength affect the existing clock and pixels; hidden work sleeps", async ({ page }) => {
  const start = new Date("2026-11-13T12:00:00Z");
  await page.clock.install({ time: start });
  await page.goto(route); await visible(page);
  await expect(page.locator("[data-procedural-ascii]")).toHaveAttribute("data-playing", "true");
  await page.clock.pauseAt(new Date(start.getTime() + 60_000));
  const field = page.locator("[data-procedural-ascii]"), canvas = field.locator("canvas");
  const samples: { intensity: number; enabled: boolean; time: string | null; pixels: string }[] = [];
  for (const [enabled, intensity] of [[true, 0], [true, 1], [true, 2], [false, 2]] as const) {
    await page.getByLabel("Pointer interaction", { exact: true }).setChecked(true);
    await page.getByRole("slider", { name: "Pointer intensity" }).fill(String(intensity));
    await page.getByLabel("Pointer interaction", { exact: true }).setChecked(enabled);
    await page.getByTestId("replay").click(); await visible(page);
    await canvas.dispatchEvent("pointermove", { pointerType: "mouse", clientX: (await canvas.boundingBox())!.x + 100, clientY: (await canvas.boundingBox())!.y + 100 });
    await page.clock.runFor(640);
    samples.push({ intensity, enabled, time: await field.getAttribute("data-time"), pixels: await pixel2d(page) });
  }
  expect(samples.map(s => s.time)).toEqual(Array(4).fill(samples[0].time));
  expect(samples[0].pixels).toBe(samples[3].pixels);
  expect(samples[1].pixels).not.toBe(samples[0].pixels);
  expect(samples[2].pixels).not.toBe(samples[1].pixels);
  await page.getByRole("slider", { name: "Animation speed" }).fill("2");
  await page.getByTestId("replay").click(); await visible(page); await page.clock.runFor(640);
  expect(Number(await field.getAttribute("data-time"))).toBeCloseTo(Number(samples[0].time) * 2, 2);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(field).toHaveAttribute("data-playing", "false");
  const frame = await field.getAttribute("data-frame"); await page.clock.runFor(640);
  expect(await field.getAttribute("data-frame")).toBe(frame);
  await writeFile(`${directory}/procedural-control-output.json`, JSON.stringify({ samples: samples.map(({ pixels, ...s }) => ({ ...s, pixelBytes: pixels.length })), speedTwoTime: await field.getAttribute("data-time"), hiddenFrame: frame }, null, 2));
});

test("retained video controls: notes, paused seek, loop, retry and procedural switch", async ({ page }) => {
  await page.addInitScript(asciiProbe); await video(page);
  const field = page.locator("[data-ascii-field]"); await expect(field).toHaveAttribute("data-phase", "live");
  await page.getByRole("button", { name: "Source notes" }).click();
  await expect(page.getByText("The video uses the calibrated glyph mapping.", { exact: false })).toBeVisible();
  await page.getByTestId("toggle-motion").click(); await visible(page); const before = await idle(page);
  await page.locator("video").evaluate(v => { (v as HTMLVideoElement).currentTime = 2; });
  await expect.poll(async () => (await counts(page)).uploads).toBeGreaterThan(before.uploads); await idle(page);
  await page.getByTestId("toggle-motion").click(); await visible(page);
  await page.locator("video").evaluate(v => { const video = v as HTMLVideoElement; video.currentTime = video.duration - 0.15; });
  await expect.poll(() => page.locator("video").evaluate(v => (v as HTMLVideoElement).currentTime)).toBeLessThan(1.5);
  await page.locator('canvas[data-testid="koi-home-field"]').evaluate(c => (c as HTMLCanvasElement).getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext());
  await expect(field).toHaveAttribute("data-phase", "error");
  await page.getByRole("button", { name: "Retry local video" }).click();
  await expect(field).toHaveAttribute("data-phase", "live");
  await page.getByRole("button", { name: "Use procedural animation", exact: true }).click();
  await expect(page.getByLabel("Experience")).toHaveValue("procedural");
  expect(await counts(page)).toMatchObject({ programs: 0, arrays: 0, textures: 0, urls: 0 });
});

test("video speed and pointer controls drive the existing renderer uniforms and clock", async ({ page }) => {
  await page.addInitScript(asciiProbe); await video(page);
  await page.getByRole("slider", { name: "Animation speed" }).fill("2.5"); await visible(page);
  await page.waitForTimeout(700);
  const timeline = (await counts(page)).timeline.slice(-8);
  expect(timeline.length).toBe(8);
  const boundedSeconds = timeline.slice(1).reduce((total, frame, i) => total + Math.min(0.08, (frame.at - timeline[i].at) / 1000), 0);
  expect((timeline.at(-1)!.time - timeline[0].time) / boundedSeconds).toBeCloseTo(2.5, 1);
  const field = page.locator("[data-ascii-field]"), canvas = page.getByTestId("koi-home-field");
  await expect(field).toHaveAttribute("data-phase", "live");
  await canvas.hover();
  await expect.poll(async () => Number((await counts(page)).uniforms.uPointerStrength)).toBeGreaterThan(0.2);
  await page.getByRole("slider", { name: "Pointer intensity" }).fill("0"); await visible(page);
  await expect.poll(async () => (await counts(page)).uniforms.uInteractionIntensity).toBe(0);
  await page.getByRole("slider", { name: "Pointer intensity" }).fill("1.5"); await visible(page);
  await expect.poll(async () => (await counts(page)).uniforms.uInteractionIntensity).toBe(1.5);
  await page.getByLabel("Pointer interaction", { exact: true }).uncheck(); await visible(page);
  await expect(page.getByRole("slider", { name: "Pointer intensity" })).toHaveCount(0);
  await expect.poll(async () => Number((await counts(page)).uniforms.uPointerStrength)).toBeLessThan(0.001);
  await writeFile(`${directory}/video-clock-pointer.json`, JSON.stringify({ timeline, boundedSeconds, final: await counts(page) }, null, 2));
});

for (const width of [320, 390, 768, 1440]) test(`local video touch stage and still-frame accessibility at ${width}`, async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width, height: 950 }, hasTouch: true, reducedMotion: "reduce" });
  const page = await context.newPage(); await page.addInitScript(asciiProbe);
  await page.goto(`${test.info().project.use.baseURL}${route}?aw=1&mode=video`);
  await expect(page.getByLabel("Experience")).toHaveValue("video");
  await page.getByLabel("ASCII local video").setInputFiles(media); await visible(page);
  await expect.poll(async () => (await counts(page)).uploads).toBeGreaterThan(0);
  for (const size of ["Mobile · 390px", "Desktop"]) {
    await page.getByRole("button", { name: size, exact: true }).tap(); await visible(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await idle(page);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  await writeFile(`${directory}/axe-video-${width}.json`, JSON.stringify(axe.violations, null, 2)); expect(axe.violations).toEqual([]);
  await page.screenshot({ path: `${directory}/review-video-${width}.png`, fullPage: true });
  await writeFile(`${directory}/responsive-video-${width}.json`, JSON.stringify({ width, stage: await page.getByTestId("koi-home-field").boundingBox(), counts: await counts(page) }, null, 2));
  await context.close();
});
