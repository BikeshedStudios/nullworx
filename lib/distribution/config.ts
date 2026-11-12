import "server-only";

export interface BrevoConfig {
  apiKey: string;
  listId: number;
  templateId: number;
  privacyEmail: string;
}

function positiveId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const result = Number(value);
  return Number.isSafeInteger(result) ? result : null;
}

export function getBrevoConfig(): BrevoConfig | null {
  // Build or runtime secrets alone must never activate public subscriptions.
  if (process.env.NULLWORX_DROPS_ENABLED !== "1") return null;
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = positiveId(process.env.BREVO_LIST_ID);
  const templateId = positiveId(process.env.BREVO_DOI_TEMPLATE_ID);
  const privacyEmail = process.env.DROPS_PRIVACY_CONTACT_EMAIL?.trim() ?? "";
  if (!apiKey || !listId || !templateId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(privacyEmail)) return null;
  return { apiKey, listId, templateId, privacyEmail };
}

export function isDropsConfigured(): boolean {
  return getBrevoConfig() !== null;
}
