import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import path from "node:path";

// Run capture and measure separately: recording/readback must not pollute timings.
const task = process.argv[2] ?? "capture";
const root = path.resolve("evidence/material-wave-a-release-01");
const base = process.env.MATERIAL_URL ?? "http://127.0.0.1:3331";
const baseline = process.env.MATERIAL_BASELINE_URL ?? "http://127.0.0.1:3333";
const slugs = { ashfall: "ashfall-type", seam: "seam-erosion", sediment: "sediment-reveal" };
const widths = [1440, 390, 320];
const errors = [], receipts = [];
const browser = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader", "--disable-dev-shm-usage"] });
await mkdir(root, { recursive: true });
const system = await browser.newBrowserCDPSession();
const info = await system.send("SystemInfo.getInfo");
const environment = { browser: browser.version(), gpu: info.gpu, softwareRendering: true, physicalDevice: false, deviceScaleFactor: 1 };
await writeFile(path.join(root, `${task}-environment.json`), JSON.stringify(environment, null, 2));
const save = (name, data) => writeFile(path.join(root, name), JSON.stringify(data, null, 2));
const surface = "[data-material-surface]";

async function setup(width, kind, { video, oldArt } = {}) {
  const dir = path.join(root, `${kind}-${width}`);
  await mkdir(dir, { recursive: true });
  const viewport = { width, height: width === 1440 ? 1000 : 844 };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1,
    ...(video ? { recordVideo: { dir, size: viewport } } : {}) });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push({ kind, width, type: "pageerror", message: error.message }));
  page.on("console", message => {
    if (["warning", "error"].includes(message.type())) errors.push({ kind, width, type: message.type(), message: message.text() });
  });
  if (oldArt) {
    const body = execFileSync("git", ["show", "7d7bf382201b7600f284c78b42779233768a100e:public/material-wave-a/strata.png"], { maxBuffer: 4 * 1024 * 1024 });
    await page.route("**/material-wave-a/mineral-study.webp", route => route.fulfill({ contentType: "image/png", body }));
  }
  await page.goto(`${base}/effects/${slugs[kind]}`);
  await page.waitForFunction(() => document.querySelector("[data-material-surface]")?.dataset.ready === "true" && window.__materialWaveA?.snapshot().renderer);
  await page.evaluate(() => {
    const lane = document.querySelector("[data-scroll-lane]");
    window.scrollTo({ top: lane.getBoundingClientRect().top + scrollY - 84, behavior: "instant" });
    window.__materialWaveA.reset();
  });
  return { page, context, dir };
}

