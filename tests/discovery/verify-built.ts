import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { getIndexableEffects, getIndexablePages } from "../../lib/discovery/eligibility";
import { absoluteUrl, siteOrigin } from "../../lib/site";

const appDir = path.join(process.cwd(), ".next", "server", "app");
const failures: string[] = [];
let checks = 0;

function check(condition: boolean, message: string) {
  checks += 1;
  if (condition) {
    console.log(`PASS ${message}`);
  } else {
    failures.push(message);
    console.error(`FAIL ${message}`);
  }
}

function readArtifact(relative: string): string {
  const file = path.join(appDir, relative);
  check(existsSync(file), `artifact exists: ${relative}`);
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function headOf(html: string): string {
  const end = html.indexOf("</head>");
  return end === -1 ? html : html.slice(0, end);
}

function titleOf(html: string): string {
  return /<title>([\s\S]*?)<\/title>/.exec(headOf(html))?.[1] ?? "";
}

function metaName(html: string, name: string): string {
  return new RegExp(`<meta name="${name}" content="([^"]*)"`).exec(headOf(html))?.[1] ?? "";
}

function metaProperty(html: string, property: string): string {
  return new RegExp(`<meta property="${property}" content="([^"]*)"`).exec(headOf(html))?.[1] ?? "";
}

function canonicalOf(html: string): string {
  return /<link rel="canonical" href="([^"]*)"/.exec(headOf(html))?.[1] ?? "";
}

function jsonLdOf(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (match) => JSON.parse(match[1]!),
  );
}

