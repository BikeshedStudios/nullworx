#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { resolve4, resolve6 } from "node:dns/promises";
import { get as httpsGet } from "node:https";

export const canonicalOrigin = "https://nullworx.space";
export const effects = ["magnetic-focus", "glyph-morph", "prism-text", "ascii-waves", "digital-wake", "ashfall-type", "seam-erosion", "sediment-reveal"];
export const publicPaths = ["/", "/effects", ...effects.map(slug => `/effects/${slug}`)];
// Beta remains publicly usable, but only the nine approved URLs may be indexed.
export const indexablePaths = publicPaths.filter(path => path !== "/effects/digital-wake");
export const galleryEffects = effects.filter(slug => slug !== "digital-wake");
const decode = text => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), decode(m[2])]));
}
export function metadata(html) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0]));
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
  return {
    canonicals: links.filter(tag => tag.rel === "canonical").map(tag => tag.href),
    robots: metas.filter(tag => ["robots", "googlebot"].includes(tag.name)).map(tag => tag.content).join(", ").toLowerCase(),
  };
}
function invariant(condition, message) { if (!condition) throw new Error(message); }

export async function smoke({ baseUrl, profile = "origin", commit = "", digest = "", asset = null }) {
  const base = new URL(baseUrl);
  invariant(base.pathname === "/" && !base.search && !base.username && !base.password, "Use an origin without credentials, path or query");
  invariant(["origin", "edge"].includes(profile), "profile must be origin or edge");
  invariant(profile !== "edge" || base.origin === canonicalOrigin, "Edge checks require the exact canonical domain");
  invariant(profile !== "origin" || (base.protocol === "http:" && base.hostname === "127.0.0.1"), "Origin checks require an explicit loopback HTTP endpoint (SSH tunnel allowed)");
  const checks = [];
  const request = path => fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Nullworx-production-smoke/1" } });
  async function check(name, fn) {
    try { await fn(); checks.push({ name, passed: true }); }
    catch (error) { checks.push({ name, passed: false, error: error.message }); }
  }
  function security(response) {
    for (const [name, value] of Object.entries({
      "x-content-type-options": "nosniff", "x-frame-options": "DENY",
      "referrer-policy": "strict-origin-when-cross-origin",
    })) invariant(response.headers.get(name) === value, `Missing/incorrect ${name}`);
    for (const directive of ["camera=()", "microphone=()", "geolocation=()", "payment=()"])
      invariant(response.headers.get("permissions-policy")?.includes(directive), `Missing Permissions-Policy ${directive}`);
    invariant(!response.headers.has("x-powered-by"), "X-Powered-By leaks runtime");
    if (profile === "edge") invariant(/max-age=(\d+)/i.exec(response.headers.get("strict-transport-security") || "")?.[1] >= 31536000, "Missing one-year HSTS");
  }
  for (const path of publicPaths) await check(`page ${path}`, async () => {
    const response = await request(path);
    invariant(response.status === 200, `HTTP ${response.status}`);
    invariant(response.headers.get("content-type")?.includes("text/html"), "Not HTML");
    security(response);
    const html = await response.text();
    const meta = metadata(html);
    const expected = path === "/" ? [canonicalOrigin, `${canonicalOrigin}/`] : [`${canonicalOrigin}${path}`];
    invariant(meta.canonicals.length === 1 && expected.includes(meta.canonicals[0]), `Incorrect canonical: ${meta.canonicals.join(",")}`);
    if (indexablePaths.includes(path)) {
      invariant(/\bindex\b/.test(meta.robots) && !/noindex|nofollow|none/.test(meta.robots), `Public page robots: ${meta.robots}`);
      invariant(!/noindex|nofollow|none/i.test(response.headers.get("x-robots-tag") || ""), "Public page X-Robots-Tag blocks indexing");
    } else {
      invariant(/\bnoindex\b/.test(meta.robots), "Beta must remain noindex");
      invariant(/EXPERIMENTAL \/ BETA|Beta/.test(html), "Beta label missing");
      invariant(!html.includes('type="application/ld+json"'), "Beta must not have structured-data promotion");
    }
    invariant(/<h1\b/i.test(html), "Missing H1");
    if (path === "/effects") for (const slug of galleryEffects) invariant(html.includes(`/effects/${slug}`), `Gallery lacks ${slug}`);
  });
  if (asset) await check("release asset", async () => {
    invariant(asset.path.startsWith("/_next/static/") && !asset.path.includes(".."), "Invalid immutable asset path");
    const response = await request(asset.path);
    invariant(response.status === 200, `Asset HTTP ${response.status}`);
    const hash = createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex");
    invariant(hash === asset.sha256, "Target serves different build bytes");
    invariant(/immutable/.test(response.headers.get("cache-control") || ""), "Build asset is not immutable");
  });
  await check("sitemap", async () => {
    const response = await request("/sitemap.xml");
    invariant(response.status === 200, `HTTP ${response.status}`);
    invariant(response.headers.get("content-type")?.includes("xml"), "Not XML");
    const xml = await response.text();
    invariant(/<urlset\b/.test(xml), "Expected urlset sitemap");
    const locations = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(m => new URL(decode(m[1].trim())));
    for (const path of indexablePaths) invariant(locations.some(url => url.pathname === path && url.origin === canonicalOrigin), `Sitemap lacks ${path}`);
    invariant(locations.length === indexablePaths.length && locations.every(url => indexablePaths.includes(url.pathname)), "Sitemap must contain exactly the nine approved URLs; Beta/private routes excluded");
    invariant(locations.length === new Set(locations.map(url => url.href)).size, "Duplicate sitemap locations");
    invariant(locations.every(url => url.origin === canonicalOrigin && !url.search && !/^\/(lab|tools|downloads)(\/|$)/.test(url.pathname)), "Sitemap includes noncanonical/private URL");
  });
  await check("robots", async () => {
    const response = await request("/robots.txt");
    invariant(response.status === 200, `HTTP ${response.status}`);
    invariant(response.headers.get("content-type")?.includes("text/plain"), "Not plain text");
    const body = await response.text();
    invariant(/^User-agent:\s*\*\s*$/im.test(body), "No default crawler policy");
    invariant(!/^Disallow:\s*\/\s*$/im.test(body), "Global crawl disallow");
    invariant(/^Disallow:\s*\/lab\/?\s*$/im.test(body), "Lab crawl rule missing");
    invariant(new RegExp(`^Sitemap:\\s*${canonicalOrigin.replaceAll(".", "\\.")}/sitemap\\.xml\\s*$`, "im").test(body), "Sitemap declaration incorrect");
  });
  for (const path of ["/lab/forge-factory-01", "/effects/nullworx-missing-effect", "/nullworx-smoke-missing-page"]) await check(`noindex ${path}`, async () => {
    const response = await request(path);
    invariant(response.status === (path.startsWith("/lab/") ? 200 : 404), `HTTP ${response.status}`);
    const meta = metadata(await response.text());
    invariant(/noindex/.test(meta.robots) || /noindex/i.test(response.headers.get("x-robots-tag") || ""), "Missing noindex");
    if (path.startsWith("/lab/")) invariant(/noindex/i.test(response.headers.get("x-robots-tag") || ""), "Lab header lacks noindex");
  });
  if (profile === "edge") {
    for (const [family, resolve] of [[4, resolve4], [6, resolve6]]) await check(`TLS and build IPv${family}`, async () => {
      let addresses;
      try { addresses = await resolve(base.hostname); }
      catch (error) {
        if (family === 6 && ["ENODATA", "ENOTFOUND"].includes(error.code)) return; // AAAA is optional.
        throw error;
      }
      invariant(addresses.length > 0, "No public address");
      const response = await new Promise((accept, reject) => {
        const request = httpsGet(new URL(asset?.path || "/", base), { family, signal: AbortSignal.timeout(15000) }, response => {
          const bytes = [];
          response.on("data", chunk => bytes.push(chunk));
          response.on("error", reject);
          response.on("end", () => accept({ status: response.statusCode, bytes: Buffer.concat(bytes) }));
        });
        request.on("error", reject);
      });
      invariant(response.status === 200, `IPv${family} HTTP ${response.status}`);
      if (asset) invariant(createHash("sha256").update(response.bytes).digest("hex") === asset.sha256, `IPv${family} serves different build bytes`);
    });
    for (const origin of ["http://nullworx.space", "http://www.nullworx.space", "https://www.nullworx.space"]) await check(`redirect ${origin}`, async () => {
      const path = "/effects/ashfall-type?smoke=1";
      const first = await fetch(origin + path, { redirect: "manual", signal: AbortSignal.timeout(15000) });
      invariant([301, 308].includes(first.status), `Non-permanent redirect: ${first.status}`);
      const response = await fetch(origin + path, { signal: AbortSignal.timeout(15000) });
      invariant(response.status === 200 && response.url === canonicalOrigin + path, `Final destination: ${response.status} ${response.url}`);
    });
  }
  return { schema: 1, suite: "http", profile, baseUrl: base.origin, commit, digest, asset, checkedAt: new Date().toISOString(), passed: checks.every(c => c.passed), checks };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: {
    "base-url": { type: "string" }, profile: { type: "string", default: "origin" },
    report: { type: "string" }, commit: { type: "string", default: "" }, digest: { type: "string", default: "" },
    "asset-path": { type: "string" }, "asset-sha256": { type: "string" },
  } });
  if (Boolean(values["asset-path"]) !== Boolean(values["asset-sha256"])) throw new Error("Supply both asset path and SHA256");
  const asset = values["asset-path"] ? {path: values["asset-path"], sha256: values["asset-sha256"]} : null;
  const report = await smoke({ baseUrl: values["base-url"], profile: values.profile, commit: values.commit, digest: values.digest, asset });
  if (values.report) writeFileSync(values.report, JSON.stringify(report, null, 2) + "\n");
  for (const check of report.checks) console.log(`${check.passed ? "PASS" : "FAIL"} ${check.name}${check.error ? `: ${check.error}` : ""}`);
  process.exitCode = report.passed ? 0 : 1;
}
