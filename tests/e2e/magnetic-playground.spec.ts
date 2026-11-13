import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { magneticPlayground as contract } from "../../lib/magnetic-playground";

const route = "/effects/magnetic-focus";
const label = 'Make "space" <&> {now} \\ ↗';
const receipts = process.env.PLAYGROUND_01A_RECEIPTS ?? "evidence/live-playground-01a";

test("edits drive the real component, generated TSX, clipboard and validated share link", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(route);
  await page.getByLabel("Button label").fill(label);
  const intensity = page.getByRole("slider", { name: "Pointer intensity" });
  await intensity.focus();
  await page.keyboard.press("Home");
  for (let n = 0; n < 23; n++) await page.keyboard.press("ArrowRight");
  await expect(intensity).toHaveValue("0.23");
  const button = page.locator('[data-effect="magnetic-focus"]');
  await expect(button).toHaveText(`${label}↗`);
  await page.getByRole("button", { name: "Mobile · 390px" }).click();
  const frame = page.getByTestId("effect-content");
  await expect(frame).toHaveAttribute("data-preview", "mobile");
  expect((await frame.boundingBox())!.width).toBe(390);
  await page.getByTestId("toggle-motion").click();
  await expect(button).toHaveAttribute("data-motion", "disabled");
  await expect(page.locator("#source-panel")).toHaveText(contract.usage({ label, intensity: 0.23, paused: true, preview: "mobile" }));
  await page.getByTestId("replay").click();
  await expect(button).toHaveAttribute("data-motion", "enabled");
  await expect(page.getByLabel("Button label")).toHaveValue(label);
  const settings = { label, intensity: 0.23, paused: false, preview: "mobile" as const };
  const usage = contract.usage(settings);
  await expect(page.locator("#source-panel")).toHaveText(usage);
  await page.getByRole("button", { name: "Copy example" }).click();
  await expect(page.getByText("Copied to clipboard", { exact: true })).toBeVisible();
  const copiedUsage = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedUsage).toBe(usage);
  await page.getByLabel("Button label").fill("A".repeat(80));
  await expect(page.getByText("Copied to clipboard", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Copy example" }).click();
  const longUsage = await page.evaluate(() => navigator.clipboard.readText());
  expect(longUsage).toBe(contract.usage({ ...settings, label: "A".repeat(80) }));
  await page.getByLabel("Button label").fill(label);
  const sources: Record<string, string> = {};
  for (const file of contract.files) {
    await page.getByRole("tab", { name: file, exact: true }).click();
    await page.getByRole("button", { name: "Copy file" }).click();
    sources[file] = await page.evaluate(() => navigator.clipboard.readText());
    expect(sources[file]).toBe(await readFile(`components/forge-factory-01/${file}`, "utf8"));
  }
  await page.getByRole("button", { name: "Share settings" }).click();
  await expect(page.getByText("Settings link copied.", { exact: true })).toBeVisible();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  const sharedUrl = new URL(shared);
  expect(sharedUrl.pathname).toBe(route);
  expect(contract.parse(sharedUrl.search)).toEqual(settings);
  await page.goto(shared);
  await expect(page.getByLabel("Button label")).toHaveValue(label);
  await expect(intensity).toHaveValue("0.23");
  await expect(frame).toHaveAttribute("data-preview", "mobile");
  await expect(page.locator("#source-panel")).toHaveText(usage);
  // The copied source closure is the exact input to the independent consumer proof.
  await mkdir(receipts, { recursive: true });
  await writeFile(`${receipts}/copied.json`, JSON.stringify({ settings, usage: copiedUsage, longUsage, sources, shared }, null, 2) + "\n");
  await page.getByRole("button", { name: "RESET", exact: true }).click();
  await expect(page.getByLabel("Button label")).toHaveValue(contract.defaults.label);
  await expect(intensity).toHaveValue("0.68");
  await expect(frame).toHaveAttribute("data-preview", "desktop");
  await page.getByLabel("Text preset").selectOption("1");
  await expect(button).toHaveText("LAUNCH PREVIEW↗");
  await page.getByTestId("select-prism").click();
  await page.getByTestId("select-magnetic").click();
  await expect(page.getByLabel("Button label")).toHaveValue("LAUNCH PREVIEW");
  expect(errors).toEqual([]);
});

