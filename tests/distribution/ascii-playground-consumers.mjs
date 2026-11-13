// Fresh manual installation from actual clipboard output; no app imports or parent CSS.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
assert.ok(process.env.PLAYGROUND_01C_RECEIPTS, 'Use a unique PLAYGROUND_01C_RECEIPTS directory');
const receipts = resolve(process.env.PLAYGROUND_01C_RECEIPTS);
const output = await mkdtemp(join(tmpdir(), 'nullworx-ascii-01c-'));
const studies = await Promise.all(['procedural', 'video'].map(async mode => ({ mode, ...JSON.parse(await readFile(join(receipts, `copied-${mode}.json`), 'utf8')) })));
const sources = studies[1].sources;
const hash = s => createHash('sha256').update(s).digest('hex');
assert.equal(Object.keys(sources).length, 10);
const hashes = {};
for (const [file, source] of Object.entries(sources)) {
  assert.equal(source, await readFile(join(root, 'components/white-journey', file), 'utf8'));
  hashes[file] = hash(source);
}
const children = [], result = { output, node: process.version, hashes, consumers: [] };
async function put(file, content) { await mkdir(dirname(file), { recursive: true }); await writeFile(file, content); }
async function run(cwd, name, args) {
  const child = spawn('pnpm', args, { cwd, env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = `$ pnpm ${args.join(' ')}\n`;
  child.stdout.on('data', s => { log += s; }); child.stderr.on('data', s => { log += s; });
  const exit = await new Promise((ok, fail) => { child.on('error', fail); child.on('close', ok); });
  await writeFile(join(output, `${name}.log`), `${log}\nexit=${exit}\n`);
  assert.equal(exit, 0, `${name}: ${log.slice(-4000)}`); console.log(`${name}: exit=0`);
}
async function start(cwd, kind, port) {
  const child = spawn('pnpm', ['start', '--port', String(port)], { cwd, detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let log = ''; child.stdout.on('data', s => { log += s; }); child.stderr.on('data', s => { log += s; });
  child.on('close', () => writeFile(join(output, `${kind}-server.log`), log));
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 150; i++) { if (child.exitCode !== null) throw new Error(log); if (await fetch(url).then(r => r.ok).catch(() => false)) return url; await new Promise(ok => setTimeout(ok, 200)); }
  throw new Error(log);
}
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
  for (const [i, kind] of ['next', 'vite'].entries()) {
    const cwd = join(output, kind); await cp(join(root, 'tests/distribution/fixtures', kind), cwd, { recursive: true });
    for (const file of await readdir(cwd)) if (file.endsWith('.template')) { const name = file.slice(0, -9); await put(join(cwd, kind === 'next' && ['page.tsx', 'layout.tsx'].includes(name) ? 'app' : '', name), await readFile(join(cwd, file))); }
    const imports = [], sections = [];
    for (const study of studies) for (const [variant, code] of Object.entries({ paused: study.usage, running: study.runningUsage })) {
      const name = `${study.mode}-${variant}`, component = `Study${study.mode}${variant}`;
      await put(join(cwd, `${name}.tsx`), code);
      imports.push(`import { MyInterface as ${component} } from './${name}';`);
      sections.push(`<section id="${name}"><h2>${name}</h2><${component} /></section>`);
    }
    const baseline = execFileSync('git', ['show', '6c5779b:components/white-journey/procedural-ascii.tsx'], { cwd: root, encoding: 'utf8' });
    await put(join(cwd, 'components/white-journey/baseline-procedural.tsx'), baseline);
    await put(join(cwd, 'default-usage.tsx'), studies[0].defaultUsage);
    imports.push("import { MyInterface as DefaultUsage } from './default-usage';", "import { ProceduralAscii as Baseline } from './components/white-journey/baseline-procedural';");
    sections.push('<section id="default"><h2>Original defaults</h2><DefaultUsage /></section>', '<section id="baseline"><h2>01B procedural baseline</h2><div style={{border:"1px solid transparent"}}><div style={{height:"clamp(300px, 48vw, 560px)"}}><Baseline /></div></div></section>');
    for (const [file, source] of Object.entries(sources)) await put(join(cwd, 'components/white-journey', file), source);
    await put(join(cwd, 'NULLWORX-LICENSE'), await readFile(join(root, 'LICENSE')));
    await put(join(cwd, kind === 'next' ? 'app/globals.css' : 'globals.css'), 'body{margin:0;padding:16px;font:16px system-ui;color:#20192c;background:#faf7f3}main{max-width:960px;margin:auto}input{max-width:100%;min-height:44px}button{min-height:44px}');
    await put(join(cwd, 'Demo.tsx'), `${imports.join('\n')}\nexport function Demo(){return <main><h1>ASCII clipboard consumers</h1>${sections.join('')}</main>}`);
    await run(cwd, `${kind}-install`, ['install', '--frozen-lockfile']);
    await run(cwd, `${kind}-typecheck`, ['typecheck']); await run(cwd, `${kind}-build`, ['build']);
    const url = await start(cwd, kind, Number(process.env.ASCII_CONSUMER_PORT ?? 3490) + i);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, hasTouch: true });
    const page = await context.newPage(), errors = [], writes = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('request', r => { if (r.method() !== 'GET') writes.push(r.url()); });
    await page.goto(url);
    const procedural = page.locator('#procedural-running [data-procedural-ascii]');
    await procedural.scrollIntoViewIfNeeded(); await expect(procedural).toHaveAttribute('data-playing', 'true');
    const time = await procedural.getAttribute('data-time'); await expect.poll(() => procedural.getAttribute('data-time')).not.toBe(time);
    const paused = page.locator('#procedural-paused [data-procedural-ascii]');
    await paused.scrollIntoViewIfNeeded(); await expect(paused).toHaveAttribute('data-playing', 'false');
    const held = await paused.getAttribute('data-time'); await page.waitForTimeout(200); assert.equal(await paused.getAttribute('data-time'), held);
    for (const variant of ['paused', 'running']) {
      const section = page.locator(`#video-${variant}`);
      await section.getByLabel('ASCII local video', { exact: true }).setInputFiles(join(receipts, 'synthetic-test.webm'));
      await section.locator('[data-ascii-field]').scrollIntoViewIfNeeded();
      await expect.poll(() => section.locator('[data-ascii-field]').getAttribute('data-frame')).not.toBe(null);
      await expect(section.locator('video')).toHaveJSProperty('paused', variant === 'paused');
      const first = await section.locator('[data-ascii-field]').getAttribute('data-frame');
      if (variant === 'running') await expect.poll(() => section.locator('[data-ascii-field]').getAttribute('data-frame')).not.toBe(first);
      else { await page.waitForTimeout(300); assert.equal(await section.locator('[data-ascii-field]').getAttribute('data-frame'), first); }
      // The retained adapter controls share the generated component's settings state.
      const select = section.getByLabel('local video character detail');
      const choice = await select.inputValue() === '16' ? '12' : '16';
      const oldCell = JSON.parse(await section.getByTestId('koi-home-field').getAttribute('data-settings')).cellSize;
      await select.selectOption(choice);
      await expect.poll(async () => JSON.parse(await section.getByTestId('koi-home-field').getAttribute('data-settings')).cellSize).not.toBe(oldCell);
      const toggle = section.getByRole('button', { name: variant === 'paused' ? 'Play local video' : 'Pause local video', exact: true });
      await toggle.click();
      await expect(section.locator('video')).toHaveJSProperty('paused', variant !== 'paused');
      await section.getByRole('button', { name: variant === 'paused' ? 'Pause local video' : 'Play local video', exact: true }).click();
      await expect(section.locator('video')).toHaveJSProperty('paused', variant === 'paused');
      const oldSource = await section.locator('video').evaluate(v => v.currentSrc);
      await section.getByLabel('ASCII local video').setInputFiles(join(receipts, 'synthetic-test.webm'));
      await expect(select).toHaveValue(choice);
      await expect.poll(() => section.locator('video').evaluate(v => v.currentSrc)).not.toBe(oldSource);
      await section.getByRole('button', { name: 'Clear local video' }).click(); await expect(section.locator('video')).toHaveCount(0);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const widths = [320, 390, 768, 1440], parity = [];

    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.locator('#default').scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      const canvas = section => page.locator(`#${section} [data-procedural-ascii] canvas`).evaluate(c => c.toDataURL());
      await expect.poll(() => canvas('default')).toBe(await canvas('baseline'));
      parity.push({ width, defaultHash: hash(await canvas('default')), baselineHash: hash(await canvas('baseline')), exactPixels: true });
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      await writeFile(join(output, `${kind}-axe-${width}.json`), JSON.stringify(axe.violations, null, 2)); assert.deepEqual(axe.violations, []);
      await page.screenshot({ path: join(output, `${kind}-${width}.png`), fullPage: true });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' }); await procedural.scrollIntoViewIfNeeded(); await expect(procedural).toHaveAttribute('data-playing', 'false');
    await page.reload(); await procedural.scrollIntoViewIfNeeded(); await expect(procedural).toHaveAttribute('data-playing', 'false');
    assert.deepEqual(errors, []); assert.deepEqual(writes, []);
    result.consumers.push({ kind, cwd, url, dependencies: JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')).dependencies, install: 0, typecheck: 0, build: 0, runtime: 'PASS: both modes paused/running, local file/clear, reduced motion initial/live', widths, proceduralBaselineParity: parity, axeViolations: 0, errors, writes });
    await context.close();
  }
} catch (error) { result.failure = String(error.stack ?? error); throw error; }
finally { await writeFile(join(receipts, 'consumer-results.json'), JSON.stringify(result, null, 2)); await browser?.close(); for (const child of children) { try { process.kill(-child.pid, 'SIGTERM'); } catch { /* exited */ } } }
