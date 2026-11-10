import { existsSync } from "node:fs";
import { EFFECTS } from "@/lib/effect-registry";
import { SOURCE_REPOSITORY, siteOrigin } from "@/lib/site";
import { DISCOVERY_MANIFEST } from "./manifest";
import type { DiscoveryEffect, DiscoveryPage } from "./schema";

export function evidenceFileExists(ref: string | null | undefined): boolean {
  if (!ref) return false;
  // Manifest validation rejects parent-directory segments; references are repo-relative.
  return existsSync(ref.split("#")[0]!);
}

function missingEvidence(effect: DiscoveryEffect): string[] {
  const missing: string[] = [];
  for (const [label, ref] of Object.entries(effect.evidence)) {
    if (ref && !evidenceFileExists(ref)) missing.push(`${effect.slug}: ${label} evidence ${ref}`);
  }
  return missing;
}

function indexabilityProblems(effect: DiscoveryEffect): string[] {
  if (effect.indexStatus !== "index") return [];
  const problems: string[] = [];

  if (effect.releaseState !== "approved") {
    problems.push(`${effect.slug}: ${effect.releaseState} effects cannot be indexed`);
  }
  if (effect.media.indexingImpact === "blocks-index") {
    problems.push(`${effect.slug}: blocked media cannot be indexed`);
  }
  if (effect.media.status === "included" && effect.media.hostingRights !== "cleared") {
    problems.push(`${effect.slug}: included media requires cleared hosting rights`);
  }
  if (effect.media.hostingRights === "unverified" && effect.media.indexingImpact !== "fallback-only") {
    problems.push(`${effect.slug}: unverified media may only be indexed when the page is useful without it`);
  }
  for (const key of ["ownerApproval", "rights", "install"] as const) {
    if (!evidenceFileExists(effect.evidence[key])) {
      problems.push(`${effect.slug}: missing ${key} evidence`);
    }
  }
  if (effect.media.status !== "none" && !evidenceFileExists(effect.evidence.media)) {
    problems.push(`${effect.slug}: media evidence is required for ${effect.media.status} media`);
  }
  return problems;
}

function pageProblems(page: DiscoveryPage): string[] {
  if (page.indexStatus !== "index") return [];
  const problems: string[] = [];
  for (const key of ["ownerApproval", "rights", "install"] as const) {
    if (!evidenceFileExists(page.evidence[key])) {
      problems.push(`${page.path}: missing ${key} evidence`);
    }
  }
  return problems;
}

/**
 * Fail closed: call this from every build-time metadata, sitemap and robots
 * entry point. A contradiction throws instead of silently publishing.
 */
let validationError: Error | null = null;
let validated = false;

export function assertDiscoveryManifest(): void {
  if (validated && validationError) throw validationError;
  if (validated) return;

  const problems: string[] = [];
  if (DISCOVERY_MANIFEST.site.origin !== siteOrigin) {
    problems.push(`Manifest origin ${DISCOVERY_MANIFEST.site.origin} does not match siteOrigin ${siteOrigin}`);
  }
  if (DISCOVERY_MANIFEST.site.repository !== SOURCE_REPOSITORY) {
    problems.push("Manifest repository does not match the source repository constant");
  }

  const registrySlugs: string[] = EFFECTS.map((effect) => effect.slug);
  const manifestSlugs = DISCOVERY_MANIFEST.effects.map((effect) => effect.slug);
  const missing = registrySlugs.filter((slug) => !manifestSlugs.includes(slug));
  const extra = manifestSlugs.filter((slug) => !registrySlugs.includes(slug));
  if (missing.length) problems.push(`Manifest is missing registry effects: ${missing.join(", ")}`);
  if (extra.length) problems.push(`Manifest contains unknown effects: ${extra.join(", ")}`);

  const canonicalPaths = new Set<string>();
  for (const page of DISCOVERY_MANIFEST.pages) {
    if (canonicalPaths.has(page.path)) problems.push(`Duplicate canonical path: ${page.path}`);
    canonicalPaths.add(page.path);
    if (new URL(page.path, DISCOVERY_MANIFEST.site.origin).origin !== DISCOVERY_MANIFEST.site.origin) {
      problems.push(`Page path escapes the canonical origin: ${page.path}`);
    }
    problems.push(...pageProblems(page));
  }

  for (const effect of DISCOVERY_MANIFEST.effects) {
    const registryEffect = EFFECTS.find((item) => item.slug === effect.slug);
    if (!registryEffect) {
      problems.push(`Effect ${effect.slug} does not resolve in lib/effect-registry.ts`);
      continue;
    }
    if (effect.name !== registryEffect.name) {
      problems.push(`Effect ${effect.slug} name does not match the registry`);
    }
    if (effect.canonicalPath !== `/effects/${effect.slug}`) {
      problems.push(`Effect ${effect.slug} canonical path does not match its slug`);
    }
    if (canonicalPaths.has(effect.canonicalPath)) {
      problems.push(`Duplicate canonical path: ${effect.canonicalPath}`);
    }
    canonicalPaths.add(effect.canonicalPath);
    if (new URL(effect.canonicalPath, DISCOVERY_MANIFEST.site.origin).origin !== DISCOVERY_MANIFEST.site.origin) {
      problems.push(`Effect path escapes the canonical origin: ${effect.canonicalPath}`);
    }
    problems.push(...missingEvidence(effect));
    problems.push(...indexabilityProblems(effect));
  }

  if (problems.length) {
    validationError = new Error(`Discovery manifest failed closed:\n- ${problems.join("\n- ")}`);
    throw validationError;
  }
  validated = true;
}

export function getIndexablePages(): DiscoveryPage[] {
  assertDiscoveryManifest();
  return DISCOVERY_MANIFEST.pages.filter((page) => page.indexStatus === "index");
}

export function getIndexableEffects(): DiscoveryEffect[] {
  assertDiscoveryManifest();
  return DISCOVERY_MANIFEST.effects.filter((effect) => effect.indexStatus === "index");
}

export function isEffectIndexable(slug: string): boolean {
  assertDiscoveryManifest();
  return DISCOVERY_MANIFEST.effects.some(
    (effect) => effect.slug === slug && effect.indexStatus === "index",
  );
}
