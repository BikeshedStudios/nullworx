import { test, expect } from '@playwright/test';
import path from 'node:path';

const media = process.env.ASCII_TEST_VIDEO;
const variants = [['calibrated default', ''], ['original rollback', '?asciiRamp=original']] as const;

for (const [label, query] of variants) test(`${label}: real media, pause, offscreen, reduced motion, resize and cleanup`, async ({ page }) => {
  test.skip(!media, 'Set ASCII_TEST_VIDEO to a rights-cleared local clip.');
  await page.addInitScript(() => {
    const counts = { draws: 0, uploads: 0, textures: 0, programs: 0, arrays: 0 };
    Object.assign(window, { asciiCounts: counts });
    const p = WebGL2RenderingContext.prototype;
    const draw = p.drawArrays;
    p.drawArrays = function (...args) { counts.draws++; return draw.apply(this, args); };
    const upload = p.texImage2D;
    Object.assign(p, { texImage2D: function (this: WebGL2RenderingContext, ...args: unknown[]) {
      if (args.some(a => a instanceof HTMLVideoElement)) counts.uploads++;
      return Reflect.apply(upload, this, args);
    } });
    for (const [create, remove, key] of [
      ['createTexture', 'deleteTexture', 'textures'], ['createProgram', 'deleteProgram', 'programs'], ['createVertexArray', 'deleteVertexArray', 'arrays'],
    ] as const) {
      const originalCreate = p[create], originalRemove = p[remove];
      // These methods have different WebGL object types but identical lifetime semantics.
      Object.assign(p, {
        [create]: function (this: WebGL2RenderingContext) { counts[key]++; return originalCreate.call(this); },
        [remove]: function (this: WebGL2RenderingContext, object: never) { counts[key]--; return originalRemove.call(this, object); },
      });
    }
  });
  const counts = () => page.evaluate(() => (window as unknown as { asciiCounts: { draws: number; uploads: number; textures: number; programs: number; arrays: number } }).asciiCounts);
  const open = async () => {
    await page.getByLabel('ASCII local video').setInputFiles(media!);
    await page.locator('[data-ascii-field]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-ascii-field]')).toHaveAttribute('data-phase', 'live');
  };
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await page.goto('/effects/ascii-waves' + query); await open();
  console.log('GPU:', await page.locator('canvas[data-testid="koi-home-field"]').evaluate(c => { const gl = (c as HTMLCanvasElement).getContext('webgl2')!; const d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); }));
  await expect(page.getByLabel('local video character detail')).toHaveValue('12');
  await expect(page.locator('canvas[data-ascii-ramp]')).toHaveAttribute('data-ascii-ramp', label === 'original rollback' ? 'original' : 'calibrated');
  const before = await counts(); await page.waitForTimeout(350);
  expect((await counts()).uploads).toBeGreaterThan(before.uploads);
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Pause local video', exact: true }).click();
  await page.waitForTimeout(250);
  const paused = await counts();
  const time = await page.locator('video').evaluate(v => (v as HTMLVideoElement).currentTime);
  await page.waitForTimeout(350);
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).currentTime)).toBe(time);
  expect((await counts()).draws).toBe(paused.draws);
  expect((await counts()).uploads).toBe(paused.uploads);
  await page.locator('video').evaluate(v => { (v as HTMLVideoElement).currentTime = 2; });
  await expect.poll(async () => (await counts()).uploads).toBeGreaterThan(paused.uploads);
  await page.waitForTimeout(250); const sought = await counts(); await page.waitForTimeout(350);
  expect((await counts()).draws).toBe(sought.draws);
  await page.getByRole('button', { name: 'Play local video', exact: true }).click();
  await expect.poll(async () => (await counts()).uploads).toBeGreaterThan(sought.uploads);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(250); const hidden = await counts(); await page.waitForTimeout(350);
  expect((await counts()).draws).toBe(hidden.draws);
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(async () => (await counts()).uploads).toBeGreaterThan(hidden.uploads);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('video').evaluate(v => (v as HTMLVideoElement).paused)).toBe(true);
  { await page.waitForTimeout(250); const held = await counts(); await page.waitForTimeout(350); expect((await counts()).draws).toBe(held.draws); }
  await page.locator('[data-ascii-field]').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('video').evaluate(v => (v as HTMLVideoElement).paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('video').evaluate(v => (v as HTMLVideoElement).paused)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.locator('canvas[data-testid="koi-home-field"]').evaluate(c => (c as HTMLCanvasElement).width)).toBeLessThan(390);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('[data-ascii-field]').scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Use procedural animation', exact: true }).click();
  await page.waitForTimeout(250); const disposed = await counts();
  expect(disposed.textures).toBe(0); expect(disposed.programs).toBe(0); expect(disposed.arrays).toBe(0);
  await page.waitForTimeout(350); expect((await counts()).draws).toBe(disposed.draws);
  expect(errors).toEqual([]);
});

