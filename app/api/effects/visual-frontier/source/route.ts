import { getFrontierSources } from "@/lib/visual-frontier-source";

// Prerender into the exact release. Source and embedded font/WASM are fetched
// only when requested, never serialized into the homepage or preview payload.
export const dynamic = "force-static";
export async function GET() {
  return Response.json({ directory: "components/visual-frontier", sources: await getFrontierSources() }, {
    headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
