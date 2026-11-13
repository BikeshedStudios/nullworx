import { compositor } from "../material-core/compositor";
import { sourceCells } from "../material-core/coverage-mask";
import { ACTIVE_MS, clamp, hash, WINDUP_MS, type MaterialOptions, type Raster } from "../material-core/types";

/** A one-dimensional boundary field with broad coves, narrow inlets and edge chips. */
export function seamErosion(canvas: HTMLCanvasElement, source: Raster, options: MaterialOptions) {
  const { width: w, height: h, dpr } = source;
  const force = options.intensity;
  const cells = sourceCells(source, (w > 600 ? 6 : 4) / options.density, (x, y) => {
    const depth = (0.72 * h - y) / (0.28 * h);
    if (depth >= 1) return Infinity; // The live hero above the seam is never destroyed.
    const field = 0.22 * Math.sin(x / w * 10 + 0.6) + 0.1 * Math.sin(x / w * 27)
      + 0.035 * Math.sin(x * 0.14) + (hash(x, y) - 0.5) * 0.042;
    return WINDUP_MS + clamp(depth + field * Math.sin(Math.PI * depth), 0.002, 1) * ACTIVE_MS;
  });
  return compositor(canvas, source, cells, (ctx, particles, ms) => {
    let count = 0;
    for (const cell of particles) {
      const age = (ms - cell.birth) / 1000;
      const life = 0.9 + cell.seed * 0.85;
      if (age < 0 || age > life || cell.birth === Infinity) continue;
      const drag = (1 - Math.exp(-2.2 * age)) / 2.2;
      const x = cell.x + ((cell.seed - 0.3) * 65 * drag + Math.sin(cell.x * 0.01 + age * 4) * age * 6) * force;
      const y = cell.y + (-(10 + cell.seed * 42) * drag + age * age * (85 + cell.band * 38)) * force;
      ctx.globalAlpha = Math.pow(1 - age / life, 1.6);
      ctx.save(); ctx.translate(x, y); ctx.rotate((cell.seed - 0.5) * age * 5);
      const scale = (0.5 + cell.seed * 0.65) * (1 - age / life * 0.35);
      ctx.drawImage(source.canvas, cell.x * dpr, cell.y * dpr, cell.w * dpr, cell.h * dpr,
        -cell.w * scale / 2, -cell.h * scale / 2, cell.w * scale, cell.h * scale * 0.65);
      ctx.restore(); count++;
    }
    ctx.globalAlpha = 1;
    return [count, 0, 0];
  });
}
