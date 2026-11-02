import type { MaterialSource, Raster } from "./types";

export function canvas2d(width: number, height: number, dpr = 1): Raster {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  return { canvas, width, height, dpr };
}

export function context(raster: Raster) {
  const ctx = raster.canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas2D unavailable. Original content is preserved.");
  ctx.setTransform(raster.dpr, 0, 0, raster.dpr, 0, 0);
  return ctx;
}

/** Only the explicitly authored single-shadow, left-to-right line contract. */
export async function rasterSource(host: HTMLElement, source: MaterialSource): Promise<Raster> {
  await document.fonts.ready;
  const rect = host.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.75, 1800 / rect.width);
  const raster = canvas2d(rect.width, rect.height, dpr);
  const ctx = context(raster);
  if (source.kind === "text") {
    const lines = host.querySelectorAll<HTMLElement>("[data-material-line]");
    for (const line of lines) {
      const style = getComputedStyle(line);
      const box = line.getBoundingClientRect();
      const baseline = line.querySelector<HTMLElement>("[data-baseline]")!.getBoundingClientRect().top;
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
      ctx.fillStyle = style.color;
      // A single RGB(A) shadow is intentionally supported, never silently dropped.
      const shadow = style.textShadow.match(/^(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px$/);
      if (style.textShadow !== "none" && !shadow) throw new Error("Unsupported text shadow; showing original text.");
      ctx.shadowColor = shadow?.[1] ?? "transparent";
      ctx.shadowOffsetX = Number(shadow?.[2] ?? 0) * dpr;
      ctx.shadowOffsetY = Number(shadow?.[3] ?? 0) * dpr;
      ctx.shadowBlur = Number(shadow?.[4] ?? 0) * dpr;
      ctx.fillText(line.dataset.text!, box.left - rect.left, baseline - rect.top);
    }
  } else if (source.kind === "section") {
    ctx.fillStyle = source.color;
    ctx.fillRect(0, 0, rect.width, rect.height * 0.72);
    // Authored micrograin is in the source, so chips retain the section's material.
    ctx.fillStyle = "rgba(255,255,255,.035)";
    for (let y = 0; y < rect.height * 0.72; y += 6) ctx.fillRect(0, y, rect.width, 0.6);
  } else {
    if (!source.src.startsWith("/material-wave-a/") || !/\.(png|jpe?g|webp)$/.test(source.src)) {
      throw new Error("This proof accepts local material-wave-a PNG/JPEG/WebP sources only.");
    }
    const image = new Image();
    image.src = source.src;
    await image.decode();
    const scale = Math.max(rect.width / image.width, rect.height / image.height);
    ctx.drawImage(image, (rect.width - image.width * scale) / 2, (rect.height - image.height * scale) / 2, image.width * scale, image.height * scale);
  }
  return raster;
}
