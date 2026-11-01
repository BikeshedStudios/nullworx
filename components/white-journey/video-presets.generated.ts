import { ACCEPTED_VIDEO, MEDIA_BASE } from "@/lib/media";
export const HOME_VIDEO_SOURCE = {
  name: "LOOP30", src: ACCEPTED_VIDEO,
  compatibilitySrc: `${MEDIA_BASE}/loop30-v2-vp9.webm`,
  startTime: 0,
} as const;
