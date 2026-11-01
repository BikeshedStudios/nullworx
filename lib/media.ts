/** These versioned paths can be served by the site or an HTTPS CDN after rights clearance.
 * Never enable a substitute source. Local files remain browser-only blob URLs. */
export const VIDEO_SHA =
  "807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238";
export const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_UI_FORGE_MEDIA_BASE || "/media/local"
).replace(/\/$/, "");
export const ACCEPTED_VIDEO = `${MEDIA_BASE}/loop30-v2.mp4`;
export const FISH_DATA = `${MEDIA_BASE}/fish-data.json`;
export const FIN_MOTION = `${MEDIA_BASE}/fin-motion-012.json`;
export const FIN_REGIONS = `${MEDIA_BASE}/fin-regions-012.json`;
