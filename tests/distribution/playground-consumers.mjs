// Manual copy/paste proof. The public GitHub/shadcn installation test stays separate.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const receipts = join(root, 'evidence/live-playground-01a');
const copied = JSON.parse(await readFile(join(receipts, 'copied.json'), 'utf8'));
const output = await mkdtemp(join(tmpdir(), 'nullworx-playground-01a-'));
const files = ['magnetic-focus.tsx', 'magnetic-focus.module.css', 'use-reduced-motion.ts'];
assert.deepEqual(Object.keys(copied.sources), files);
const hashes = {};
for (const file of files) {
  assert.equal(copied.sources[file], await readFile(join(root, 'components/forge-factory-01', file), 'utf8'));
  hashes[file] = createHash('sha256').update(copied.sources[file]).digest('hex');
}
const children = [];
const result = { output, node: process.version, mode: 'Fresh pinned fixtures; actual browser clipboard TSX and source files; manual installation', hashes, consumers: [] };
console.log(`Fresh clipboard consumers and receipts: ${output}`);

async function put(path, content) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, content); }
async function run(cwd, name, args) {
  const child = spawn('pnpm', args, { cwd, env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = `$ pnpm ${args.join(' ')}\n`;
  child.stdout.on('data', data => { log += data; });
  child.stderr.on('data', data => { log += data; });
  const code = await new Promise((ok, fail) => { child.on('error', fail); child.on('close', ok); });
  await writeFile(join(output, `${name}.log`), `${log}\nexit=${code}\n`);
  assert.equal(code, 0, `${name}: ${log.slice(-3000)}`);
  console.log(`${name}: PASS`);
}
async function start(cwd, kind, port) {
  const child = spawn('pnpm', ['start', '--port', String(port)], { cwd, detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let log = '';
  child.stdout.on('data', data => { log += data; }); child.stderr.on('data', data => { log += data; });
  child.on('close', () => writeFile(join(output, `${kind}-server.log`), log));
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 150; i++) {
    if (child.exitCode !== null) throw new Error(log);
    if (await fetch(url).then(r => r.ok).catch(() => false)) return url;
    await new Promise(ok => setTimeout(ok, 200));
  }
  throw new Error(`${kind} startup timed out: ${log}`);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const [index, kind] of ['next', 'vite'].entries()) {
    const cwd = join(output, kind);
    await cp(join(root, 'tests/distribution/fixtures', kind), cwd, { recursive: true });
    for (const file of await readdir(cwd)) if (file.endsWith('.template')) {
      const name = file.slice(0, -9);
      const appFile = kind === 'next' && ['page.tsx', 'layout.tsx'].includes(name);
      await put(join(cwd, appFile ? 'app' : '', name), await readFile(join(cwd, file)));
    }
    await put(join(cwd, 'MagneticFocusDemo.tsx'), copied.usage);
    await put(join(cwd, 'LongLabelDemo.tsx'), copied.longUsage);
    for (const file of files) await put(join(cwd, 'components/forge-factory-01', file), copied.sources[file]);
    await put(join(cwd, 'NULLWORX-LICENSE'), await readFile(join(root, 'LICENSE')));
    await put(join(cwd, kind === 'next' ? 'app/globals.css' : 'globals.css'), await readFile(join(root, 'tests/distribution/fixtures/shared/globals.css.template')));
    // The demo owns its heading; no reset or component styling is supplied here.
    await put(join(cwd, 'Demo.tsx'), 'import { MyInterface } from "./MagneticFocusDemo";\nimport { MyInterface as LongLabel } from "./LongLabelDemo";\nexport function Demo() { return <main><h1>Clipboard consumer</h1><MyInterface /><section aria-label="Long label"><LongLabel /></section></main>; }\n');
    await run(cwd, `${kind}-install`, ['install', '--frozen-lockfile']);
    await run(cwd, `${kind}-typecheck`, ['typecheck']);
    await run(cwd, `${kind}-build`, ['build']);
    const url = await start(cwd, kind, Number(process.env.PLAYGROUND_CONSUMER_PORT ?? 3470) + index);
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, hasTouch: true });
    const page = await context.newPage();
    const errors = [], failed = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => failed.push(request.url()));
    await page.goto(url);
    const button = page.getByRole('button', { name: copied.settings.label, exact: true });
    await expect(button).toHaveCSS('background-color', 'rgb(86, 60, 145)');
    await expect(button).toHaveAttribute('data-motion', copied.settings.paused ? 'disabled' : 'enabled');
    await button.click();
    await button.focus();
    await expect(button).toHaveCSS('outline-width', '3px');
    await page.keyboard.press('Enter'); await page.keyboard.press('Space');
    await expect(page.getByRole('status').first()).toHaveText('Activated 3 times');
    const rect = await button.boundingBox();
    await button.dispatchEvent('pointermove', { clientX: rect.x + 5, clientY: rect.y + 5, pointerType: 'mouse' });
    const x = await button.evaluate(el => Math.abs(Number.parseFloat(el.style.getPropertyValue('--mf-x'))));
    assert.ok(x > 0 && x <= copied.settings.intensity * 12, `Intensity follows copied TSX: ${x}`);
    await button.dispatchEvent('pointercancel');
    await button.dispatchEvent('pointermove', { clientX: rect.x + 5, clientY: rect.y + 5, pointerType: 'touch' });
    assert.equal(await button.evaluate(el => el.style.getPropertyValue('--mf-x')), '0px');
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const longLabel = page.getByRole('button', { name: 'A'.repeat(80), exact: true }).locator('span').nth(1);
      assert.equal(await longLabel.evaluate(el => el.scrollWidth <= el.clientWidth), true, 'Long labels wrap without clipping');
      await page.screenshot({ path: join(output, `${kind}-${width}.png`), fullPage: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(axe.violations, []);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(button).toHaveAttribute('data-motion', 'disabled');
    await expect(button).toHaveCSS('transform', 'none');
    await page.reload();
    await expect(button).toHaveAttribute('data-motion', 'disabled');
    await button.tap();
    await expect(page.getByRole('status').first()).toHaveText('Activated 1 times');
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    result.consumers.push({ kind, cwd, url, dependencies: JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')).dependencies, typecheck: 'PASS', build: 'PASS', clipboardUsageSha256: createHash('sha256').update(copied.usage).digest('hex'), keyboard: 'PASS', touch: 'PASS', intensity: 'PASS', reducedMotion: 'PASS', widths: [1280, 390, 320], axeViolations: 0, errors, failed });
    await context.close();
  }
  console.log('Clipboard TSX and source files in fresh Next.js and Vite fixtures: PASS');
} catch (error) {
  result.failure = String(error.stack ?? error);
  throw error;
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(join(receipts, 'consumer-results.json'), JSON.stringify(result, null, 2) + '\n');
  await browser?.close();
  for (const child of children) { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already stopped. */ } }
}
