import { canvas2d, context } from "./source-raster";
import { hash, type Raster } from "./types";

export type Cell = {
  x: number; y: number; w: number; h: number;
  sx: number; sy: number; alpha: number; mass: number;
  color: string; seed: number; band: number; birth: number;
};

/** Every birth owns disjoint source pixels, including their shadow/alpha. */
export function sourceCells(source: Raster, step: number, birth: (x: number, y: number) => number, aspect = 1): Cell[] {
  const { width, height } = source.canvas;
  const pixels = source.canvas.getContext("2d")!.getImageData(0, 0, width, height).data;
  const size = Math.max(2, Math.round(step * source.dpr));
  const cells: Cell[] = [];
  for (let y = 0; y < height; y += size) for (let x = 0; x < width;) {
    const span = aspect === 1 ? size : Math.max(2, Math.round(size * aspect * (0.65 + hash(x, y) * 0.7)));
    const w = Math.min(span, width - x), h = Math.min(size, height - y);
    const left = x;
    x += w;
    let mass = 0, best = 0, sx = x, sy = y;
    for (let yy = y; yy < y + h; yy++) for (let xx = left; xx < left + w; xx++) {
      const alpha = pixels[(yy * width + xx) * 4 + 3];
      mass += alpha / 255;
      if (alpha > best) { best = alpha; sx = xx; sy = yy; }
    }
    if (!mass) continue;
    const i = (sy * width + sx) * 4;
    const seed = hash(left, y);
    cells.push({ x: left / source.dpr, y: y / source.dpr, w: w / source.dpr, h: h / source.dpr,
      sx, sy, alpha: best / 255, mass, color: `rgb(${pixels[i]} ${pixels[i + 1]} ${pixels[i + 2]})`, seed,
      band: Math.floor(seed * 3), birth: birth((left + w / 2) / source.dpr, (y + h / 2) / source.dpr) });
  }
  return cells.sort((a, b) => a.birth - b.birth);
}

export class DamageSurface {
  readonly layer: Raster;
  readonly sourceAlpha: number;
  removed = 0;
  removedMass = 0;
  private previousMs = -1;
  constructor(readonly source: Raster, readonly cells: Cell[]) {
    this.layer = canvas2d(source.width, source.height, source.dpr);
    this.sourceAlpha = cells.reduce((sum, cell) => sum + cell.mass, 0);
    this.restore();
  }
  private restore() {
    const ctx = context(this.layer);
    ctx.clearRect(0, 0, this.layer.width, this.layer.height);
    ctx.drawImage(this.source.canvas, 0, 0, this.layer.width, this.layer.height);
    this.removed = 0;
    this.removedMass = 0;
  }
  advance(ms: number) {
    if (ms < this.previousMs) this.restore();
    this.previousMs = ms;
    const ctx = context(this.layer);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    while (this.removed < this.cells.length && this.cells[this.removed].birth <= ms) {
      const cell = this.cells[this.removed++];
      ctx.rect(cell.x, cell.y, cell.w, cell.h);
      this.removedMass += cell.mass;
    }
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    return 1 - this.removedMass / (this.sourceAlpha || 1);
  }
  destroy() {
    this.layer.canvas.width = this.layer.canvas.height = 1;
    this.source.canvas.width = this.source.canvas.height = 1;
  }
}