async function capture() {
  for (const width of widths) for (const kind of Object.keys(slugs)) {
    const { page, context, dir } = await setup(width, kind);
    for (const [name, ms] of [["original", 0], ["windup", 190], ["mid", 1700], ["settling", 3200], ["complete", 5400]]) {
      await page.evaluate(time => window.__materialWaveA.seek(time), ms);
      await page.screenshot({ path: path.join(dir, `${name}.png`) });
      await page.locator(surface).screenshot({ path: path.join(dir, `${name}-surface.png`) });
    }
    await context.close();
    console.log(`Stills: ${kind} ${width}`);
  }
  for (const width of widths) for (const oldArt of [true, false]) {
    const { page, context, dir } = await setup(width, "sediment", { oldArt });
    await page.getByRole("button", { name: "B / CSS control", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("[data-material-surface]")?.dataset.ready === "true");
    for (const [pose, ms] of [["original", 0], ["dissolve", 1700]]) {
      await page.evaluate(time => window.__materialWaveA.seek(time), ms);
      await page.locator(surface).screenshot({ path: path.join(dir, `art-${oldArt ? "before" : "after"}-${pose}.png`) });
    }
    await context.close();
  }
  for (const width of widths) for (const kind of Object.keys(slugs)) for (const speed of width === 1440 ? ["slow", "fast"] : ["fast"]) {
    const { page, context, dir } = await setup(width, kind, { video: true });
    const started = Date.now();
    const runBefore = await page.evaluate(() => window.__materialWaveA.snapshot().runId);
    const positions = await page.evaluate(() => {
      const lane = document.querySelector("[data-scroll-lane]");
      return { top: lane.getBoundingClientRect().top + scrollY - innerHeight * .28, distance: lane.getBoundingClientRect().height - innerHeight };
    });
    const progress = speed === "slow" ? [.35, .42, .50, .57, .64, .68, .54, .67] : [.72, .48, .75];
    for (const p of progress) {
      await page.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), positions.top + positions.distance * p);
      await page.waitForTimeout(speed === "slow" ? 220 : 80);
    }
    await page.waitForFunction(() => window.__materialWaveA.snapshot().phase === "COMPLETE", null, { timeout: 25000 });
    const state = await page.evaluate(() => window.__materialWaveA.snapshot());
    if (state.runId !== runBefore + 1 || state.particles !== 0) throw new Error(`Invalid recording state: ${kind}/${width}/${speed}`);
    await page.waitForTimeout(250);
    const video = page.video();
    await context.close();
    const filename = path.join(dir, `${speed}-scroll.webm`);
    await video.saveAs(filename); await video.delete();
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "quiet", "-show_format", "-of", "json", filename], { encoding: "utf8" }));
    receipts.push({ kind, width, speed, wallMs: Date.now() - started, recording: path.relative(root, filename), duration: Number(probe.format.duration), state });
    await save("recordings.json", receipts);
    console.log(`Recorded: ${kind} ${width} ${speed}; one completed run`);
  }
  await save("capture-console.json", errors);
  const groups = widths.map(width => `<h2>${width}px</h2>${Object.keys(slugs).map(kind => `<h3>${slugs[kind]}</h3><div class="row">${["original", "windup", "mid", "settling", "complete"].map(pose => `<figure><img src="${kind}-${width}/${pose}-surface.png"><figcaption>${pose}</figcaption></figure>`).join("")}</div>${(width === 1440 ? ["slow", "fast"] : ["fast"]).map(speed => `<video controls preload="metadata" src="${kind}-${width}/${speed}-scroll.webm"></video>`).join("")}`).join("")}<h3>CSS tiled grain artwork before / after</h3>${["original", "dissolve"].map(pose => `<div class="row art"><figure><img src="sediment-${width}/art-before-${pose}.png"><figcaption>Before · ${pose}</figcaption></figure><figure><img src="sediment-${width}/art-after-${pose}.png"><figcaption>After · ${pose}</figcaption></figure></div>`).join("")}`).join("");
  await writeFile(path.join(root, "index.html"), `<!doctype html><meta charset="utf-8"><title>Wave A integration evidence</title><style>body{background:#f6f2ec;color:#302839;font:16px system-ui;max-width:1500px;margin:40px auto;padding:20px}h2{border-top:1px solid #b5a8c2;padding-top:25px}.row{display:flex;gap:10px}figure{margin:0;flex:1;min-width:0}img{width:100%;display:block}figcaption{padding:8px}video{width:46%;max-height:550px;margin:15px 1%}.art{margin-bottom:20px}</style><h1>Wave A integration: preserved motion, replaced artwork</h1><p>Actual Chromium screenshots and continuous browser recordings. Video includes navigation/preparation. Software SwiftShader; no physical-device claims. Before/after uses the same integrated CSS algorithm with only the source response replaced.</p>${groups}`);
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  await page.goto(`file://${path.join(root, "index.html")}`);
  const media = await page.locator("video").evaluateAll(async videos => {
    const result = [];
    for (const video of videos) {
      await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; if (video.readyState >= 2) resolve(); else video.load(); });
      video.muted = true; await video.play();
      await new Promise(resolve => setTimeout(resolve, 100));
      result.push({ src: video.getAttribute("src"), duration: video.duration, currentTime: video.currentTime, width: video.videoWidth, height: video.videoHeight });
      video.pause();
    }
    return result;
  });
  if (media.some(video => video.currentTime <= 0 || video.duration < 5)) throw new Error("Evidence video did not decode/advance");
  await save("video-validation.json", media);
  await page.screenshot({ path: path.join(root, "review-index.png") });
  await page.close();
}

