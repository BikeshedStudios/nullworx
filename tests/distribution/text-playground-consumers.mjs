// Independent manual installation of actual browser clipboard output. No aliases or app styles.
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
const receipts = join(root, 'evidence/live-playground-01b');
const output = await mkdtemp(join(tmpdir(), 'nullworx-playground-01b-'));
const studies = await Promise.all(['glyph-morph', 'prism-text'].map(async slug => ({ slug, ...JSON.parse(await readFile(join(receipts, `copied-${slug}.json`), 'utf8')) })));
const hash = value => createHash('sha256').update(value).digest('hex');
const hashes = {};
for (const study of studies) {
  const files = study.slug === 'glyph-morph' ? ['glyph-morph.tsx', 'glyph-morph.module.css', 'use-reduced-motion.ts'] : ['prism-text.tsx', 'prism-text.module.css'];
  assert.deepEqual(Object.keys(study.sources), files);
  for (const file of files) {
    assert.equal(study.sources[file], await readFile(join(root, 'components/forge-factory-01', file), 'utf8'));
    hashes[file] = hash(study.sources[file]);
  }
}
const children = [];
const result = { output, node: process.version, mode: 'Fresh pinned Next/Vite fixtures; actual clipboard paused/running/80-character usage and complete source/CSS', hashes, consumers: [] };
console.log(`Fresh clipboard consumer receipts: ${output}`);

async function put(path, content) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, content); }
async function run(cwd, name, args) {
  const child = spawn('pnpm', args, { cwd, env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = `$ pnpm ${args.join(' ')}\n`;
  child.stdout.on('data', data => { log += data; }); child.stderr.on('data', data => { log += data; });
  const code = await new Promise((ok, fail) => { child.on('error', fail); child.on('close', ok); });
  await writeFile(join(output, `${name}.log`), `${log}\nexit=${code}\n`);
  assert.equal(code, 0, `${name}: ${log.slice(-4000)}`);
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
    const imports = [], sections = [];
    for (const [i, study] of studies.entries()) {
      for (const [variant, code] of Object.entries({ paused: study.usage, running: study.runningUsage, long: study.longUsage })) {
        const filename = `${study.slug}-${variant}`;
        const component = `Study${i}${variant}`;
        await put(join(cwd, `${filename}.tsx`), code);
        imports.push(`import { MyInterface as ${component} } from "./${filename}";`);
        sections.push(`<section id="${filename}" aria-label="${study.slug} ${variant}"><h2>${study.slug} / ${variant}</h2><${component} /></section>`);
      }
      for (const [file, source] of Object.entries(study.sources)) await put(join(cwd, 'components/forge-factory-01', file), source);
    }
    await put(join(cwd, 'NULLWORX-LICENSE'), await readFile(join(root, 'LICENSE')));
    await put(join(cwd, kind === 'next' ? 'app/globals.css' : 'globals.css'), await readFile(join(root, 'tests/distribution/fixtures/shared/globals.css.template')));
    await put(join(cwd, 'Demo.tsx'), `${imports.join('\n')}\nexport function Demo() { return <main><h1>Clipboard consumers</h1>${sections.join('')}</main>; }\n`);
    await run(cwd, `${kind}-install`, ['install', '--frozen-lockfile']);
    await run(cwd, `${kind}-typecheck`, ['typecheck']);
    await run(cwd, `${kind}-build`, ['build']);
    const url = await start(cwd, kind, Number(process.env.TEXT_CONSUMER_PORT ?? 3480) + index);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true });
    const page = await context.newPage();
    const errors = [], failed = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => failed.push(request.url()));
    await page.goto(url);
    const glyphVisible = page.locator('#glyph-morph-running [data-testid="glyph-morph-visible"]');
    const initial = await glyphVisible.textContent();
    assert.notEqual(initial, studies[0].settings.text, 'Copied Glyph TSX animates before settling');
    await expect.poll(() => glyphVisible.textContent()).not.toBe(initial);
    await expect(glyphVisible).toHaveText(studies[0].settings.text);
    const glyphPaused = page.locator('#glyph-morph-paused [data-testid="glyph-morph-visible"]');
    await expect(glyphPaused).toHaveText(studies[0].settings.text);
    const prismPaused = page.locator('#prism-text-paused [data-effect="prism-text"]');
    const prismRunning = page.locator('#prism-text-running [data-effect="prism-text"]');
    for (const el of [prismPaused, prismRunning]) {
      await expect(el).toHaveText(studies[1].settings.text);
      assert.ok(Math.abs(await el.evaluate(el => Number.parseFloat(getComputedStyle(el).animationDuration)) - 11 / studies[1].settings.speed) < 0.0001);
      await expect(el).toHaveCSS('filter', 'saturate(1.164)');
    }
    await expect(prismPaused).toHaveCSS('animation-play-state', 'paused');
    await expect(prismRunning).toHaveCSS('animation-play-state', 'running');
    const position = () => prismRunning.evaluate(el => getComputedStyle(el).backgroundPosition);
    const first = await position();
    await expect.poll(position).not.toBe(first);
    const pausedPosition = await prismPaused.evaluate(el => getComputedStyle(el).backgroundPosition);
    await page.waitForTimeout(120);
    assert.equal(await prismPaused.evaluate(el => getComputedStyle(el).backgroundPosition), pausedPosition);
    const widths = [320, 390, 768, 1440];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      for (const study of studies) {
        const el = page.locator(`#${study.slug}-long [data-effect="${study.slug}"]`);
        assert.equal(await el.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true, `${study.slug} 80-character text wraps at ${width}px`);
      }
      await page.screenshot({ path: join(output, `${kind}-${width}.png`), fullPage: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      await writeFile(join(output, `${kind}-axe-${width}.json`), JSON.stringify(axe.violations, null, 2) + '\n');
      assert.deepEqual(axe.violations, []);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(prismRunning).toHaveCSS('animation-name', 'none');
    await page.reload();
    await expect(glyphVisible).toHaveText(studies[0].settings.text);
    await expect(prismRunning).toHaveCSS('animation-name', 'none');
    const reducedPosition = await position();
    await page.waitForTimeout(160);
    assert.equal(await position(), reducedPosition);
    await expect(glyphVisible).toHaveText(studies[0].settings.text);
    assert.deepEqual(errors, []); assert.deepEqual(failed, []);
    result.consumers.push({ kind, cwd, url, dependencies: JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')).dependencies, typecheck: 'PASS', build: 'PASS', clipboardUsageHashes: Object.fromEntries(studies.map(s => [s.slug, { paused: hash(s.usage), running: hash(s.runningUsage), long: hash(s.longUsage) }])), runtime: 'PASS: actual Glyph animation/settling, Prism speed/intensity, paused/running variants', reducedMotion: 'PASS: initial and live', widths, axeViolations: 0, errors, failed });
    await context.close();
  }
  console.log('Clipboard TSX, full source and CSS installed in independent Next.js and Vite fixtures: PASS');
} catch (error) {
  result.failure = String(error.stack ?? error);
  throw error;
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(join(receipts, 'consumer-results.json'), JSON.stringify(result, null, 2) + '\n');
  await browser?.close();
  for (const child of children) { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* Already stopped. */ } }
}