test('idle: rapid replacement, loop, paused seek, invalid codec, context loss and retry', async ({ page }) => {
  test.skip(!media, 'Set ASCII_TEST_VIDEO to a rights-cleared local clip.');
  await page.goto('/effects/ascii-waves');
  const picker = page.getByLabel('ASCII local video'), field = page.locator('[data-ascii-field]');
  for (let i = 0; i < 4; i++) await picker.setInputFiles(media!);
  await field.scrollIntoViewIfNeeded(); await expect(field).toHaveAttribute('data-phase', 'live');
  await expect(page.locator('video')).toHaveCount(1);
  await page.locator('video').evaluate(v => { const video = v as HTMLVideoElement; video.currentTime = video.duration - .15; });
  await expect.poll(() => page.locator('video').evaluate(v => (v as HTMLVideoElement).currentTime)).toBeLessThan(1.5);
  await page.mouse.move(0, 0);
  await page.getByRole('button', { name: 'Pause local video', exact: true }).click();
  await page.locator('video').evaluate(v => { (v as HTMLVideoElement).currentTime = 3; });
  await expect.poll(() => page.locator('video').evaluate(v => (v as HTMLVideoElement).currentTime)).toBe(3);
  await page.getByRole('button', { name: 'Play local video', exact: true }).click();
  await expect(field).toHaveAttribute('data-phase', 'live');
  await page.locator('canvas[data-testid="koi-home-field"]').evaluate(c => (c as HTMLCanvasElement).getContext('webgl2')!.getExtension('WEBGL_lose_context')!.loseContext());
  await expect(field).toHaveAttribute('data-phase', 'error');
  await expect(page.getByText('WebGL2 context lost.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Retry local video', exact: false }).click();
  await expect(field).toHaveAttribute('data-phase', 'live');
  await expect(page.getByLabel('local video character detail')).toHaveValue('12');
  await picker.setInputFiles({ name: 'unsupported.mp4', mimeType: 'video/mp4', buffer: Buffer.from('unsupported video bytes') });
  await expect(field).toHaveAttribute('data-phase', 'error');
  await expect(field).toHaveAttribute('data-media-error', /[1-4]/);
  await expect(page.getByText(/This video format is not supported|Your browser could not decode this file|This file could not be read|no supported source was found/)).toBeVisible();
  console.log('Invalid video receipt:', await field.getAttribute('data-media-error'));
  await picker.setInputFiles({ name: path.basename(media!), mimeType: 'video/mp4', buffer: await (await import('node:fs/promises')).readFile(media!) });
  await expect(field).toHaveAttribute('data-phase', 'live');
  await page.locator('video').evaluate(v => { (v as HTMLVideoElement).src = '/media/local/ascii-quality-missing.mp4'; });
  await expect(field).toHaveAttribute('data-phase', 'error');
  await page.getByRole('button', { name: 'Retry local video', exact: false }).click();
  await expect(field).toHaveAttribute('data-phase', 'live');
});

test('idle: reduced motion on first load retains a still frame and can opt into playback', async ({ page }) => {
  test.skip(!media, 'Set ASCII_TEST_VIDEO to a rights-cleared local clip.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/effects/ascii-waves');
  await page.getByLabel('ASCII local video').setInputFiles(media!);
  const field = page.locator('[data-ascii-field]'); await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute('data-phase', 'reduced');
  await expect.poll(async () => Number(await field.getAttribute('data-video-uploads'))).toBeGreaterThan(0);
  const held = await field.getAttribute('data-frame-count');
  await page.waitForTimeout(350); expect(await field.getAttribute('data-frame-count')).toBe(held);
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).paused)).toBe(true);
  await page.getByRole('button', { name: 'Play local video', exact: true }).click();
  await expect(field).toHaveAttribute('data-phase', 'live');
});


test('detail defaults to Fine on reload and preserves an explicit choice on replacement', async ({ page }) => {
  test.skip(!media, 'Set ASCII_TEST_VIDEO to a local clip.');
  await page.goto('/effects/ascii-waves');
  const picker = page.getByLabel('ASCII local video');
  await picker.setInputFiles(media!);
  await expect(page.getByLabel('local video character detail')).toHaveValue('12');
  await page.getByLabel('local video character detail').selectOption('16');
  await picker.setInputFiles(media!);
  await expect(page.getByLabel('local video character detail')).toHaveValue('16');
  await page.reload(); await picker.setInputFiles(media!);
  await expect(page.getByLabel('local video character detail')).toHaveValue('12');
});
