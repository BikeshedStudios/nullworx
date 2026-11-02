import { compositor } from "../material-core/compositor";
import { sourceCells } from "../material-core/coverage-mask";
import { ACTIVE_MS, clamp, hash, WINDUP_MS, type Raster } from "../material-core/types";

/** Coarse laminae fall, middle grains saltate, fine mineral dust rides the wind. */
export function sedimentReveal(canvas: HTMLCanvasElement, source: Raster) {
  const { width: w, height: h, dpr } = source;
  // Staggered, thin bedding plates: no square grid in either the source edge or debris.
  const cells = sourceCells(source, w > 600 ? 5 : 3.5, (x, y) => {
    const sweep = 0.72 * x / w + 0.28 * (1 - y / h);
    const bedding = Math.sin(y * 0.031 + x * 0.006) * 0.064 + Math.sin(y * 0.089) * 0.018;
    return WINDUP_MS + clamp(sweep + bedding + (hash(x, y) - 0.5) * 0.025, 0.005, 0.995) * ACTIVE_MS;
  }, 5.2);
  const plates = cells.map(cell => ({ ...cell,
    stratum: cell.seed < 0.18 ? 0 : cell.seed < 0.64 ? 1 : 2,
    grains: [hash(cell.x, cell.y, 7), hash(cell.x, cell.y, 8)],
    finePath: (() => {
      const path = new Path2D();
      const width = cell.w / 2, height = cell.h / 2;
      path.moveTo(-width, -height * .35); path.lineTo(-width * .6, -height);
      path.lineTo(width * .55, -height * .65); path.lineTo(width, height * .1);
      path.lineTo(width * .62, height * .7); path.lineTo(-width * .48, height); path.closePath();
      return path;
    })(),
  }));
  return compositor(canvas, source, cells, (ctx, _particles, ms) => {
    const strata: [number, number, number] = [0, 0, 0];
    for (const cell of plates) {
      const age = (ms - cell.birth) / 1000;
      const stratum = cell.stratum;
      const life = [1.25, 1.4, 2.3][stratum];
      if (age < 0 || age > life) continue;
      const drag = (1 - Math.exp(-2.6 * age)) / 2.6;
      const drift = Math.sin(cell.y * 0.025 + age * 2.3) - Math.sin(cell.y * 0.025);
      const x = cell.x + cell.w / 2 + (30 + stratum * 27) * age + drift * age * 8;
      const y = cell.y + cell.h / 2 - (18 + cell.seed * 25) * drag + [135, 59, -30][stratum] * age * age;
      const fade = Math.pow(1 - age / life, stratum === 0 ? 0.75 : 1.5);
      ctx.save(); ctx.translate(x, y);
      if (stratum === 0) {
        ctx.globalAlpha = fade;
        ctx.rotate(age * (cell.seed - 0.08) * 7);
        const roll = 0.35 + 0.65 * Math.abs(Math.cos(age * 3));
        ctx.scale(1 + age * 0.18, roll);
        ctx.clip(cell.finePath);
        // Textured lamina with a chipped, tapered profile and edge-on roll.
        ctx.drawImage(source.canvas, cell.x * dpr, cell.y * dpr, cell.w * dpr, cell.h * dpr,
          -cell.w / 2, -cell.h / 2, cell.w, cell.h);
      } else {
        ctx.fillStyle = cell.color;
        for (const seed of cell.grains) {
          ctx.globalAlpha = fade * cell.alpha * (stratum === 1 ? 0.72 : 0.25);
          const gx = (seed - 0.5) * cell.w + age * (seed - 0.5) * (stratum === 2 ? 42 : 12);
          const gy = (seed - 0.5) * cell.h + drift * age * (stratum === 2 ? 11 : 2);
          const r = stratum === 1 ? 0.9 + seed * 1.5 : 0.4 + seed * 0.6;
          if (stratum === 1) {
            ctx.beginPath(); ctx.moveTo(gx - r, gy); ctx.lineTo(gx, gy - r * .6);
            ctx.lineTo(gx + r * 1.8, gy + r * .4); ctx.lineTo(gx, gy + r); ctx.closePath(); ctx.fill();
          } else ctx.fillRect(gx, gy, r, r * .7);
        }
      }
      ctx.restore(); strata[stratum]++;
    }
    ctx.globalAlpha = 1;
    return strata;
  });
}