test("pointer intensity, replay, keyboard, touch and live reduced motion", async ({ page }) => {
  await page.goto(`${route}?mf=1&intensity=0.23`);
  const button = page.locator('[data-effect="magnetic-focus"]');
  await expect(page.getByRole("slider", { name: "Pointer intensity" })).toHaveValue("0.23");
  const move = async (pointerType = "mouse") => {
    const rect = (await button.boundingBox())!;
    await button.dispatchEvent("pointermove", { clientX: rect.x + 5, clientY: rect.y + 5, pointerType });
  };
  const dx = () => button.evaluate(el => el.style.getPropertyValue("--mf-x"));
  await move();
  expect(Math.abs(Number.parseFloat(await dx()))).toBeGreaterThan(0);
  expect(Math.abs(Number.parseFloat(await dx()))).toBeLessThanOrEqual(0.23 * 12);
  await page.getByTestId("toggle-motion").click();
  await expect(button).toHaveCSS("transform", "none");
  expect(await dx()).toBe("0px");
  await page.getByTestId("replay").click();
  await expect(button).toHaveAttribute("data-motion", "enabled");
  expect(await dx()).toBe("");
  await move("touch");
  expect(await dx()).toBe("");
  await button.focus();
  await expect(button).toHaveCSS("outline-width", "3px");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(page.getByText("Activated 2 times", { exact: true })).toBeVisible();
  await move();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(button).toHaveAttribute("data-motion", "disabled");
  await expect(button).toHaveCSS("transform", "none");
  await page.getByTestId("replay").click();
  await expect(button).toHaveAttribute("data-motion", "disabled");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(button).toHaveAttribute("data-motion", "enabled");
  expect(await dx()).toBe("0px");
});

test("invalid URL fields fall back safely and browser history restores settings", async ({ page }) => {
  await page.goto(`${route}?mf=1&label=%00bad&intensity=Infinity&paused=yes&preview=giant&source=private`);
  await expect(page.getByLabel("Button label")).toHaveValue(contract.defaults.label);
  await expect(page.locator("#source-panel")).toHaveText(contract.usage(contract.defaults));
  await page.goto(`${route}?mf=1&label=one&label=two&intensity=0.1&intensity=0.9`);
  await expect(page.getByLabel("Button label")).toHaveValue(contract.defaults.label);
  await expect(page.getByRole("slider", { name: "Pointer intensity" })).toHaveValue("0.68");
  await page.goto(`${route}?mf=2&label=Wrong`);
  await expect(page.getByLabel("Button label")).toHaveValue(contract.defaults.label);
  await page.goto(`${route}?mf=1&label=Shared&paused=1&preview=mobile`);
  await expect(page.getByLabel("Button label")).toHaveValue("Shared");
  await expect(page.locator('[data-effect="magnetic-focus"]')).toHaveAttribute("data-motion", "disabled");
  await page.evaluate(() => { history.pushState(null, "", "?mf=1&label=History"); dispatchEvent(new PopStateEvent("popstate")); });
  await expect(page.getByLabel("Button label")).toHaveValue("History");
  await page.goBack();
  await expect(page.getByLabel("Button label")).toHaveValue("Shared");
  await page.getByLabel("Button label").fill("");
  await expect(page.locator('[data-effect="magnetic-focus"]')).toHaveText(`${contract.defaults.label}↗`);
  await expect(page.locator("#source-panel")).toContainText(`label={${JSON.stringify(contract.defaults.label)}}`);
});

test("clipboard denial provides selectable TSX and a settings link", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("Denied")) } }));
  await page.goto(route);
  await page.getByRole("button", { name: "Copy example" }).click();
  await expect(page.getByText("Select the code below and copy it manually.", { exact: false })).toBeVisible();
  await expect(page.locator("#source-panel")).toHaveAttribute("tabindex", "0");
  await page.getByRole("button", { name: "Share settings" }).click();
  await expect(page.getByLabel("Settings link")).toHaveValue(/\/effects\/magnetic-focus\?mf=1&/);
});

for (const width of [1440, 390, 320]) {
  test(`responsive controls, touch, reduced motion and contrast at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${test.info().project.use.baseURL}${route}`);
    await page.getByRole("button", { name: "Mobile · 390px" }).tap();
    const button = page.locator('[data-effect="magnetic-focus"]');
    await expect(button).toHaveAttribute("data-motion", "disabled");
    await button.tap();
    await expect(page.getByText("Activated 1 time", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const frame = (await page.getByTestId("effect-content").boundingBox())!;
    expect(frame.width).toBeLessThanOrEqual(390);
    await page.getByLabel("Button label").fill("A".repeat(80));
    const label = button.locator("span").nth(1);
    expect(await label.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "RESET", exact: true }).tap();
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    await mkdir(receipts, { recursive: true });
    await writeFile(`${receipts}/axe-${width}.json`, JSON.stringify(axe.violations, null, 2) + "\n");
    expect(axe.violations).toEqual([]);
    await page.screenshot({ path: `${receipts}/magnetic-${width}.png`, fullPage: true });
    await context.close();
  });
}
