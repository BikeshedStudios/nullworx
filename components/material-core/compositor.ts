import { DamageSurface, type Cell } from "./coverage-mask";
import { context } from "./source-raster";
import { WINDUP_MS, type MaterialRenderer, type Raster } from "./types";

export type Painter = (ctx: CanvasRenderingContext2D, cells: readonly Cell[], ms: number) => [number, number, number];

/** Shared only by the three raster proofs: coverage first, departed material second. */
export function compositor(target: HTMLCanvasElement, source: Raster, cells: Cell[], paint: Painter): MaterialRenderer {
  target.width = source.canvas.width;
  target.height = source.canvas.height;
  const damage = new DamageSurface(source, cells);
  const ctx = context({ ...source, canvas: target });
  const pixels = source.canvas.getContext("2d")!.getImageData(0, 0, target.width, target.height).data;
  const invalidBirths = cells.filter(cell => !pixels[(cell.sy * target.width + cell.sx) * 4 + 3]).length;
  let partialAlphaPixels = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0 && pixels[i] < 255) partialAlphaPixels++;
  return {
    draw(ms) {
      ctx.clearRect(0, 0, source.width, source.height);
      const sourceCoverage = damage.advance(ms);
      // A brief, subpixel tension release, with no damage until WINDUP has ended.
      const anticipation = ms > 0 && ms < WINDUP_MS ? Math.sin(ms / WINDUP_MS * Math.PI) * 1.2 : 0;
      ctx.drawImage(damage.layer.canvas, anticipation, 0, source.width, source.height);
      const strata = paint(ctx, cells, ms);
      return { sourceCoverage, removedCells: damage.removed, particles: strata[0] + strata[1] + strata[2], strata };
    },
    inspect() {
      const pixels = damage.layer.canvas.getContext("2d")!.getImageData(0, 0, target.width, target.height).data;
      let remainingAlpha = 0;
      for (let i = 3; i < pixels.length; i += 4) remainingAlpha += pixels[i] / 255;
      return { cells: cells.length, invalidBirths, sourceAlpha: damage.sourceAlpha, remainingAlpha, partialAlphaPixels,
        width: target.width, height: target.height, dpr: source.dpr };
    },
    destroy() { damage.destroy(); target.width = target.height = 1; },
  };
}
