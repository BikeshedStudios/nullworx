export type FrontierKind = "refractive-type" | "impossible-material";
export type Variant = 0 | 1;
export type Values = readonly [number, number];
export type SceneState = { pointer: [number, number]; values: Values; paused: boolean };
export type Engine = {
  backend: string;
  compileMs?: number;
  resize(width: number, height: number): void;
  draw(time: number, state: SceneState): void;
  dispose(): void | Promise<void>;
  info?(): { geometries: number; textures: number; calls: number; triangles: number; bytes?: number; readbackBuffers?: number; renderTargets?: number };
};
export type SceneMetrics = {
  frames: number; running: boolean; time: number; fps: number; startupMs: number; compileMs: number | null;
  intervals: number[]; cpuMs: number[]; backend: string;
};
export function clamp(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
}