function artifactForRoute(route: string): string {
  return route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`;
}

const expectedIndexable = [
  ...getIndexablePages().map((page) => page.path),
  ...getIndexableEffects().map((effect) => effect.canonicalPath),
];
const expectedUrls = expectedIndexable.map((route) => absoluteUrl(route));
const titles = new Set<string>();
const descriptions = new Set<string>();
const canonicals = new Set<string>();

for (const page of getIndexablePages()) {
  const html = readArtifact(artifactForRoute(page.path));
  const head = headOf(html);
  const title = titleOf(html);
  const description = metaName(html, "description");
  const robots = metaName(html, "robots");
  const canonical = canonicalOf(html);
  check(title === page.search.title, `${page.path}: exact title`);
  check(description === page.search.description, `${page.path}: exact description`);
  check(robots.includes("index") && robots.includes("follow"), `${page.path}: indexable robots`);
  check(canonical === absoluteUrl(page.path), `${page.path}: canonical ${absoluteUrl(page.path)}`);
  check(metaProperty(html, "og:url") === absoluteUrl(page.path), `${page.path}: og:url matches canonical`);
  check(metaName(html, "application-name") === "nullworx.space", `${page.path}: application-name nullworx.space`);
  check(!head.includes("nulllworx.site"), `${page.path}: no legacy canonical host in head`);
  check(!head.includes("opengraph-image") && !head.includes("twitter-image"), `${page.path}: no unpublished OG image references`);
  check(jsonLdOf(html).length >= 1, `${page.path}: JSON-LD present`);
  const bodyMarker = page.path === "/"
    ? "Good effects."
    : page.path === "/effects"
      ? "The React effects kit by Bikeshed Studios"
      : "Two ways to";
  check(html.includes(bodyMarker), `${page.path}: server-rendered content marker`);
  titles.add(title);
  descriptions.add(description);
  canonicals.add(canonical);
}

for (const effect of getIndexableEffects()) {
  const html = readArtifact(artifactForRoute(effect.canonicalPath));
  const title = titleOf(html);
  const description = metaName(html, "description");
  const robots = metaName(html, "robots");
  const canonical = canonicalOf(html);
  check(title === effect.search.title, `${effect.canonicalPath}: exact title`);
  check(description === effect.search.description, `${effect.canonicalPath}: exact description`);
  check(robots.includes("index") && robots.includes("follow"), `${effect.canonicalPath}: indexable robots`);
  check(canonical === absoluteUrl(effect.canonicalPath), `${effect.canonicalPath}: canonical ${absoluteUrl(effect.canonicalPath)}`);
  check(metaProperty(html, "og:url") === absoluteUrl(effect.canonicalPath), `${effect.canonicalPath}: og:url matches canonical`);
  check(html.includes(effect.content.summary), `${effect.canonicalPath}: server-rendered discovery summary`);
  check(html.includes(effect.name), `${effect.canonicalPath}: effect name in server HTML`);
  check(html.includes('lang="en"'), `${effect.canonicalPath}: document language`);
  const sectionIds = [...html.matchAll(/<section[^>]*\sid="([^"]+)"/g)].map((match) => match[1]!);
  check(new Set(sectionIds).size === sectionIds.length, `${effect.canonicalPath}: unique section ids`);
  check(sectionIds.filter((id) => id === "effect-notes").length === 1, `${effect.canonicalPath}: one discovery section`);
  check(jsonLdOf(html).length >= 1, `${effect.canonicalPath}: JSON-LD present`);
  const parsed = jsonLdOf(html);
  for (const block of parsed) {
    const text = JSON.stringify(block);
    check(
      !text.includes("aggregateRating") && !text.includes('"offers"') && !text.includes('"review"'),
      `${effect.canonicalPath}: no invented ratings/offers/reviews`,
    );
  }
  titles.add(title);
  descriptions.add(description);
  canonicals.add(canonical);
}

check(titles.size === expectedIndexable.length, "indexable titles are unique");
check(descriptions.size === expectedIndexable.length, "indexable descriptions are unique");
check(canonicals.size === expectedIndexable.length, "indexable canonicals are unique");

for (const [route, artifact, robotsNeedle] of [
  ["/effects/digital-wake", "effects/digital-wake.html", "noindex"],
  ["/about", "about.html", "noindex"],
  ["/privacy", "privacy.html", "noindex"],
  ["/licenses", "licenses.html", "noindex"],
  ["/lab/forge-factory-01", "lab/forge-factory-01.html", "noindex"],
] as const) {
  const html = readArtifact(artifact);
  const robots = metaName(html, "robots");
  const canonical = canonicalOf(html);
  check(robots.includes(robotsNeedle), `${route}: ${robotsNeedle} robots`);
  check(canonical === absoluteUrl(route), `${route}: self-canonical retained`);
  check(!expectedUrls.includes(absoluteUrl(route)), `${route}: not submitted in sitemap`);
}

const digitalWake = readArtifact("effects/digital-wake.html");
check(metaName(digitalWake, "robots").includes("noindex"), "Digital Wake: Beta noindex");
check(!digitalWake.includes('id="effect-notes"'), "Digital Wake: no indexable discovery section");
check(digitalWake.includes("Beta") || digitalWake.includes("EXPERIMENTAL"), "Digital Wake: Beta status remains visible or documented");

const notFound = readArtifact("_not-found.html");
check(metaName(notFound, "robots").includes("noindex"), "404: noindex");
check(canonicalOf(notFound) === "", "404: no invented canonical");

const sitemap = readArtifact("sitemap.xml.body");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]!);
check(locs.length === 12, "sitemap: exactly 12 approved URLs, including both Visual Frontier effects");
check(JSON.stringify(locs) === JSON.stringify(expectedUrls), "sitemap: exact parity with approved manifest URLs");
const expectedDates = [
  ...getIndexablePages().map((page) => page.lastModified),
  ...getIndexableEffects().map((effect) => effect.lastModified),
].map((date) => date + "T00:00:00.000Z");
check(JSON.stringify(lastmods) === JSON.stringify(expectedDates), "sitemap: per-route content dates match manifest");
check(!sitemap.includes("digital-wake"), "sitemap: Digital Wake excluded");
check(!sitemap.includes("/lab/") && !sitemap.includes("/tools/"), "sitemap: utility routes excluded");
check(locs.every((loc) => loc === siteOrigin || loc.startsWith(`${siteOrigin}/`)), "sitemap: all URLs on canonical origin");

const robots = readArtifact("robots.txt.body");
check(robots.includes("User-Agent: *"), "robots: wildcard user agent");
check(robots.includes("Allow: /"), "robots: allow root");
check(robots.includes("Disallow: /lab/"), "robots: lab excluded");
check(robots.includes("Disallow: /media/"), "robots: media excluded");
check(robots.includes("Disallow: /tools/"), "robots: tools excluded");
check(robots.includes(`Sitemap: ${absoluteUrl("/sitemap.xml")}`), "robots: canonical sitemap URL");
check(!robots.includes("Disallow: /effects/digital-wake"), "robots: beta URL uses noindex, not crawl blocking");

console.log(`\n${checks - failures.length}/${checks} checks passed.`);
if (failures.length) {
  console.error(`\n${failures.length} built-metadata checks failed.`);
  process.exitCode = 1;
} else {
  console.log("PASS: built metadata, sitemap parity and robots behavior are consistent.");
}
