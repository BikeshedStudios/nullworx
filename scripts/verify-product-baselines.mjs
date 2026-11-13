// Mandatory actual-server gate. No route interception or fixture can pass identity/autoplay.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium, expect } from '@playwright/test';

const { values } = parseArgs({ options: { 'base-url': { type: 'string' }, report: { type: 'string' } } });
assert.ok(values['base-url'] && values.report, 'Supply --base-url ACTUAL_SERVER --report NEW_FILE');
assert.ok(!existsSync(values.report), 'Receipt already exists; use a fresh path');
assert.ok(values.report.endsWith('.json'), 'Use a new .json report path');
mkdirSync(dirname(values.report), { recursive: true });
const base = new URL(values['base-url']);
assert.ok(base.origin === 'https://nullworx.space' || (base.protocol === 'http:' && base.hostname === '127.0.0.1'), 'Use canonical origin or explicit loopback tunnel');
const media = JSON.parse(readFileSync(new URL('../ops/deploy/ascii-featured-media.json', import.meta.url)));
const size = 12862251, checks = [];
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--disable-dev-shm-usage'] });
async function check(name, fn, options = {}) {
  const context = await browser.newContext({ baseURL: base.origin, viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', ...options });
  const page = await context.newPage(); page.setDefaultTimeout(30000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try { const evidence = await fn(page); expect(errors).toEqual([]); checks.push({ name, passed: true, evidence }); }
  catch (error) { checks.push({ name, passed: false, error: error.stack }); }
  finally { await context.close(); }
}
async function open(page) {
  await page.goto('/');
  const field = page.locator('[data-ascii-field]'); await expect(field).toBeVisible(); await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute('data-source-id', 'featured-loop30-807bb27e');
  return field;
}
async function live(field) {
  await expect(field).toHaveAttribute('data-phase', 'live', { timeout: 45000 });
  await expect.poll(async () => Number(await field.getAttribute('data-video-uploads'))).toBeGreaterThan(1);
  await expect.poll(async () => Number(await field.getAttribute('data-output-energy'))).toBeGreaterThan(.3);
  await expect.poll(async () => Number(await field.getAttribute('data-output-difference'))).toBeGreaterThan(.12);
}
try {
  // These use the network directly, before any failure simulation.
  await check('actual provisioned HEAD, Range and SHA256', async () => {
    const url = new URL(media.src, base);
    const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
    assert.equal(head.status, 200); assert.equal(Number(head.headers.get('content-length')), size); assert.match(head.headers.get('content-type'), /^video\/mp4/);
    const range = await fetch(url, { headers: { Range: 'bytes=0-1023' }, signal: AbortSignal.timeout(30000) });
    assert.equal(range.status, 206); assert.equal(range.headers.get('content-range'), `bytes 0-1023/${size}`); assert.equal((await range.arrayBuffer()).byteLength, 1024);
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) }); assert.equal(response.status, 200);
    const bytes = Buffer.from(await response.arrayBuffer()), sha256 = createHash('sha256').update(bytes).digest('hex');
    assert.equal(bytes.length, size); assert.equal(sha256, media.sha256);
    return { url: url.href, bytes: bytes.length, sha256, intercepted: false };
  });
  for (const width of [1440, 390]) await check(`unmocked homepage fish autoplay and Dense at ${width}px`, async page => {
    const field = await open(page); await live(field);
    await expect(field).toHaveAttribute('data-detail', 'dense');
    await expect(page.getByLabel('local video character detail')).toHaveValue('8');
    const settings = JSON.parse(await field.locator('canvas').first().getAttribute('data-settings'));
    if (width === 1440) expect(settings.cellSize).toBe(8);
    const video = field.locator('video'), before = await video.evaluate(v => v.currentTime);
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(before + .1);
    expect(await video.evaluate(v => ({ path: new URL(v.currentSrc).pathname, muted: v.muted, inline: v.playsInline, loop: v.loop, width: v.videoWidth, height: v.videoHeight, duration: v.duration }))).toMatchObject({ path: media.src, muted: true, inline: true, loop: true, width: 1920, height: 1080, duration: 30 });
    await expect(page.locator('[data-ascii-attribution]')).toContainText(media.credit);
    await expect(page.locator('[data-ascii-attribution]')).toContainText('direct permission');
    await expect(page.locator('[data-ascii-attribution] a[href*="creativecommons.org"]')).toHaveCount(0);
    const evidence = await field.evaluate(el => ({ ...el.dataset }));
    await page.screenshot({ path: values.report.replace(/\.json$/, `-${width}.png`) });
    for (const [value, detail] of [['12', 'fine'], ['16', 'original'], ['8', 'dense']]) {
      await page.getByLabel('local video character detail').selectOption(value); await field.scrollIntoViewIfNeeded();
      await expect(field).toHaveAttribute('data-detail', detail); await live(field);
    }
    await field.getByRole('button', { name: 'Pause local video', exact: true }).click();
    await expect(field).toHaveAttribute('data-phase', 'paused');
    const held = await video.evaluate(v => v.currentTime); await page.waitForTimeout(250); expect(await video.evaluate(v => v.currentTime)).toBe(held);
    const uploads = Number(await field.getAttribute('data-video-uploads'));
    await video.evaluate(v => { v.currentTime = 3; }); await expect(video).toHaveJSProperty('currentTime', 3);
    await expect.poll(async () => Number(await field.getAttribute('data-video-uploads'))).toBeGreaterThan(uploads);
    await field.getByRole('button', { name: 'Play local video', exact: true }).click(); await live(field);
    await video.evaluate(v => { v.currentTime = v.duration - .15; });
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeLessThan(2);
    await live(field);
    return { ...evidence, intercepted: false };
  }, { viewport: { width, height: 1000 } });
  await check('reduced motion holds real fish and supports explicit opt-in', async page => {
    const field = await open(page); await expect(field).toHaveAttribute('data-phase', 'reduced');
    await expect.poll(async () => Number(await field.getAttribute('data-output-energy'))).toBeGreaterThan(.3);
    const video = field.locator('video'); await expect(video).toHaveJSProperty('paused', true);
    const held = await video.evaluate(v => v.currentTime); await page.waitForTimeout(250); expect(await video.evaluate(v => v.currentTime)).toBe(held);
    await page.getByRole('button', { name: 'Play local video', exact: true }).click(); await live(field);
  }, { reducedMotion: 'reduce' });
  await check('autoplay denial remains truthful and click resumes actual video', async page => {
    await page.addInitScript(() => { let optedIn = false; window.addEventListener('click', () => { optedIn = true; }, { capture: true, once: true }); const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { return optedIn ? play.call(this) : Promise.reject(new DOMException('Policy denied autoplay', 'NotAllowedError')); }; });
    const field = await open(page); await expect(field).toHaveAttribute('data-phase', 'blocked');
    await expect(page.getByText('Your browser needs a click', { exact: false })).toBeVisible();
    await expect(field.locator('video')).toHaveJSProperty('paused', true);
    await page.getByRole('button', { name: 'Start local video', exact: false }).click(); await live(field);
  });
  for (const scenario of ['absent', 'wrong length', 'decode failure']) await check(`${scenario} is a fallback, never fish autoplay proof`, async page => {
    await page.route(`**${media.src}`, route => {
      if (scenario === 'absent') return route.fulfill({ status: 404 });
      if (scenario === 'wrong length') return route.fulfill({ contentType: 'video/mp4', headers: { 'content-length': '1' }, body: 'x' });
      if (route.request().method() === 'HEAD') return route.fulfill({ contentType: 'video/mp4', headers: { 'content-length': String(size) } });
      return route.fulfill({ contentType: 'video/mp4', body: 'undecodable media' });
    });
    await page.goto('/');
    if (scenario === 'decode failure') { const field = page.locator('[data-ascii-field]'); await field.scrollIntoViewIfNeeded(); await expect(field).toHaveAttribute('data-phase', 'error'); await expect(page.getByText('Video unavailable', { exact: true })).toBeVisible(); }
    else { await expect(page.locator('[data-ascii-field]')).toHaveCount(0); await expect(page.getByText(scenario === 'absent' ? /Featured fish video is unavailable/ : /does not match its deployment receipt/)).toBeVisible(); }
    await expect(page.locator('[data-procedural-ascii]').first()).toBeVisible();
    await expect(page.getByLabel('ASCII local video')).toBeVisible();
    return { simulatedFailure: true, countsAsAutoplayProof: false };
  });
} finally {
  await browser.close(); mkdirSync(dirname(values.report), { recursive: true });
  writeFileSync(values.report, JSON.stringify({ schema: 1, baseUrl: base.origin, checkedAt: new Date().toISOString(), passed: checks.every(c => c.passed), checks }, null, 2) + '\n', { flag: 'wx' });
}
for (const check of checks) console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}${check.error ? '\n' + check.error : ''}`);
process.exitCode = checks.every(c => c.passed) ? 0 : 1;
