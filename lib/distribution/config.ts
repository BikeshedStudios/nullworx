import "server-only";

export interface BrevoConfig {
  apiKey: string;
  listId: number;
  templateId: number;
}

function positiveId(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const result = Number(value);
  return Number.isSafeInteger(result) ? result : null;
}

export function getBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const listId = positiveId(process.env.BREVO_LIST_ID);
  const templateId = positiveId(process.env.BREVO_DOI_TEMPLATE_ID);
  if (!apiKey || !listId || !templateId) return null;
  return { apiKey, listId, templateId };
}

export function isDropsConfigured(): boolean {
  return getBrevoConfig() !== null;
}
