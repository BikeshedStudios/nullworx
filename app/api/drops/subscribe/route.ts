import { createHash } from "node:crypto";
import { getBrevoConfig } from "@/lib/distribution/config";
import { requestDoubleOptIn } from "@/lib/distribution/brevo";
import { dropsSchema } from "@/lib/distribution/schema";
import { canRequestDoi } from "@/lib/distribution/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2048;

function reply(message: string, status: number): Response {
  return Response.json({ message }, {
    status,
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}

async function readSmallBody(request: Request): Promise<string | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: Request): Promise<Response> {
  const config = getBrevoConfig();
  if (!config) return reply("Signups are unavailable.", 503);
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return reply("Forbidden.", 403);
  if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") {
    return reply("Unsupported content type.", 415);
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(length) || length > MAX_BODY_BYTES) return reply("Invalid payload size.", 413);

  let json: unknown;
  try {
    const raw = await readSmallBody(request);
    if (!raw) return reply("Invalid payload.", 400);
    json = JSON.parse(raw);
  } catch {
    return reply("Invalid payload.", 400);
  }
  const parsed = dropsSchema.safeParse(json);
  if (!parsed.success) return reply("Enter a valid email address.", 400);

  // Honeypot: pretend success without sending an email.
  if (parsed.data.website) return reply("Check your inbox for a confirmation link.", 202);

  const email = parsed.data.email.trim().toLowerCase();
  const identity = createHash("sha256").update(email).digest("hex");
  if (!canRequestDoi(identity)) return reply("Check your inbox for a confirmation link.", 202);

  if (!(await requestDoubleOptIn(email, config))) return reply("Signups are unavailable.", 502);
  return reply("Check your inbox for a confirmation link.", 202);
}
