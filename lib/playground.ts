/** A settings/code boundary, not a renderer. Each study owns its validation and JSX. */
export type PlaygroundContract<Settings> = {
  defaults: Settings;
  path: string;
  directory: string;
  files: readonly string[];
  normalize: (settings: Settings) => Settings;
  parse: (query: string) => Settings;
  query: (settings: Settings) => string;
  usage: (settings: Settings) => string;
};

export type PreviewSize = "desktop" | "mobile";

/** Bounded, versioned, single-value URL fields. Unknown keys never select code. */
export function playgroundParams(query: string, versionKey: string) {
  if (query.length > 2048) return null;
  try { decodeURIComponent(query.replaceAll("+", " ")); }
  catch { return null; }
  const params = new URLSearchParams(query);
  const single = (key: string) => params.getAll(key).length === 1 ? params.get(key) : null;
  return single(versionKey) === "1" ? single : null;
}

export function playgroundNumber(value: unknown, min: number, max: number, fallback: number, step = 1) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
    ? Math.round(Math.round((value - min) / step) * step * 100 + min * 100) / 100 : fallback;
}

export function queryNumber(value: string | null) {
  return value !== null && /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value) ? Number(value) : undefined;
}

export function playgroundText(value: unknown, fallback: string, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength && !/[\u0000-\u001f\u007f]/.test(value)
    ? value : fallback;
}
