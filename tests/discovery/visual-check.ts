import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { getIndexableEffects } from "../../lib/discovery/eligibility";

const baseUrl = process.env.SEO_BASE_URL ?? "http://127.0.0.1:3350";
const failures: string[] = [];
let checks = 0;

function check(condition: boolean, message: string) {
  checks += 1;
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    failures.push(message);
    console.error(`FAIL ${message}`);
  }
}

async function main() {
  await mkdir("test-results/discovery", { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    for (const effect of getIndexableEffects()) {
      await page.goto(`${baseUrl}${effect.canonicalPath}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(250);
      const mainCount = await page.locator("main").count();
      const docsCount = await page.locator("#effect-notes").count();
      const heading = page.locator(`#about-${effect.slug}`);
      const ldCount = await page.locator('script[type="application/ld+json"]').count();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
      check(mainCount === 1, `${effect.canonicalPath} @${width}: exactly one main landmark`);
      check(docsCount === 1, `${effect.canonicalPath} @${width}: server documentation section present once`);
      check(await heading.isVisible(), `${effect.canonicalPath} @${width}: documentation heading visible`);
      check(ldCount >= 1, `${effect.canonicalPath} @${width}: JSON-LD present`);
      check(overflow, `${effect.canonicalPath} @${width}: no horizontal overflow`);
      await heading.scrollIntoViewIfNeeded();
      await page.locator("#effect-notes").screenshot({
        path: `test-results/discovery/${effect.slug}-${width}.png`,
        animations: "disabled",
      });
    }

    await page.goto(`${baseUrl}/effects/digital-wake`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
    const wakeDocs = await page.locator("#effect-notes").count();
    const wakeRobots = await page.locator('meta[name="robots"]').getAttribute("content");
    const wakeMain = await page.locator("main").count();
    const wakeOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
    check(wakeDocs === 0, `/effects/digital-wake @${width}: no indexable discovery section`);
    check(wakeRobots?.includes("noindex") === true, `/effects/digital-wake @${width}: noindex retained`);
    check(wakeMain === 1, `/effects/digital-wake @${width}: exactly one main landmark`);
    check(wakeOverflow, `/effects/digital-wake @${width}: no horizontal overflow`);

    check(errors.length === 0, `${width}px: no page errors (${errors.join(" | ") || "none"})`);
    await page.close();
  }

  await browser.close();
  console.log(`\n${checks - failures.length}/${checks} visual checks passed.`);
  if (failures.length) {
    console.error(`\n${failures.length} visual checks failed.`);
    process.exitCode = 1;
  } else {
    console.log("PASS: documentation sections render without overflow or page errors.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
