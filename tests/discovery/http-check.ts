import { getIndexableEffects, getIndexablePages } from "../../lib/discovery/eligibility";
import { absoluteUrl, siteOrigin } from "../../lib/site";

const baseUrl = process.env.SEO_BASE_URL ?? "http://127.0.0.1:3350";
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

async function get(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", ...init });
}

async function html(path: string) {
  const response = await get(path);
  const body = await response.text();
  return { response, body };
}

async function main() {
for (const page of getIndexablePages()) {
  const { response, body } = await html(page.path);
  check(response.status === 200, `${page.path}: HTTP 200`);
  check(response.headers.get("content-type")?.includes("text/html") === true, `${page.path}: HTML content type`);
  check(titleOf(body) === page.search.title, `${page.path}: exact title`);
  check(metaName(body, "description") === page.search.description, `${page.path}: exact description`);
  check(metaName(body, "robots").includes("index"), `${page.path}: indexable robots meta`);
  check(canonicalOf(body) === absoluteUrl(page.path), `${page.path}: canonical ${absoluteUrl(page.path)}`);
  check(metaProperty(body, "og:url") === absoluteUrl(page.path), `${page.path}: og:url matches canonical`);
  check(!headOf(body).includes("nulllworx.site"), `${page.path}: no legacy canonical host`);
}

for (const effect of getIndexableEffects()) {
  const { response, body } = await html(effect.canonicalPath);
  check(response.status === 200, `${effect.canonicalPath}: HTTP 200`);
  check(titleOf(body) === effect.search.title, `${effect.canonicalPath}: exact title`);
  check(metaName(body, "robots").includes("index"), `${effect.canonicalPath}: indexable robots meta`);
  check(canonicalOf(body) === absoluteUrl(effect.canonicalPath), `${effect.canonicalPath}: canonical`);
  check(body.includes(effect.content.summary), `${effect.canonicalPath}: server-rendered discovery summary`);
  check(body.includes('type="application/ld+json"'), `${effect.canonicalPath}: JSON-LD in initial HTML`);
}

const indexableUrls = [
  ...getIndexablePages().map((page) => page.path),
  ...getIndexableEffects().map((effect) => effect.canonicalPath),
].map((route) => absoluteUrl(route));

for (const [route, expectedRobots] of [
  ["/effects/digital-wake", "noindex"],
  ["/about", "noindex"],
  ["/privacy", "noindex"],
  ["/licenses", "noindex"],
  ["/lab/forge-factory-01", "noindex"],
] as const) {
  const { response, body } = await html(route);
  check(response.status === 200, `${route}: HTTP 200`);
  check(metaName(body, "robots").includes(expectedRobots), `${route}: ${expectedRobots} meta`);
  check(canonicalOf(body) === absoluteUrl(route), `${route}: self-canonical`);
  check(!indexableUrls.includes(absoluteUrl(route)), `${route}: absent from approved sitemap set`);
}

const lab = await html("/lab/forge-factory-01");
check(lab.response.headers.get("x-robots-tag")?.includes("noindex") === true, "/lab/forge-factory-01: X-Robots-Tag header");

const digitalWake = await html("/effects/digital-wake");
check(digitalWake.body.includes("EXPERIMENTAL / BETA") || digitalWake.body.includes("Beta"), "Digital Wake: Beta status remains visible");
check(!digitalWake.body.includes('type="application/ld+json"'), "Digital Wake: no structured-data promotion for a noindex beta");

const canonicalQuery = await html("/effects?utm_source=seo-test");
check(canonicalQuery.response.status === 200, "/effects?utm_source=seo-test: HTTP 200");
check(canonicalOf(canonicalQuery.body) === absoluteUrl("/effects"), "/effects query: canonical strips tracking parameters");

const trailing = await get("/effects/");
check([301, 308].includes(trailing.status), "/effects/: trailing-slash redirect status");
check(trailing.headers.get("location")?.endsWith("/effects") === true, "/effects/: redirects to /effects");

const missing = await html("/effects/does-not-exist");
check(missing.response.status === 404, "unknown effect: HTTP 404");
check(metaName(missing.body, "robots").includes("noindex"), "unknown effect: noindex");
check(canonicalOf(missing.body) === "", "unknown effect: no invented canonical");

const robotsResponse = await get("/robots.txt");
const robots = await robotsResponse.text();
check(robotsResponse.status === 200, "/robots.txt: HTTP 200");
check(robotsResponse.headers.get("content-type")?.includes("text/plain") === true, "/robots.txt: text/plain");
check(robots.includes("User-Agent: *"), "/robots.txt: wildcard user agent");
check(robots.includes("Disallow: /lab/"), "/robots.txt: lab excluded");
check(robots.includes("Disallow: /media/"), "/robots.txt: media excluded");
check(robots.includes("Disallow: /tools/"), "/robots.txt: tools excluded");
check(robots.includes(`Sitemap: ${absoluteUrl("/sitemap.xml")}`), "/robots.txt: canonical sitemap URL");

const sitemapResponse = await get("/sitemap.xml");
const sitemap = await sitemapResponse.text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
check(sitemapResponse.status === 200, "/sitemap.xml: HTTP 200");
check(sitemapResponse.headers.get("content-type")?.includes("xml") === true, "/sitemap.xml: XML content type");
check(JSON.stringify(locs) === JSON.stringify(indexableUrls), "/sitemap.xml: exact parity with approved manifest URLs");
check(!sitemap.includes("digital-wake"), "/sitemap.xml: Digital Wake excluded");
check(!sitemap.includes("/lab/") && !sitemap.includes("/tools/"), "/sitemap.xml: utility routes excluded");
check(locs.every((loc) => loc === siteOrigin || loc.startsWith(`${siteOrigin}/`)), "/sitemap.xml: canonical origin only");

console.log(`\n${checks - failures.length}/${checks} HTTP checks passed.`);
if (failures.length) {
  console.error(`\n${failures.length} HTTP checks failed.`);
  process.exitCode = 1;
} else {
  console.log("PASS: live HTTP metadata, canonical, sitemap and robots behavior are consistent.");
}

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
