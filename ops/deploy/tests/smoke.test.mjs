import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { smoke, metadata, publicPaths, indexablePaths, galleryEffects, canonicalOrigin } from "../smoke-http.mjs";

test("metadata parser accepts arbitrary attribute order", () => {
  assert.deepEqual(metadata('<link href="https://nullworx.space/" rel="canonical"><meta content="index, follow" name="robots">'), {
    canonicals: ["https://nullworx.space/"], robots: "index, follow",
  });
});

test("HTTP suite fails closed for missing SEO, noindex public pages and bad canonicals", async () => {
  let faulty = false;
  let noindex = false;
  let betaIndexed = false;
  let extraSitemapPath = null;
  let missingGallerySlug = null;
  const server = createServer((req, res) => {
    const path = req.url;
    const known = publicPaths.includes(path);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    if (path === "/sitemap.xml" && !faulty) {
      res.setHeader("Content-Type", "application/xml");
      return res.end('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + [...indexablePaths, ...(extraSitemapPath ? [extraSitemapPath] : [])].map(p => `<url><loc>${canonicalOrigin}${p}</loc></url>`).join("") + "</urlset>");
    }
    if (path === "/robots.txt" && !faulty) {
      res.setHeader("Content-Type", "text/plain");
      return res.end(`User-agent: *\nAllow: /\nDisallow: /lab/\nSitemap: ${canonicalOrigin}/sitemap.xml\n`);
    }
    res.setHeader("Content-Type", "text/html");
    if (!known && path !== "/lab/forge-factory-01") res.statusCode = 404;
    if (path.startsWith("/lab/")) res.setHeader("X-Robots-Tag", "noindex, nofollow");
    const canonical = faulty ? "https://wrong.invalid" : canonicalOrigin + path;
    const robots = known && !faulty && !noindex && (indexablePaths.includes(path) || (path === '/effects/digital-wake' && betaIndexed)) ? "index, follow" : "noindex, follow";
    const visibleLinks = path === "/effects"
      ? galleryEffects.filter(slug => slug !== missingGallerySlug).map(slug => `/effects/${slug}`)
      : publicPaths;
    const product = path === "/kits/bento-duo" ? 'Orbit Bento 02 Foil Reactor <a href="https://bikeshedstudios.gumroad.com/l/dordxw">€39</a>' : "";
    res.end(`<h1>Fixture Beta</h1><link rel="canonical" href="${canonical}"><meta name="robots" content="${robots}">` + product + visibleLinks.map(p => `<a href="${p}">link</a>`).join(""));
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const passing = await smoke({ baseUrl });
    assert.equal(passing.passed, true, JSON.stringify(passing.checks));
    assert.equal(passing.checks.length, 20);
    missingGallerySlug = "magnetic-focus";
    const missingCard = await smoke({ baseUrl });
    assert.match(missingCard.checks.find(c => c.name === "page /effects").error, /Gallery lacks magnetic-focus/);
    missingGallerySlug = null;
    betaIndexed = true;
    assert.equal((await smoke({ baseUrl })).checks.find(c => c.name === 'page /effects/digital-wake').passed, false);
    betaIndexed = false;
    for (const extra of ['/effects/digital-wake', '/about', '/effects']) {
      extraSitemapPath = extra;
      assert.equal((await smoke({ baseUrl })).checks.find(c => c.name === 'sitemap').passed, false);
    }
    extraSitemapPath = null;
    noindex = true;
    const blocked = await smoke({ baseUrl });
    assert.match(blocked.checks.find(c => c.name === "page /").error, /Public page robots: noindex/);
    assert.equal(blocked.checks.find(c => c.name === "sitemap").passed, true);
    noindex = false;
    faulty = true;
    const failed = await smoke({ baseUrl });
    assert.equal(failed.passed, false);
    assert.equal(failed.checks.find(c => c.name === "sitemap").passed, false);
    assert.equal(failed.checks.find(c => c.name === "robots").passed, false);
    assert.equal(failed.checks.find(c => c.name === "page /").passed, false);
    await assert.rejects(smoke({ baseUrl, profile: "edge" }), /exact canonical/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
