/**
 * Compatibility surface for existing server components. The actual review
 * contract lives in lib/discovery/metadata.ts so route metadata, sitemap and
 * tests all read the same manifest.
 */
export {
  createPageMetadata,
  galleryMetadata,
  homeMetadata,
  effectMetadata,
  notFoundMetadata,
} from "./discovery/metadata";
export { SITE_DESCRIPTION as defaultSocialDescription } from "./site";
