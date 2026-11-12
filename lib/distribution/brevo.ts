import "server-only";
import type { BrevoConfig } from "./config";
import { absoluteUrl } from "@/lib/site";

export async function requestDoubleOptIn(
  email: string,
  config: BrevoConfig,
  send: typeof fetch = fetch
): Promise<boolean> {
  try {
    const response = await send("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        includeListIds: [config.listId],
        templateId: config.templateId,
        redirectionUrl: absoluteUrl("/drops/confirmed"),
        contactPixelTrackingConsent: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return response.status === 201 || response.status === 204;
  } catch {
    return false;
  }
}
