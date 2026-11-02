import { compositor } from "../material-core/compositor";
import { sourceCells } from "../material-core/coverage-mask";
import { ACTIVE_MS, clamp, hash, WINDUP_MS, type Raster } from "../material-core/types";

/** Newspaper ash: source tiles curl into three depth bands in one rising wind. */
export function ashfallType(canvas: HTMLCanvasElement, source: Raster) {
  const { width: w, height: h, dpr } = source;
  const cells = sourceCells(source, w > 600 ? 3.2 : 2.2, (x, y) => {
    const front = 0.82 * (1 - x / w) + 0.12 * y / h
      + 0.042 * Math.sin(y * 0.036) + 0.024 * Math.sin(x * 0.047 + y * 0.018)
      + (hash(Math.floor(x / 7), Math.floor(y / 7)) - 0.5) * 0.024;
    return WINDUP_MS + clamp(front, 0.015, 0.98) * ACTIVE_MS;
  });
  return compositor(canvas, source, cells, (ctx, particles, ms) => {
    const bands: [number, number, number] = [0, 0, 0];
    for (const cell of particles) {
      const age = (ms - cell.birth) / 1000;
      const life = 1.25 + cell.seed * 1.1;
      if (age < 0 || age > life) continue;
      const z = [0.62, 1, 1.45][cell.band];
      const drag = (1 - Math.exp(-1.9 * age)) / 1.9;
      const phase = cell.x * 0.011 + cell.y * 0.014;
      const curl = Math.sin(phase + age * 3.1) - Math.sin(phase);
      const px = cell.x + (50 + cell.seed * 70) * drag * z + age * 39 * z + curl * age * 10;
      const py = cell.y - (22 + cell.seed * 42) * drag * z - 47 * age * age * z + curl * age * 5;
      const alpha = cell.alpha * Math.pow(1 - age / life, 1.35);
      const perspective = 1 + age * (z - 0.8) * 0.23;
      const fold = 0.3 + 0.7 * Math.abs(Math.cos(age * (3 + cell.seed * 4) + cell.seed));
      if (cell.band === 0 && age > 0.08) {
        ctx.globalAlpha = alpha * 0.16 * (1 - age / life);
        ctx.strokeStyle = cell.color;
        ctx.lineWidth = 0.65;
        ctx.beginPath(); ctx.moveTo(px - 5 * age, py + 6 * age); ctx.lineTo(px, py); ctx.stroke();
      }
      ctx.globalAlpha = Math.pow(1 - age / life, 1.35);
      ctx.save();
      ctx.translate(px + cell.w / 2, py + cell.h / 2);
      ctx.rotate(age * (cell.seed - 0.35) * 4.5);
      ctx.scale(perspective, perspective * fold);
      ctx.drawImage(source.canvas, cell.x * dpr, cell.y * dpr, cell.w * dpr, cell.h * dpr,
        -cell.w / 2, -cell.h / 2, cell.w, cell.h);
      ctx.restore();
      bands[cell.band]++;
    }
    ctx.globalAlpha = 1;
    return bands;
  });
}