const summarize = values => {
  const sorted = [...values].sort((a, b) => a - b);
  return { count: values.length, median: sorted[Math.floor(sorted.length * .5)], p95: sorted[Math.floor(sorted.length * .95)], max: sorted.at(-1) };
};
async function measure() {
  for (const width of widths) {
    const owned = [];
    for (const kind of Object.keys(slugs)) {
      const { page, context } = await setup(width, kind);
      await page.evaluate(() => { window.__materialWaveA.seek(1700); window.__materialWaveA.reset(); window.__materialWaveA.play(); });
      await page.waitForFunction(() => document.querySelector("[data-material-surface]").dataset.phase === "COMPLETE", null, { timeout: 25000 });
      const raw = await page.evaluate(() => window.__materialWaveA.snapshot());
      const fps = raw.frames.length / (raw.frames.reduce((sum, ms) => sum + ms, 0) / 1000);
      receipts.push({ width, kind, fps, frameTime: summarize(raw.frames), drawTime: summarize(raw.drawMs), raw });
      const cdp = await context.newCDPSession(page);
      const expression = "({scroll:(getEventListeners(window).scroll||[]).length,visibility:(getEventListeners(document).visibilitychange||[]).length,owned:window.__materialResources})";
      const mounted = await cdp.send("Runtime.evaluate", { expression, includeCommandLineAPI: true, returnByValue: true });
      await page.getByRole("link", { name: "Back to effects" }).click();
      await page.waitForFunction(() => !window.__materialWaveA);
      const unmounted = await cdp.send("Runtime.evaluate", { expression, includeCommandLineAPI: true, returnByValue: true });
      if (Object.values(unmounted.result.value.owned).some(value => value !== 0)) throw new Error("Unreleased material resources");
      owned.push({ kind, mounted: mounted.result.value, unmounted: unmounted.result.value });
      console.log(`${kind} ${width}: ${fps.toFixed(2)} FPS, p95 ${summarize(raw.frames).p95.toFixed(2)}ms, draw p95 ${summarize(raw.drawMs).p95.toFixed(2)}ms`);
      await context.close();
      await save("performance.json", { environment, method: "One warm draw, single uninterrupted 5.4s run; no concurrent capture, tests or readback polling. p95 = sorted[floor(n*.95)].", runs: receipts, errors });
    }
    await save(`cdp-lifecycle-${width}.json`, owned);
  }
}

async function bundle() {
  for (const [label, url] of [["main-before", baseline], ["integration", base]]) for (const route of ["/", "/effects/glyph-morph", ...(label === "integration" ? ["/effects/sediment-reveal"] : [])]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const assets = [], pending = [];
    page.on("response", response => {
      if (response.request().resourceType() === "script") pending.push((async () => {
        const body = await response.body(); assets.push({ url: new URL(response.url()).pathname, bytes: body.length, gzipBytes: gzipSync(body).length });
      })());
    });
    await page.goto(`${url}${route}`, { waitUntil: "networkidle" });
    await Promise.all(pending);
    receipts.push({ label, route, scripts: assets, bytes: assets.reduce((sum, item) => sum + item.bytes, 0), gzipBytes: assets.reduce((sum, item) => sum + item.gzipBytes, 0) });
    await context.close();
  }
  await save("bundle.json", { method: "All script responses in a fresh Chromium context at networkidle. gzip computed per response with Node zlib defaults; excludes HTML/CSS/image payloads.", runs: receipts });
  console.log(JSON.stringify(receipts.map(({ label, route, bytes, gzipBytes }) => ({ label, route, bytes, gzipBytes })), null, 2));
}

try {
  if (task === "capture") await capture();
  else if (task === "measure") await measure();
  else if (task === "bundle") await bundle();
  else throw new Error(`Unknown task: ${task}`);
} finally { await browser.close(); }
