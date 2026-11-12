import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const output = await mkdtemp(join(tmpdir(), 'nullworx-site-'));
console.log(`Site receipts: ${output}`);
const port = Number(process.env.DISTRIBUTION_SITE_PORT ?? 3460);
const url = `http://127.0.0.1:${port}`;
const child = spawn('pnpm', ['start', '--port', String(port)], { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '', browser;
child.stdout.on('data', data => { log += data; }); child.stderr.on('data', data => { log += data; });
const effects = ['magnetic-focus', 'glyph-morph', 'prism-text', 'ascii-waves', 'digital-wake', 'ashfall-type', 'seam-erosion', 'sediment-reveal'];
const results = { routes: [], accessibility: [], expectedMissingMedia: [], unexpected: [] };
try {
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null) throw new Error(log);
    if (await fetch(url).then(r => r.ok).catch(() => false)) break;
    await new Promise(ok => setTimeout(ok, 200));
  }
  browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--disable-dev-shm-usage'] });
  results.browser = browser.version();
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    page.on('pageerror', e => results.unexpected.push(e.message));
    page.on('console', e => {
      if (e.type() === 'error' && !e.location().url.includes('/media/local/')) results.unexpected.push({ console: e.text(), location: e.location() });
    });
    page.on('response', r => { if (r.status() >= 400) {
      const receipt = { status: r.status(), url: r.url() };
      if (new URL(r.url()).pathname.startsWith('/media/local/')) results.expectedMissingMedia.push(receipt);
      else results.unexpected.push(receipt);
    } });
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/effects', ...effects.map(s => `/effects/${s}`)]) {
        const response = await page.goto(url + route);
        assert.equal(response.status(), 200);
        await expect(page.locator('main')).toHaveCount(1);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        if (route === '/' || route === '/effects/ascii-waves') {
          const field = page.locator('[data-procedural-ascii]').first();
          await field.scrollIntoViewIfNeeded();
          await expect(field).toHaveAttribute('data-reduced', String(reducedMotion === 'reduce'));
          await expect(field).toHaveAttribute('data-playing', String(reducedMotion !== 'reduce'));
          await expect(page.locator('video')).toHaveCount(0);
          await expect(page.getByLabel('ASCII local video')).toBeVisible();
          await expect(page.getByText('● LIVE', { exact: true })).toHaveCount(0);
        }
        if (route === '/effects/digital-wake') {
          await expect(page.getByText('VIDEO UNAVAILABLE', { exact: true })).toBeVisible();
          await page.waitForFunction(() => !!window.__wake);
          assert.equal(await page.evaluate(() => window.__wake.metrics().sourceVerified), false);
          assert.equal(await page.evaluate(() => window.__wake.births().flat().length), 0);
        }
        if (route === '/effects/magnetic-focus' && reducedMotion === 'reduce') await expect(page.locator('[data-effect="magnetic-focus"]')).toHaveAttribute('data-motion', 'disabled');
        if (route === '/effects/glyph-morph' && reducedMotion === 'reduce') await expect(page.getByTestId('glyph-morph-visible')).toHaveText('HELLO WORLD');
        if (route === '/effects/prism-text' && reducedMotion === 'reduce') await expect(page.locator('[data-effect="prism-text"]')).toHaveCSS('animation-name', 'none');
        if (/ashfall-type|seam-erosion|sediment-reveal/.test(route)) {
          await expect(page.locator('[data-material-surface]')).toHaveAttribute('data-ready', 'true');
          if (reducedMotion === 'reduce') {
            await expect(page.getByTestId('play')).toBeDisabled();
            assert.equal(await page.evaluate(() => window.__materialWaveA.snapshot().resources.raf), 0);
          }
        }
        results.routes.push({ route, width, reducedMotion, status: 'PASS' });
        if (width === 1440 && reducedMotion === 'no-preference') {
          const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
          results.accessibility.push({ route, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
        }
        if (width === 320) await page.screenshot({ path: join(output, `${route.replaceAll('/', '_') || 'home'}-${reducedMotion}.png`), fullPage: true });
      }
    }
    await context.close();
  }
  assert.deepEqual(results.unexpected, []);
  const violations = results.accessibility.flatMap(r => r.violations.map(v => ({ route: r.route, ...v })));
  console.log(`Routes/responsive/motion: ${results.routes.length} PASS; accessibility violations: ${violations.length}`);
  assert.equal(violations.length, 0, 'Full-page accessibility findings require review; see results.json');
} catch (error) { results.failure = String(error.stack ?? error); throw error; }
finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  await writeFile(join(output, 'server.log'), log);
  await browser?.close();
  try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already stopped. */ }
}
