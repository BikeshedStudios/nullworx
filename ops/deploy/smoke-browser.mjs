#!/usr/bin/env node
import { chromium, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { publicPaths, canonicalOrigin } from "./smoke-http.mjs";

const { values } = parseArgs({ options: {
  "base-url": { type: "string" }, report: { type: "string" },
  commit: { type: "string", default: "" }, digest: { type: "string", default: "" },
} });
const base = new URL(values["base-url"]);
if (base.origin !== canonicalOrigin && !(base.protocol === "http:" && base.hostname === "127.0.0.1")) throw new Error("Use the canonical domain or an explicit loopback tunnel");
const checks = [];
// Only intercept public /media URLs and video files, never Next's /_next/static/media/*.woff2 fonts.
const isVideoResource = url => url.pathname.startsWith("/media/") || /\.(?:mp4|webm)$/i.test(url.pathname);
const browser = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader", "--disable-dev-shm-usage"] });
async function check(name, fn) {
  const context = await browser.newContext({ baseURL: base.origin, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await fn(page);
    expect(errors, "Uncaught browser errors").toEqual([]);
    checks.push({ name, passed: true });
  } catch (error) { checks.push({ name, passed: false, error: error.message.slice(0, 1800) }); }
  finally { await context.close(); }
}
try {
  for (const path of publicPaths) await check(`mobile ${path}`, async page => {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /width=device-width/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Mobile horizontal overflow").toBe(true);
  });
  await check("navigation home to gallery to effect", async page => {
    await page.goto("/");
    await page.getByLabel("Open navigation", { exact: true }).click();
    await page.getByRole("navigation", { name: "Mobile navigation", exact: true }).getByRole("link", { name: "Effects", exact: true }).click();
    await expect(page).toHaveURL(`${base.origin}/effects`);
    // The URL can change before the outgoing homepage DOM is removed.
    await expect(page.getByRole('heading', { level: 1, name: /Find your/ })).toBeVisible();
    const magneticCard = page.locator('main h3 a[href="/effects/magnetic-focus"]');
    await expect(magneticCard).toHaveCount(1);
    await magneticCard.click();
    await expect(page.locator("h1")).toContainText("Magnetic Focus");
    await page.getByRole("button", { name: /^Copy example/ }).focus();
    await expect(page.getByRole("button", { name: /^Copy example/ })).toBeFocused();
  });
  for (const path of ["/", "/effects/ascii-waves"]) await check(`procedural ASCII fallback ${path}`, async page => {
    // Unprovisioned media must not be fetched: the default is the original procedural renderer.
    let mediaRequests = 0;
    await page.route(isVideoResource, route => {
      mediaRequests++;
      return route.fulfill({ status: 404, body: "Smoke: unavailable media" });
    });
    await page.goto(path);
    const field = page.locator("[data-procedural-ascii]").first();
    await expect(field).toBeVisible();
    await expect(field).toHaveAttribute("data-reduced", "true");
    await expect(field).toHaveAttribute("data-playing", "false");
    await expect(field).toHaveAttribute("data-frame", /^\d+$/);
    await expect(field.locator("canvas")).toBeVisible();
    await expect(page.getByLabel("ASCII local video")).toBeVisible();
    await expect(page.locator("[data-ascii-field]")).toHaveCount(0);
    expect(mediaRequests).toBe(0);
  });
  await check("missing media /effects/digital-wake", async page => {
    // Digital Wake remains a separate Beta page with an explicit media-unavailable state.
    await page.route(isVideoResource, route => route.fulfill({ status: 404, body: "Smoke: unavailable media" }));
    await page.goto("/effects/digital-wake");
    await expect(page.getByText("VIDEO UNAVAILABLE", { exact: true })).toBeVisible();
    await page.locator("summary").filter({ hasText: "Video & source" }).click();
    await expect(page.getByText("CHOOSE VIDEO", { exact: true })).toBeVisible();
    await page.waitForFunction(() => !!window.__wake);
    const wake = await page.evaluate(() => ({ births: window.__wake.births().flat().length, verified: window.__wake.metrics().sourceVerified }));
    expect(wake).toEqual({ births: 0, verified: false });
  });
  await check("missing media /effects/sediment-reveal", async page => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.route("**/material-wave-a/mineral-study.webp", route => route.fulfill({ status: 404, body: "Smoke: unavailable raster" }));
    await page.goto("/effects/sediment-reveal");
    await expect(page.getByTestId("phase")).toHaveText("FALLBACK");
    await expect(page.getByTestId("play")).toBeDisabled();
    await expect(page.getByRole("status", { name: "Material status" })).toContainText(/image|decode/i);
    await expect(page.locator("img[data-source]")).toHaveAttribute("alt", /Original generated raster/);
  });
} finally { await browser.close(); }
const report = { schema: 1, suite: "browser", baseUrl: base.origin, commit: values.commit, digest: values.digest, checkedAt: new Date().toISOString(), passed: checks.every(c => c.passed), checks };
if (values.report) writeFileSync(values.report, JSON.stringify(report, null, 2) + "\n");
for (const check of checks) console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name}${check.error ? `: ${check.error}` : ""}`);
process.exitCode = report.passed ? 0 : 1;
