import { test, expect } from "@playwright/test";
import path from "node:path";
import { existsSync } from "node:fs";
const media = path.resolve("public/media/local/loop30-v2.mp4");
const provisioned = existsSync(media) && process.env.CLEAN_CLONE !== "1";

test("homepage, gallery, routes and installation remain one coherent site", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good effects. Real character." }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Primary navigation", exact: true })
    .getByRole("link", { name: "Effects", exact: true })
    .click();
  for (const slug of [
    "magnetic-focus",
    "glyph-morph",
    "prism-text",
    "ascii-waves",
    "digital-wake",
  ])
    await expect(page.locator(`h3 a[href="/effects/${slug}"]`)).toBeVisible();
  for (const [slug, name] of [
    ["magnetic-focus", "Magnetic Focus"],
    ["glyph-morph", "Glyph Morph"],
    ["prism-text", "Prism Text"],
  ]) {
    await page.goto("/effects/" + slug);
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copy example" }),
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: "UI Forge home" }),
    ).toHaveCount(1);
  }
  await page.goto("/effects/ascii-waves");
  await expect(page.getByLabel("ASCII local video")).toBeVisible();
  await page.goto("/effects/digital-wake");
  await expect(
    page.getByRole("heading", { name: "Digital Wake." }),
  ).toBeVisible();
  await expect(
    page.getByText("EXPERIMENTAL / BETA · DIGITAL WAKE 01.2", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "SUBTLE", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "EXPRESSIVE", exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("unavailable media is explicit; no fake live label or fallback births", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/media/local/**", (route) =>
    route.fulfill({ status: 404, body: "Media not provisioned" }),
  );
  await page.goto("/");
  await expect(page.locator("[data-ascii-field]")).toHaveAttribute(
    "data-phase",
    "error",
  );
  await expect(
    page.getByText("Video unavailable", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("● LIVE", { exact: true })).toHaveCount(0);
  await page.goto("/effects/digital-wake");
  await expect(
    page.getByText("VIDEO UNAVAILABLE", { exact: true }),
  ).toBeVisible();
  await page.locator("summary").filter({ hasText: "Video & source" }).click();
  await expect(page.getByText("CHOOSE VIDEO", { exact: true })).toBeVisible();
  await page.waitForFunction(() => !!window.__wake);
  expect(await page.evaluate(() => window.__wake!.births().flat().length)).toBe(
    0,
  );
  expect(
    await page.evaluate(() => window.__wake!.metrics().sourceVerified),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("Digital Wake is usable on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/effects/digital-wake");
  await expect(
    page.getByRole("button", { name: "SUBTLE", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test("provisioned ASCII advances, pauses and retains Fine controls", async ({
  page,
}) => {
  test.skip(
    !provisioned,
    "Accepted media intentionally absent from clean clones",
  );
  await page.goto("/effects/ascii-waves");
  const field = page.locator("[data-ascii-field]");
  await expect(field).toHaveAttribute("data-phase", "live");
  await expect(field).toHaveAttribute("data-detail", "fine");
  const before = Number(await field.getAttribute("data-current-time"));
  await expect
    .poll(async () => Number(await field.getAttribute("data-current-time")))
    .toBeGreaterThan(before + 0.1);
  await page.getByRole("button", { name: "Pause LOOP30" }).click();
  const held = await page
    .locator("video")
    .evaluate((v) => (v as HTMLVideoElement).currentTime);
  await page.waitForTimeout(300);
  expect(
    await page
      .locator("video")
      .evaluate((v) => (v as HTMLVideoElement).currentTime),
  ).toBe(held);
  await page.getByLabel("LOOP30 character detail").selectOption("16");
  await expect(field).toHaveAttribute("data-detail", "original");
  await page.getByLabel("LOOP30 character detail").selectOption("12");
  await expect(field).toHaveAttribute("data-detail", "fine");
});

test("provisioned Digital Wake keeps modes, presets, source trace, pause, seek and loop history", async ({
  page,
}) => {
  test.skip(
    !provisioned,
    "Accepted video and sidecars intentionally absent from clean clones",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/effects/digital-wake");
  await page.waitForFunction(() => !!window.__wake);
  await page.evaluate(() => window.__wake!.ready());
  await expect(
    page.getByRole("button", { name: "PLAY ▶", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "SUBTLE", exact: true }).click();
  expect(await page.evaluate(() => window.__wake!.config().wakeVelocity)).toBe(
    1.15,
  );
  await page.getByRole("button", { name: "EXPRESSIVE", exact: true }).click();
  expect(await page.evaluate(() => window.__wake!.config().wakeVelocity)).toBe(
    1.7,
  );
  const trace = await page.evaluate(() => {
    const api = window.__wake!,
      births = api.births().flat();
    return {
      n: births.length,
      valid: births.every(
        (b) =>
          b.valid &&
          b.sourceTime === b.frame / 30 &&
          b.rgb.length === 3 &&
          b.emitterId &&
          b.motionFrame === b.frame,
      ),
    };
  });
  expect(trace.n).toBeGreaterThan(1000);
  expect(trace.valid).toBe(true);
  for (const mode of ["Original", "ASCII", "Pointillism", "Hybrid"]) {
    await page
      .getByRole("button", { name: new RegExp("^" + mode + " "), exact: false })
      .filter({ has: page.locator("strong") })
      .click();
    expect(await page.evaluate(() => window.__wake!.config().mode)).toBe(
      mode.toLowerCase(),
    );
  }
  await page.getByRole("button", { name: "PLAY ▶", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((v) => (v as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0.1);
  await page.getByRole("button", { name: "PAUSE Ⅱ", exact: true }).click();
  const held = await page
    .locator("video")
    .evaluate((v) => (v as HTMLVideoElement).currentTime);
  await page.waitForTimeout(250);
  expect(
    await page
      .locator("video")
      .evaluate((v) => (v as HTMLVideoElement).currentTime),
  ).toBe(held);
  await page.getByLabel("Video time").evaluate(input => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"12");
    input.dispatchEvent(new Event("input",{bubbles:true}));
    input.dispatchEvent(new Event("change",{bubbles:true}));
  });
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((v) => (v as HTMLVideoElement).currentTime),
    )
    .toBeCloseTo(12, 1);
  const cyclic = await page.evaluate(() => {
    const api = window.__wake!;
    const a = api.particles(0.1),
      b = api.particles(30.1);
    return {
      n: a.length,
      equal: a.every(
        (p, i) =>
          p.birth.id === b[i]?.birth.id &&
          Math.abs(p.x - b[i].x) < 1e-9 &&
          Math.abs(p.alpha - b[i].alpha) < 1e-9,
      ),
    };
  });
  expect(cyclic.n).toBeGreaterThan(0);
  expect(cyclic.equal).toBe(true);
  await page
    .locator("summary")
    .filter({ hasText: "Presets / receipts" })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "EXPORT PRESET JSON", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("digital-wake-preset-v1.json");
  const preset = await page.evaluate(() => window.__wake!.config());
  preset.wakeVelocity = 1.2;
  await page
    .locator("input[type=file]")
    .last()
    .setInputFiles({
      name: "owner-preset.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(preset)),
    });
  await expect
    .poll(() => page.evaluate(() => window.__wake!.config().wakeVelocity))
    .toBe(1.2);
  expect(errors).toEqual([]);
});

test("browser-local file selection keeps video local and suppresses unverified wake", async ({
  page,
}) => {
  test.skip(
    !provisioned,
    "Uses local accepted asset to exercise the file selector",
  );
  const uploads: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" && r.method() !== "HEAD") uploads.push(r.url());
  });
  await page.route("**/media/local/**", (route) =>
    route.fulfill({ status: 404, body: "Unavailable" }),
  );
  await page.goto("/effects/digital-wake");
  await page.locator("summary").filter({ hasText: "Video & source" }).click();
  await page.locator("input[type=file]").first().setInputFiles(media);
  await expect
    .poll(() =>
      page.locator("video").evaluate((v) => (v as HTMLVideoElement).readyState),
    )
    .toBeGreaterThanOrEqual(2);
  expect(await page.locator("video").getAttribute("src")).toMatch(/^blob:/);
  expect(await page.evaluate(() => window.__wake!.births().flat().length)).toBe(
    0,
  );
  await page.getByRole("button", { name: "PLAY ▶", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .evaluate((v) => (v as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0.1);
  expect(uploads).toEqual([]);
});

test("reduced motion pauses media and suppresses wake including debug", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/effects/digital-wake");
  await page.waitForFunction(() => !!window.__wake);
  expect(
    await page.locator("video").evaluate((v) => (v as HTMLVideoElement).paused),
  ).toBe(true);
  expect(await page.evaluate(() => window.__wake!.births().flat())).toEqual([]);
  await page.getByRole("button", { name: "Wake debug", exact: false }).click();
  expect(await page.evaluate(() => window.__wake!.particles(2))).toEqual([]);
});
