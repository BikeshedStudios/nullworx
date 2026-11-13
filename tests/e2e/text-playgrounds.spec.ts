import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { glyphPlayground as glyph } from "../../lib/glyph-playground";
import { prismPlayground as prism } from "../../lib/prism-playground";

const receipts = process.env.PLAYGROUND_01B_RECEIPTS ?? "evidence/live-playground-01b";
const text = 'Make "space" <&> {now} \\ ↗';
const glyphSettings = { text, durationMs: 2000, frameMs: 80, seed: 123, paused: true, preview: "mobile" as const };
const prismSettings = { text, speed: 1.5, intensity: 0.23, paused: true, preview: "mobile" as const };

async function range(page: Page, label: string, steps: number) {
  const slider = page.getByRole("slider", { name: label });
  await slider.focus();
  await page.keyboard.press("Home");
  for (let n = 0; n < steps; n++) await page.keyboard.press("ArrowRight");
}

for (const [slug, contract, settings, version] of [["glyph-morph", glyph, glyphSettings, "gm"], ["prism-text", prism, prismSettings, "pt"]] as const) {
  const route = `/effects/${slug}`;
  const usage = slug === "glyph-morph" ? glyph.usage(glyphSettings) : prism.usage(prismSettings);
  const defaultUsage = slug === "glyph-morph" ? glyph.usage(glyph.defaults) : prism.usage(prism.defaults);

  test(`${slug}: edit, copy exact usage/source, share, reload and reset`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(route);
    await page.getByLabel("Preview text").fill(text);
    if (slug === "glyph-morph") {
      await range(page, "Animation duration", 90);
      await range(page, "Frame cadence", 60);
      await page.getByLabel("Deterministic seed").fill("123");
    } else {
      await range(page, "Animation speed", 25);
      await range(page, "Color intensity", 23);
    }
    await page.getByRole("button", { name: "Mobile · 390px" }).click();
    await page.getByTestId("toggle-motion").click();
    const effect = page.locator(`[data-effect="${slug}"]`);
    if (slug === "glyph-morph") await expect(page.getByTestId("glyph-morph-visible")).toHaveText(text);
    else {
      await expect(effect).toHaveText(text);
      expect(await effect.evaluate(el => Number.parseFloat(getComputedStyle(el).animationDuration))).toBeCloseTo(11 / 1.5, 4);
      await expect(effect).toHaveCSS("filter", "saturate(1.164)");
      await expect(effect).toHaveCSS("animation-play-state", "paused");
    }
    await expect(page.locator("#source-panel")).toHaveText(usage);
    expect((await page.getByTestId("effect-content").boundingBox())!.width).toBe(390);
    await page.getByRole("button", { name: "Copy example" }).click();
    const copiedUsage = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedUsage).toBe(usage);
    await page.getByLabel("Preview text").fill("A".repeat(80));
    await expect(page.getByText("Copied to clipboard", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Copy example" }).click();
    const longUsage = await page.evaluate(() => navigator.clipboard.readText());
    expect(longUsage).toBe(slug === "glyph-morph" ? glyph.usage({ ...glyphSettings, text: "A".repeat(80) }) : prism.usage({ ...prismSettings, text: "A".repeat(80) }));
    await page.getByLabel("Preview text").fill(text);
    await page.getByTestId("toggle-motion").click();
    await page.getByRole("button", { name: "Copy example" }).click();
    const runningUsage = await page.evaluate(() => navigator.clipboard.readText());
    expect(runningUsage).toBe(slug === "glyph-morph" ? glyph.usage({ ...glyphSettings, paused: false }) : prism.usage({ ...prismSettings, paused: false }));
    await page.getByTestId("toggle-motion").click();
    const sources: Record<string, string> = {};
    for (const file of contract.files) {
      await page.getByRole("tab", { name: file, exact: true }).click();
      await page.getByRole("button", { name: "Copy file" }).click();
      sources[file] = await page.evaluate(() => navigator.clipboard.readText());
      expect(sources[file]).toBe(await readFile(`components/forge-factory-01/${file}`, "utf8"));
    }
    await page.getByRole("tab", { name: "Usage", exact: true }).click();
    await page.getByRole("button", { name: "Share settings" }).click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    expect(new URL(shared).pathname).toBe(route);
    expect(contract.parse(new URL(shared).search)).toEqual(settings);
    await page.goto(shared);
    await page.reload();
    await expect(page.getByLabel("Preview text")).toHaveValue(text);
    await expect(page.getByTestId("effect-content")).toHaveAttribute("data-preview", "mobile");
    await expect(page.getByTestId("toggle-motion")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#source-panel")).toHaveText(usage);
    if (slug === "glyph-morph") {
      await expect(page.getByLabel("Deterministic seed")).toHaveValue("123");
      await expect(page.getByRole("slider", { name: "Animation duration" })).toHaveValue("2000");
      await expect(page.getByRole("slider", { name: "Frame cadence" })).toHaveValue("80");
    }
    await mkdir(receipts, { recursive: true });
    await writeFile(`${receipts}/copied-${slug}.json`, JSON.stringify({ settings, usage: copiedUsage, runningUsage, longUsage, sources, shared }, null, 2) + "\n");
    await page.getByRole("button", { name: "RESET", exact: true }).click();
    await expect(page.getByLabel("Preview text")).toHaveValue(contract.defaults.text);
    await expect(page.getByTestId("effect-content")).toHaveAttribute("data-preview", "desktop");
    await expect(page.getByTestId("toggle-motion")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#source-panel")).toHaveText(defaultUsage);
    await page.getByLabel("Text preset").selectOption("1");
    const preset = slug === "glyph-morph" ? "NEW SIGNAL" : "Prismatic.";
    await expect(page.getByLabel("Preview text")).toHaveValue(preset);
    await page.getByTestId("select-magnetic").click();
    await page.getByTestId(slug === "glyph-morph" ? "select-glyph" : "select-prism").click();
    await expect(page.getByLabel("Preview text")).toHaveValue(preset);
    expect(errors).toEqual([]);
  });

  test(`${slug}: malformed URLs, unsafe text, history and clipboard fallback`, async ({ page }) => {
    for (const query of [
      `${version}=2&text=Wrong`, `${version}=1&${version}=1&text=Wrong`, `${version}=1&text=%ZZ`, `${version}=1&text=${"a".repeat(2100)}`,
      `${version}=1&text=${"a".repeat(81)}&seed=Infinity&durationMs=-1&frameMs=900&speed=NaN&intensity=3&preview=giant&paused=yes`,
      `${version}=1&text=one&text=two&durationMs=1000&durationMs=2000&speed=1&speed=2`,
    ]) {
      await page.goto(`${route}?${query}`);
      await expect(page.getByLabel("Preview text")).toHaveValue(contract.defaults.text);
      await expect(page.locator("#source-panel")).toHaveText(defaultUsage);
    }
    const unsafe = '</span><script>window.pwned=1</script> {alert(1)}';
    await page.goto(`${route}?${version}=1&text=${encodeURIComponent(unsafe)}&paused=1&source=private`);
    await expect(page.getByLabel("Preview text")).toHaveValue(unsafe);
    await expect(page.locator("#source-panel")).toContainText(`text={${JSON.stringify(unsafe)}}`);
    expect(await page.evaluate(() => "pwned" in window)).toBe(false);
    await page.evaluate(version => { history.pushState(null, "", `?${version}=1&text=History`); dispatchEvent(new PopStateEvent("popstate")); }, version);
    await expect(page.getByLabel("Preview text")).toHaveValue("History");
    await page.goBack();
    await expect(page.getByLabel("Preview text")).toHaveValue(unsafe);
    await page.getByLabel("Preview text").fill("");
    await expect(page.locator("#source-panel")).toContainText(`text={${JSON.stringify(contract.defaults.text)}}`);
    await page.getByLabel("Preview text").fill("B".repeat(100));
    await expect(page.getByLabel("Preview text")).toHaveValue("B".repeat(80));
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("Denied")) } }));
    await page.getByRole("button", { name: "Copy example" }).click();
    await expect(page.getByText("Select the code below and copy it manually.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Share settings" }).click();
    await expect(page.getByLabel("Settings link")).toHaveValue(new RegExp(`${route}\\?${version}=1&`));
    await expect(page.locator("#source-panel")).toHaveAttribute("tabindex", "0");
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`${slug}: touch, focus, reduced motion, 80-character text and no overflow at ${width}px`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 950 }, hasTouch: true, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${test.info().project.use.baseURL}${route}`);
      await page.getByLabel("Preview text").fill("A".repeat(80));
      for (const size of ["mobile", "desktop"]) {
        await page.getByRole("button", { name: size === "mobile" ? "Mobile · 390px" : "Desktop", exact: true }).tap();
        await expect(page.getByTestId("effect-content")).toHaveAttribute("data-preview", size);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const frame = page.getByTestId("effect-content");
        await expect(frame).toHaveCSS("max-width", size === "mobile" ? "390px" : "720px");
        await expect.poll(async () => (await frame.boundingBox())!.width).toBeLessThanOrEqual(size === "mobile" ? 390 : 720);
        const effect = page.locator(`[data-effect="${slug}"]`);
        expect(await effect.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      }
      await page.getByTestId("toggle-motion").focus();
      await expect(page.getByTestId("toggle-motion")).toHaveCSS("outline-width", "3px");
      await page.keyboard.press("Space");
      await expect(page.getByTestId("toggle-motion")).toHaveAttribute("aria-pressed", "true");
      await page.getByTestId("replay").tap();
      if (slug === "glyph-morph") await expect(page.getByTestId("glyph-morph-visible")).toHaveText("A".repeat(80));
      else await expect(page.locator('[data-effect="prism-text"]')).toHaveCSS("animation-name", "none");
      await page.getByRole("button", { name: "RESET", exact: true }).tap();
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      await mkdir(receipts, { recursive: true });
      await writeFile(`${receipts}/axe-${slug}-${width}.json`, JSON.stringify(axe.violations, null, 2) + "\n");
      expect(axe.violations).toEqual([]);
      await page.screenshot({ path: `${receipts}/after-${slug}-${width}.png`, fullPage: true });
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}

test("Glyph timing, cadence, deterministic replay, edited seed and live reduced motion", async ({ page }) => {
  const phrase = "DETERMINISTIC GLYPH SEQUENCE";
  const clockStart = new Date("2026-11-13T12:00:00Z");
  await page.clock.install({ time: clockStart });
  await page.goto(`/effects/glyph-morph?${glyph.query({ ...glyphSettings, text: phrase })}`);
  await expect(page.getByLabel("Deterministic seed")).toHaveValue("123");
  await page.clock.pauseAt(new Date(clockStart.getTime() + 60_000));
  const visible = page.getByTestId("glyph-morph-visible");
  await page.getByTestId("replay").click();
  await expect(visible).not.toHaveText(phrase);
  const first = await visible.textContent();
  expect(first).not.toBe(phrase);
  await page.clock.runFor(79);
  await expect(visible).toHaveText(first!);
  await page.clock.runFor(1);
  await expect(visible).not.toHaveText(first!);
  const second = await visible.textContent();
  await page.clock.runFor(80);
  await expect(visible).not.toHaveText(second!);
  const third = await visible.textContent();
  await page.getByTestId("replay").click();
  await expect(visible).toHaveText(first!);
  await page.clock.runFor(160);
  await expect(visible).toHaveText(third!);
  await page.getByLabel("Deterministic seed").fill("124");
  await expect(visible).not.toHaveText(first!);
  await page.getByLabel("Deterministic seed").fill("123");
  await page.getByTestId("replay").click();
  await page.clock.runFor(1600);
  await expect(visible).not.toHaveText(phrase);
  await page.clock.runFor(400);
  await expect(visible).toHaveText(phrase);
  await page.getByRole("slider", { name: "Animation duration" }).fill("400");
  await page.getByRole("slider", { name: "Frame cadence" }).fill("20");
  await page.getByTestId("replay").click();
  await page.clock.runFor(400);
  await expect(visible).toHaveText(phrase);
  await page.getByTestId("toggle-motion").click();
  await page.clock.runFor(5000);
  await expect(visible).toHaveText(phrase);
  await page.getByTestId("toggle-motion").click();
  await expect(visible).not.toHaveText(phrase);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(visible).toHaveText(phrase);
  await page.getByTestId("replay").click();
  await page.clock.runFor(200);
  await expect(visible).toHaveText(phrase);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(visible).not.toHaveText(phrase);
  await page.getByLabel("Deterministic seed").fill("");
  await expect(page.locator("#source-panel")).toContainText("seed={17}");
});

test("Prism speed/intensity drive CSS; pause freezes and resume continues; reduced motion stays static", async ({ page }) => {
  await page.goto(`/effects/prism-text?${prism.query({ ...prismSettings, paused: false })}`);
  const effect = page.locator('[data-effect="prism-text"]');
  await expect(effect).toHaveCSS("filter", "saturate(1.164)");
  const position = () => effect.evaluate(el => getComputedStyle(el).backgroundPosition);
  const first = await position();
  await expect.poll(position).not.toBe(first);
  await page.getByTestId("toggle-motion").click();
  const paused = await position();
  await page.waitForTimeout(180);
  expect(await position()).toBe(paused);
  await page.getByTestId("toggle-motion").click();
  await expect.poll(position).not.toBe(paused);
  await page.getByRole("slider", { name: "Animation speed" }).fill("2");
  await page.getByRole("slider", { name: "Color intensity" }).fill("1");
  await expect(effect).toHaveCSS("animation-duration", "5.5s");
  await expect(effect).toHaveCSS("filter", "saturate(2.55)");
  await expect(page.locator("#source-panel")).toContainText("speed={2}");
  await expect(page.locator("#source-panel")).toContainText("intensity={1}");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(effect).toHaveCSS("animation-name", "none");
  await page.getByTestId("replay").click();
  await expect(effect).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(effect).not.toHaveCSS("animation-name", "none");
});
