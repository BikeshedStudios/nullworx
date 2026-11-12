import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkConsumer(browser, url, output) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  page.on('requestfailed', r => failed.push(r.url()));
  try {
    await page.goto(url);
    const button = page.getByRole('button', { name: 'Open field', exact: true });
    const count = page.getByRole('status');
    await expect(button).toHaveCSS('background-color', 'rgb(86, 60, 145)');
    await button.click(); await expect(count).toHaveText('Activated 1 times');
    await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await expect(button).toHaveCSS('outline-width', '3px');
    await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    await expect(count).toHaveText('Activated 3 times');
    const move = () => button.dispatchEvent('pointermove', { clientX: 300, clientY: 160, pointerType: 'mouse' });
    const dx = () => button.evaluate(b => b.style.getPropertyValue('--mf-x'));
    await button.hover({ position: { x: 30, y: 20 } });
    await expect.poll(async () => Math.abs(Number.parseFloat(await dx()))).toBeGreaterThan(0);
    expect(Math.abs(Number.parseFloat(await dx()))).toBeLessThanOrEqual(12);
    await page.mouse.move(5, 5);
    expect(await dx()).toBe('0px');
    await move(); expect(Number.parseFloat(await dx())).not.toBe(0);
    for (const event of ['pointerout', 'pointercancel', 'focusout']) {
      await move(); await button.dispatchEvent(event); expect(await dx()).toBe('0px');
    }
    await button.dispatchEvent('pointermove', { clientX: 300, clientY: 160, pointerType: 'touch' });
    expect(await dx()).toBe('0px');
    await page.setViewportSize({ width: 320, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });
    // Change preference/props while the pointer is still inside the button.
    await button.blur(); await move();
    await page.getByLabel('Pause motion').evaluate(e => e.click());
    await expect(button).toHaveCSS('transform', 'none');
    await page.getByLabel('Pause motion').evaluate(e => e.click());
    expect(await dx()).toBe('0px');
    await move();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(button).toHaveAttribute('data-motion', 'disabled');
    await expect(button).toHaveCSS('transform', 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(button).toHaveAttribute('data-motion', 'enabled');
    expect(await dx()).toBe('0px');
    await move();
    await page.getByLabel('Disable button').evaluate(e => e.click());
    await expect(button).toBeDisabled();
    await button.dispatchEvent('click'); await expect(count).toHaveText('Activated 3 times');
    await page.getByLabel('Disable button').focus(); await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'After button' })).toBeFocused();
    await page.getByLabel('Disable button').uncheck();
    expect(await dx()).toBe('0px');
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await button.focus();
      const rect = await button.boundingBox(); expect(rect.x).toBeGreaterThanOrEqual(8); expect(rect.x + rect.width).toBeLessThanOrEqual(width - 8);
      await page.screenshot({ path: `${output}-${width}.png`, fullPage: true });
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(axe.violations).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload(); await expect(button).toHaveAttribute('data-motion', 'disabled');
    await button.tap(); await expect(count).toHaveText('Activated 1 times');
    expect(errors).toEqual([]); expect(failed).toEqual([]);
    return { interaction: 'PASS', keyboard: 'PASS', touch: 'PASS', propTransitions: 'PASS', reducedMotion: 'PASS', widths: [1280, 390, 320], axeViolations: 0, errors, failed };
  } finally { await context.close(); }
}
