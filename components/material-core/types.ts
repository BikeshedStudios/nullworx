export type MaterialKind = "ashfall" | "seam" | "sediment";
export type MaterialOptions = { intensity: number; density: number };
export const DEFAULT_MATERIAL_OPTIONS: MaterialOptions = { intensity: 1, density: 1 };
export function normalizeMaterialOptions(input?: Partial<MaterialOptions>): MaterialOptions {
  const intensity = Number.isFinite(input?.intensity) ? Math.min(1.6, Math.max(0.4, input!.intensity!)) : 1;
  const density = Number.isFinite(input?.density) ? Math.min(1.4, Math.max(0.6, input!.density!)) : 1;
  return { intensity, density };
}
export type MaterialPhase = "IDLE" | "WINDUP" | "ACTIVE" | "SETTLING" | "COMPLETE";
export type Comparison = "original" | "css" | "candidate";

/** Explicit supported surfaces. No arbitrary DOM screenshots or remote media. */
export type MaterialSource =
  | { kind: "text"; lines: readonly string[]; color: string }
  | { kind: "section"; color: string }
  | { kind: "raster"; src: string; alt: string };

export type FrameReceipt = {
  sourceCoverage: number;
  removedCells: number;
  particles: number;
  strata: [number, number, number];
};

export type MaterialRenderer = {
  draw: (elapsedMs: number) => FrameReceipt;
  destroy: () => void;
  inspect: () => {
    cells: number;
    invalidBirths: number;
    sourceAlpha: number;
    width: number;
    height: number;
    dpr: number;
    remainingAlpha: number;
    partialAlphaPixels: number;
  };
};

export type Raster = { canvas: HTMLCanvasElement; width: number; height: number; dpr: number };

export const WINDUP_MS = 380;
export const ACTIVE_MS = 2500;
export const TOTAL_MS = 5400;
export const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
export const hash = (x: number, y: number, seed = 41) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 17.13) * 43758.5453;
  return n - Math.floor(n);
};
