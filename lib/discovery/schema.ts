import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD).");

const evidenceRef = z
  .string()
  .min(1)
  .max(240)
  .regex(/^(?!.*\.\.)[A-Za-z0-9._/-]+(?:#[A-Za-z0-9._-]+)?$/, "Evidence must be a repository-relative file path.");

export const DiscoverySearchSchema = z.object({
  primaryIntent: z.enum(["learn", "build", "integrate", "compare"]),
  primaryQuery: z.string().min(3).max(90),
  relatedQueries: z.array(z.string().min(3).max(90)).max(8),
  title: z.string().min(10).max(70),
  description: z.string().min(80).max(180),
});

export const DiscoveryEvidenceSchema = z.object({
  ownerApproval: evidenceRef,
  rights: evidenceRef,
  install: evidenceRef,
  media: evidenceRef.nullable(),
});

export const DiscoveryMediaSchema = z.object({
  status: z.enum(["none", "included", "local-only", "blocked"]),
  hostingRights: z.enum(["not-applicable", "cleared", "unverified"]),
  indexingImpact: z.enum(["none", "fallback-only", "blocks-index"]),
  note: z.string().min(10).max(280).nullable(),
});

export const DiscoveryContentSchema = z.object({
  summary: z.string().min(80).max(280),
  useCases: z.array(z.string().min(12).max(120)).min(2).max(5),
  install: z.array(z.string().min(12).max(180)).min(2).max(6),
  limits: z.array(z.string().min(12).max(160)).min(2).max(5),
  rightsNote: z.string().min(20).max(400),
});

export const DiscoveryPageSchema = z.object({
  kind: z.enum(["home", "gallery"]),
  path: z.enum(["/", "/effects"]),
  search: DiscoverySearchSchema,
  indexStatus: z.enum(["index", "noindex"]),
  evidence: DiscoveryEvidenceSchema,
  lastModified: isoDate,
});

export const DiscoveryEffectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(80),
  canonicalPath: z.string().regex(/^\/effects\/[a-z0-9]+(?:-[a-z0-9]+)*$/),
  releaseState: z.enum(["approved", "beta", "draft"]),
  indexStatus: z.enum(["index", "noindex"]),
  search: DiscoverySearchSchema,
  content: DiscoveryContentSchema,
  evidence: DiscoveryEvidenceSchema,
  media: DiscoveryMediaSchema,
  lastModified: isoDate,
});

export const DiscoveryManifestSchema = z
  .object({
    site: z.object({
      name: z.literal("Nullworx"),
      collectionName: z.literal("UI Forge"),
      origin: z.string().url(),
      language: z.literal("en"),
      repository: z.string().url(),
    }),
    pages: z.array(DiscoveryPageSchema).min(2).max(2),
    effects: z.array(DiscoveryEffectSchema).min(1).max(32),
  })
  .superRefine((manifest, ctx) => {
    const paths = [
      ...manifest.pages.map((page) => page.path),
      ...manifest.effects.map((effect) => effect.canonicalPath),
    ];
    const duplicatePaths = paths.filter((path, index) => paths.indexOf(path) !== index);
    for (const path of new Set(duplicatePaths)) {
      ctx.addIssue({ code: "custom", message: `Duplicate canonical path: ${path}`, path: ["pages"] });
    }

    const slugs = manifest.effects.map((effect) => effect.slug);
    const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    for (const slug of new Set(duplicateSlugs)) {
      ctx.addIssue({ code: "custom", message: `Duplicate effect slug: ${slug}`, path: ["effects"] });
    }

    for (const effect of manifest.effects) {
      if (effect.canonicalPath !== `/effects/${effect.slug}`) {
        ctx.addIssue({
          code: "custom",
          message: `Canonical path does not match slug for ${effect.slug}`,
          path: ["effects"],
        });
      }
      if (effect.releaseState === "beta" && effect.indexStatus !== "noindex") {
        ctx.addIssue({
          code: "custom",
          message: `Beta effect ${effect.slug} must remain noindex.`,
          path: ["effects"],
        });
      }
      if (effect.media.indexingImpact === "blocks-index" && effect.indexStatus !== "noindex") {
        ctx.addIssue({
          code: "custom",
          message: `Effect ${effect.slug} has blocked media and must remain noindex.`,
          path: ["effects"],
        });
      }
      if (effect.releaseState === "draft" && effect.indexStatus !== "noindex") {
        ctx.addIssue({
          code: "custom",
          message: `Draft effect ${effect.slug} must remain noindex.`,
          path: ["effects"],
        });
      }
    }
  });

export type DiscoveryManifest = z.infer<typeof DiscoveryManifestSchema>;
export type DiscoveryPage = z.infer<typeof DiscoveryPageSchema>;
export type DiscoveryEffect = z.infer<typeof DiscoveryEffectSchema>;
export type DiscoverySearch = z.infer<typeof DiscoverySearchSchema>;
export type DiscoveryContent = z.infer<typeof DiscoveryContentSchema>;
export type DiscoveryMedia = z.infer<typeof DiscoveryMediaSchema>;
