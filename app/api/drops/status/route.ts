import { isDropsConfigured } from "@/lib/distribution/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ enabled: isDropsConfigured() }, {
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
