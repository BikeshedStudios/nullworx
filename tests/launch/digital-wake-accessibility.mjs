import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const report = { browser: browser.version(), states: [], keyboard: [], errors: [] };
const output = process.env.A11Y_REPORT ?? '/tmp/nullworx-digital-wake-accessibility.json';
try {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    await page.goto((process.env.SEO_BASE_URL ?? 'http://127.0.0.1:3350') + '/effects/digital-wake');
    await page.waitForFunction(() => !!window.__wake);
    await expect(page.getByText('VIDEO UNAVAILABLE', { exact: true })).toBeVisible();
    async function scan(state) {
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, html, any, all, none, failureSummary }) => ({ target, html, any, all, none, failureSummary })) }));
      report.states.push({ state, reducedMotion, width: page.viewportSize().width, violations });
      console.log(`${state} ${reducedMotion}: ${violations.length} rules, ${violations.flatMap(v => v.nodes).length} nodes`);
    }
    await scan('default');
    const modes = page.locator('.digital-wake .mode-tabs button');
    for (let i = 0; i < await modes.count(); i++) {
      const mode = modes.nth(i);
      // Enter activates each native button; Tab moves to the next actual control.
      await mode.focus();
      await page.keyboard.press('Enter');
      await expect(mode).toHaveClass('selected');
      await page.keyboard.press('Tab');
      await expect(mode).not.toBeFocused();
      await mode.focus();
      const focus = await mode.evaluate(e => { const s = getComputedStyle(e); return { visible: e.matches(':focus-visible'), style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor }; });
      report.keyboard.push({ mode: await mode.innerText(), reducedMotion, focus });
      assert.ok(focus.visible && focus.style !== 'none' && parseFloat(focus.width) >= 2, 'Visible keyboard focus');
      await mode.hover();
      await scan(`selected-hover-focus mode ${i + 1}`);
    }
    for (const summary of await page.locator('.digital-wake summary').all()) {
      const before = await summary.evaluate(e => e.parentElement.open);
      await summary.focus();
      await page.keyboard.press('Enter');
      assert.equal(await summary.evaluate(e => e.parentElement.open), !before);
      if (before) await page.keyboard.press('Space');
      assert.equal(await summary.evaluate(e => e.parentElement.open), true);
    }
    await scan('all controls expanded');
    const range = page.locator('.range').filter({ hasText: 'Fin emission strength' }).locator('input');
    await range.focus();
    const value = Number(await range.inputValue());
    await page.keyboard.press('ArrowLeft');
    assert.ok(Number(await range.inputValue()) < value, 'Range responds to keyboard');
    const checkbox = page.getByLabel('Wake enabled', { exact: true });
    const checked = await checkbox.isChecked();
    await checkbox.focus();
    await page.keyboard.press('Space');
    assert.equal(await checkbox.isChecked(), !checked);
    const file = page.locator('.upload-btn').filter({ hasText: 'CHOOSE VIDEO' }).locator('input');
    await file.focus();
    await expect(file).toBeFocused();
    const fileFocus = await file.locator('..').evaluate(e => { const s = getComputedStyle(e); return { within: e.matches(':focus-within'), style: s.outlineStyle, width: s.outlineWidth }; });
    report.keyboard.push({ fileFocus, reducedMotion });
    assert.ok(fileFocus.within && fileFocus.style !== 'none' && parseFloat(fileFocus.width) >= 2, 'Visible file chooser focus');
    await page.setViewportSize({ width: 320, height: 900 });
    await scan('all controls expanded mobile');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const motion = await page.evaluate(() => ({ reduced: window.__wake.metrics().reducedMotion, births: window.__wake.births().flat().length, particles: window.__wake.particles(2).length }));
    report.keyboard.push({ reducedMotion, motion });
    assert.equal(motion.reduced, reducedMotion === 'reduce');
    assert.equal(motion.births, 0);
    assert.equal(motion.particles, 0);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  assert.equal(report.states.flatMap(s => s.violations).length, 0, 'All contrast/accessibility findings must be resolved');
} catch (error) {
  report.failure = String(error.stack ?? error);
  throw error;
} finally {
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  console.log(`Accessibility report: ${output}`);
}
