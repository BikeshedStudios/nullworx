"use client";

import { useEffect, useRef, useState } from "react";
import { usePreviewActivity } from "./use-preview-activity";
import { PROCEDURAL_DEFAULTS, type ProceduralSettings } from "./procedural-settings";
import styles from "./procedural-ascii.module.css";

/** Original mathematical wave field. Zero cell size retains its responsive default. */
export function ProceduralAscii({ compact = false, paused = false, settings = PROCEDURAL_DEFAULTS, controls = true, resetKey = 0, onPausedChange }: { compact?: boolean; paused?: boolean; settings?: ProceduralSettings; controls?: boolean; resetKey?: number; onPausedChange?: (paused: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -1, y: -1 });
  const time = useRef(0);
  const [held, setHeld] = useState(false);
  const { visible, reduced } = usePreviewActivity(host);
  const playing = visible && !reduced && !held && !paused;
  useEffect(() => { time.current = 0; pointer.current = { x: -1, y: -1 }; }, [resetKey]);
  useEffect(() => {
    const node = host.current, field = canvas.current;
    const ctx = field?.getContext("2d");
    if (!node || !field || !ctx) return;
    let raf = 0, previous = 0, frames = 0, active = true;
    const drawable = () => active && visible && !document.hidden && node.isConnected;
    const draw = () => {
      if (!drawable()) return;
      const width = node.clientWidth, height = node.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      if (field.width !== Math.round(width * dpr) || field.height !== Math.round(height * dpr)) {
        field.width = Math.round(width * dpr); field.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#18151f"; ctx.fillRect(0, 0, width, height);
      const cell = settings.cellSize || (compact ? 10 : Math.max(9, Math.min(14, width / 75)));
      const row = cell * 1.45, glyphs = Array.from(settings.characters);
      ctx.font = cell + 'px "Space Mono", monospace';
      ctx.textBaseline = "middle"; ctx.textAlign = "center";
      for (let y = row / 2; y < height; y += row) for (let x = cell / 2; x < width; x += cell) {
        const nx = x / width, ny = y / height;
        const distance = Math.hypot(nx - pointer.current.x, ny - pointer.current.y);
        const ripple = pointer.current.x < 0 || reduced || !settings.cursorInteraction ? 0 : Math.sin(distance * 30 - time.current * 3) * Math.max(0, 1 - distance * 2) * settings.interactionIntensity;
        const wave = Math.sin(nx * 12 + time.current) * Math.cos(ny * 9 - time.current * .7)
          + Math.sin((nx + ny) * 14 - time.current * 1.2) * .45 + ripple * .7;
        const value = Math.max(0, Math.min(.999, (wave + 2) / 4));
        ctx.fillStyle = settings.color === "spectrum" ? 'hsl(' + (175 + value * 100) + ' 48% ' + (32 + value * 48) + '%)' : settings.color;
        ctx.fillText(glyphs[Math.min(glyphs.length - 1, Math.floor((settings.invert ? 1 - value : value) * glyphs.length))], x, y);
      }
      node.dataset.frame = String(++frames);
      node.dataset.time = time.current.toFixed(3);
    };
    const tick = (now: number) => {
      if (!drawable() || !playing) return;
      if (now - previous >= 50) { // At most 20fps, with a bounded clock on resume.
        time.current += previous ? Math.min(now - previous, 100) / 1000 * settings.speed : 0;
        previous = now; draw();
      }
      raf = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(draw);
    resize.observe(node); draw();
    if (playing) raf = requestAnimationFrame(tick);
    return () => { active = false; cancelAnimationFrame(raf); resize.disconnect(); };
  }, [visible, playing, compact, reduced, settings, resetKey]);
  return <div className={styles.field} ref={host} data-procedural-ascii data-playing={playing} data-reduced={reduced} data-settings={JSON.stringify(settings)}>
    <canvas ref={canvas} role="img" aria-label="Procedural ASCII waves in violet and teal"
      onPointerMove={event => {
        if (!playing || !settings.cursorInteraction || event.pointerType === "touch") return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
      }} onPointerLeave={() => { pointer.current = { x: -1, y: -1 }; }} />
    {!compact && controls && <div className={styles.toolbar}><span>PROCEDURAL ASCII · ORIGINAL CODE</span>
      <button type="button" disabled={reduced} aria-pressed={onPausedChange ? paused : held} onClick={() => onPausedChange ? onPausedChange(!paused) : setHeld(value => !value)}>
        {reduced ? "Reduced motion · still frame" : (onPausedChange ? paused : held) ? "Play animation" : "Pause animation"}
      </button></div>}
  </div>;
}
