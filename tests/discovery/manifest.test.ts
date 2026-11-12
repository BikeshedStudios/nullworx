import { describe, expect, it } from "vitest";
import { EFFECTS } from "@/lib/effect-registry";
import { DISCOVERY_MANIFEST, getDiscoveryEffect } from "@/lib/discovery/manifest";
import {
  assertDiscoveryManifest,
  evidenceFileExists,
  getIndexableEffects,
  getIndexablePages,
  isEffectIndexable,
} from "@/lib/discovery/eligibility";
import { DiscoveryManifestSchema } from "@/lib/discovery/schema";

describe("discovery manifest", () => {
  it("validates and covers the canonical effect registry exactly", () => {
    expect(() => assertDiscoveryManifest()).not.toThrow();
    const manifestSlugs = DISCOVERY_MANIFEST.effects.map((effect) => effect.slug);
    const registrySlugs = EFFECTS.map((effect) => effect.slug);
    expect(manifestSlugs).toEqual(registrySlugs);
    expect(manifestSlugs).toHaveLength(8);
  });

  it("keeps indexability fail-closed and limited to approved effects", () => {
    const indexable = getIndexableEffects();
    expect(indexable).toHaveLength(7);
    expect(indexable.map((effect) => effect.slug)).not.toContain("digital-wake");
    expect(indexable.every((effect) => effect.releaseState === "approved")).toBe(true);
    expect(getIndexablePages().map((page) => page.path)).toEqual(["/", "/effects"]);
  });

  it("retains Digital Wake as Beta and outside indexing", () => {
    const wake = getDiscoveryEffect("digital-wake");
    expect(wake?.releaseState).toBe("beta");
    expect(wake?.indexStatus).toBe("noindex");
    expect(wake?.media.status).toBe("blocked");
    expect(wake?.media.hostingRights).toBe("unverified");
    expect(isEffectIndexable("digital-wake")).toBe(false);
    expect(DISCOVERY_MANIFEST.effects).toHaveLength(8);
  });

  it("treats ASCII media as fallback-only, never as cleared hosting", () => {
    const ascii = getDiscoveryEffect("ascii-waves");
    expect(ascii?.indexStatus).toBe("index");
    expect(ascii?.media.hostingRights).toBe("unverified");
    expect(ascii?.media.indexingImpact).toBe("fallback-only");
    expect(ascii?.evidence.media).toBe("MEDIA_PROVISIONING.md");
  });

  it("requires every referenced evidence file to exist", () => {
    for (const effect of DISCOVERY_MANIFEST.effects) {
      for (const ref of Object.values(effect.evidence)) {
        if (ref) expect(evidenceFileExists(ref), `${effect.slug}: ${ref}`).toBe(true);
      }
    }
    for (const page of DISCOVERY_MANIFEST.pages) {
      for (const ref of Object.values(page.evidence)) {
        if (ref) expect(evidenceFileExists(ref), `${page.path}: ${ref}`).toBe(true);
      }
    }
    expect(evidenceFileExists("docs/DOES_NOT_EXIST.md")).toBe(false);
  });

  it("rejects a Beta effect that tries to index", () => {
    const invalid = structuredClone(DISCOVERY_MANIFEST);
    const wake = invalid.effects.find((effect) => effect.slug === "digital-wake");
    expect(wake).toBeDefined();
    wake!.indexStatus = "index";
    const result = DiscoveryManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("must remain noindex"))).toBe(true);
    }
  });

  it("rejects duplicate canonical paths", () => {
    const invalid = structuredClone(DISCOVERY_MANIFEST);
    const glyph = invalid.effects.find((effect) => effect.slug === "glyph-morph");
    expect(glyph).toBeDefined();
    glyph!.canonicalPath = "/effects/magnetic-focus";
    const result = DiscoveryManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("Duplicate canonical path"))).toBe(true);
    }
  });

  it("does not let a slug claim another effect's canonical path", () => {
    const invalid = structuredClone(DISCOVERY_MANIFEST);
    const glyph = invalid.effects.find((effect) => effect.slug === "glyph-morph");
    expect(glyph).toBeDefined();
    glyph!.canonicalPath = "/effects/prism-text";
    const result = DiscoveryManifestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("does not match slug"))).toBe(true);
    }
  });
});
