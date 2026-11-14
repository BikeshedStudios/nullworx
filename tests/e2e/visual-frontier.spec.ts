import { test, expect, type Locator } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { FRONTIER_SOURCE_FILES } from "../../lib/visual-frontier";

const picture = async (canvas: Locator) => createHash("sha256").update(await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).digest("hex");

test("homepage and gallery mount live A/C companions without allocating WebGL", async ({ page }) => {
  for (const path of ["/", "/effects"]) {
    const heavy: string[] = [];
    page.on("request", r => { if (/harfbuzz|three-text|refractive.*\.js|quicksilver.*\.js/.test(r.url())) heavy.push(r.url()); });
    await page.goto(path);
    for (const id of ["refractive", "impossible"]) {
      const card = page.locator(`[data-live-preview="${id}"]`);
      await card.scrollIntoViewIfNeeded();
      const surface = card.locator("[data-frontier]");
      await expect(surface).toHaveAttribute("data-mode", "light");
      const canvas = surface.locator("canvas");
      await expect(canvas).toBeVisible();
      const before = await picture(canvas);
      await expect.poll(() => picture(canvas)).not.toBe(before);
      await card.getByRole("button", { name: /^Pause/ }).click();
      await expect(surface.locator('[role="img"]')).toHaveAttribute("data-running", "false");
    }
    expect(heavy).toEqual([]);
  }
});

test("bounded gallery cards activate the approved renderers one at a time", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/effects");
  const type=page.locator('[data-live-preview="refractive"]'), material=page.locator('[data-live-preview="impossible"]');
  for (const [card,name] of [[type,"Refractive Type"],[material,"Impossible Material"]] as const) {
    await card.getByRole("button",{name:`Activate full ${name} preview`,exact:true}).click();
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("[data-frontier]")).toHaveAttribute("data-status","ready");
    await expect(card.locator("[data-frontier]")).toHaveAttribute("data-mode","full");
    await expect(page.locator('[data-frontier][data-mode="full"]')).toHaveCount(1);
  }
  await expect(type.locator("[data-frontier]")).toHaveAttribute("data-mode","light");
  await material.getByRole("button",{name:"Use lightweight Impossible Material preview",exact:true}).click();
  await expect(page.locator('[data-frontier][data-mode="full"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const [slug, prefix, controls] of [
  ["refractive-type", "A", ["Dispersion", "Deformation"]],
  ["impossible-material", "C", ["Tension", "Iridescence"]],
] as const) {
  test(`${slug}: both full variants, controls, pointer/keyboard, pause, reset and reduced motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/effects/${slug}`);
    await page.getByRole("button", { name: "Activate full WebGL effect", exact: true }).click();
    const surface=page.locator("[data-frontier]"), host=surface.locator('[role="img"]');
    const variants: string[] = [];
    for (const variant of [0,1]) {
      if (variant) await page.getByRole("button", { name: new RegExp(`^${prefix}2 /`) }).click();
      await surface.scrollIntoViewIfNeeded();
      await expect(surface).toHaveAttribute("data-status", "ready");
      await expect(surface).toHaveAttribute("data-variant", String(variant));
      await expect(surface).toHaveAttribute("data-mode", "full");
      await expect(surface.locator("canvas")).toHaveCount(1);
      await expect(host).toHaveAttribute("data-running", "false");
      const canvas=surface.locator("canvas"), initial=await picture(canvas);
      variants.push(initial);
      for (const name of controls) {
        const before=await picture(canvas);
        await page.getByRole("slider",{name,exact:true}).focus();
        await page.getByRole("slider",{name,exact:true}).press("End");
        await surface.scrollIntoViewIfNeeded();
        await expect.poll(()=>picture(canvas)).not.toBe(before);
      }
      const before=await picture(canvas);
      await host.focus();await host.press("ArrowRight");
      await expect.poll(()=>picture(canvas)).not.toBe(before);
      await page.getByRole("button",{name:"Reset",exact:true}).click();
      await surface.scrollIntoViewIfNeeded();
      await expect.poll(()=>picture(canvas)).toBe(initial);
      await page.getByRole("button",{name:"Play",exact:true}).click();
      await surface.scrollIntoViewIfNeeded();
      await expect(host).toHaveAttribute("data-running","true");
      const running=await picture(canvas);await expect.poll(()=>picture(canvas)).not.toBe(running);
      await page.getByRole("button",{name:"Pause",exact:true}).click();
      await surface.scrollIntoViewIfNeeded();await expect(host).toHaveAttribute("data-running","false");
      const stopped=await picture(canvas);await page.waitForTimeout(180);expect(await picture(canvas)).toBe(stopped);
      await page.getByRole("button",{name:"Reset",exact:true}).click();
    }
    expect(variants[0]).not.toBe(variants[1]);expect(errors).toEqual([]);
  });
}

test("full renderer errors show a live fallback and complete copyable source is exact", async ({ page, request }) => {
  await page.addInitScript(() => {
    const get=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this: HTMLCanvasElement, ...args: Parameters<typeof get>) {
      return /webgl/.test(args[0]) ? null : get.apply(this,args);
    } as typeof get;
  });
  await page.goto("/effects/refractive-type");
  await page.getByRole("button",{name:"Activate full WebGL effect",exact:true}).click();
  await page.locator("[data-frontier]").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-frontier]").getByRole("alert")).toContainText(/WebGL2/);
  await expect(page.locator("[data-frontier]")).toHaveAttribute("data-mode","light");
  await expect(page.locator("[data-frontier] canvas")).toBeVisible();
  const response=await request.get("/api/effects/visual-frontier/source");expect(response.status()).toBe(200);
  const {sources}=await response.json();
  expect(Object.keys(sources)).toEqual([...FRONTIER_SOURCE_FILES]);
  for (const file of FRONTIER_SOURCE_FILES) expect(sources[file]).toBe(readFileSync(`components/visual-frontier/${file}`,"utf8"));
});
