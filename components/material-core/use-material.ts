"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";
import { rasterSource } from "./source-raster";
import { TriggerClock } from "./trigger-clock";
import { ACTIVE_MS, clamp, WINDUP_MS, type Comparison, type FrameReceipt, type MaterialKind, type MaterialOptions, type MaterialRenderer, type MaterialSource } from "./types";

export type MaterialStatus = { phase: string; elapsedMs: number; paused: boolean; reason: string; coverage: number; particles: number };
export type MaterialDebug = {
  play: () => void; pause: () => void; reset: () => void; seek: (ms: number) => void;
  snapshot: () => MaterialStatus & { runId: number; frames: number[]; drawMs: number[]; strata: number[]; removedCells: number;
    renderer: ReturnType<MaterialRenderer["inspect"]> | null; resources: { mounted: number; renderers: number; raf: number } };
};
declare global {
  interface Window {
    __materialWaveA?: MaterialDebug;
    __materialResources?: { mounted: number; renderers: number; raf: number };
  }
}

export function useMaterial(hostRef: RefObject<HTMLDivElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>,
  controllerRef: RefObject<MaterialDebug | null>, kind: MaterialKind, source: MaterialSource, mode: Comparison,
  options: MaterialOptions, onStatus: (status: MaterialStatus) => void) {
  const notify = useEffectEvent(onStatus);
  useEffect(() => {
    const host = hostRef.current!, canvas = canvasRef.current!;
    const lane = host.closest<HTMLElement>("[data-scroll-lane]")!;
    const clock = new TriggerClock();
    const resources = window.__materialResources ??= { mounted: 0, renderers: 0, raf: 0 };
    resources.mounted++;
    let disposed = false, renderer: MaterialRenderer | null = null, request = 0, generation = 0;
    let previous = 0, visible = true, ready = false, reason = "Preparing source…", reduced = false;
    let receipt: FrameReceipt = { sourceCoverage: 1, removedCells: 0, particles: 0, strata: [0, 0, 0] };
    let frames: number[] = [], drawMs: number[] = [], lastNotify = 0;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const status = (): MaterialStatus => ({ phase: reason && !reduced ? "FALLBACK" : clock.phase,
      elapsedMs: clock.elapsedMs, paused: clock.paused, reason, coverage: receipt.sourceCoverage, particles: receipt.particles });
    function report() {
      host.dataset.phase = status().phase;
      host.dataset.elapsed = String(clock.elapsedMs);
      host.dataset.run = String(clock.runId);
      host.dataset.coverage = String(receipt.sourceCoverage);
      notify(status());
    }
    function cancel() {
      if (request) { cancelAnimationFrame(request); request = 0; resources.raf--; }
      previous = 0;
    }
    function destroyRenderer() {
      if (renderer) { renderer.destroy(); renderer = null; resources.renderers--; }
    }
    function draw() {
      if (!ready) return;
      const start = performance.now();
      const ms = reduced ? 0 : clock.elapsedMs;
      if (renderer) receipt = renderer.draw(ms);
      const p = clamp((ms - WINDUP_MS) / ACTIVE_MS);
      canvas.style.opacity = mode === "css" && kind === "ashfall" ? String(1 - p) : "1";
      canvas.style.clipPath = mode === "css" && kind === "seam" ? `inset(0 0 ${p * 28}% 0)` : "none";
      canvas.style.maskImage = mode === "css" && kind === "sediment"
        ? `repeating-conic-gradient(#000 0deg ${(1 - p) * 360}deg, transparent ${(1 - p) * 360}deg 360deg)` : "none";
      canvas.style.maskSize = "7px 7px";
      const revealLink = host.querySelector<HTMLAnchorElement>("[data-reveal-link]");
      if (revealLink) {
        const exposed = mode === "candidate" ? receipt.sourceCoverage < 0.03 : mode === "css" && p > 0.98;
        revealLink.tabIndex = exposed ? 0 : -1;
        revealLink.style.pointerEvents = exposed ? "auto" : "none";
      }
      if (drawMs.length < 1000 && clock.running && mode === "candidate") drawMs.push(performance.now() - start);
      host.dataset.coverage = String(receipt.sourceCoverage);
      host.dataset.elapsed = String(ms);
    }
    function canRun() { return ready && !reduced && !document.hidden && visible && !clock.paused && clock.running; }
    function schedule() {
      if (!disposed && !request && canRun()) { request = requestAnimationFrame(tick); resources.raf++; }
    }
    function tick(now: number) {
      request = 0; resources.raf--;
      if (!canRun()) { previous = 0; return; }
      const delta = previous ? now - previous : 0;
      if (previous && frames.length < 1000) frames.push(delta);
      previous = now;
      clock.tick(delta);
      draw();
      if (now - lastNotify > 100 || !clock.running) { report(); lastNotify = now; }
      if (!clock.running) previous = 0;
      schedule();
    }
    function fail(error: unknown) {
      if (disposed) return;
      reason = error instanceof Error ? error.message : "Source could not be rendered.";
      ready = false; host.dataset.ready = "false";
      cancel(); destroyRenderer(); report();
    }
    async function build() {
      const token = ++generation;
      cancel();
      let raster: Awaited<ReturnType<typeof rasterSource>> | null = null;
      try {
        raster = await rasterSource(host, source);
        if (disposed || token !== generation) { raster.canvas.width = raster.canvas.height = 1; return; }
        destroyRenderer();
        if (mode === "candidate") {
          const make = kind === "ashfall" ? (await import("../material-effects/ashfall-type")).ashfallType
            : kind === "seam" ? (await import("../material-effects/seam-erosion")).seamErosion
              : (await import("../material-effects/sediment-reveal")).sedimentReveal;
          if (disposed || token !== generation) { raster.canvas.width = raster.canvas.height = 1; return; }
          renderer = make(canvas, raster, options); resources.renderers++;
        } else {
          canvas.width = raster.canvas.width; canvas.height = raster.canvas.height;
          canvas.getContext("2d")!.drawImage(raster.canvas, 0, 0);
          raster.canvas.width = raster.canvas.height = 1;
        }
        ready = true; reason = reduced ? "Reduced motion · original remains readable" : "";
        host.dataset.ready = "true";
        draw(); report(); schedule();
      } catch (error) { if (token === generation) fail(error); }
    }
    function scroll() {
      if (!ready || reduced || mode === "original") return;
      const rect = lane.getBoundingClientRect();
      const progress = clamp((innerHeight * 0.28 - rect.top) / Math.max(1, rect.height - innerHeight));
      if (clock.scroll(progress)) { frames = []; drawMs = []; }
      draw(); report(); schedule();
    }
    function visibility() { cancel(); schedule(); }
    function preference() {
      reduced = media.matches;
      if (reduced) { clock.reset(); cancel(); }
      reason = reduced ? "Reduced motion · original remains readable" : "";
      draw(); report();
    }
    const api: MaterialDebug = {
      play() {
        if (!ready || reduced || mode === "original") return;
        if (clock.paused && clock.running) clock.paused = false;
        else if (clock.trigger()) { frames = []; drawMs = []; }
        report(); schedule();
      },
      pause() { clock.paused = !clock.paused; cancel(); report(); schedule(); },
      reset() { clock.reset(); frames = []; drawMs = []; cancel(); draw(); report(); },
      seek(ms) { if (!ready || reduced || mode === "original") return; clock.seek(ms); cancel(); draw(); report(); },
      snapshot: () => ({ ...status(), runId: clock.runId, frames: [...frames], drawMs: [...drawMs], strata: receipt.strata,
        removedCells: receipt.removedCells, renderer: renderer?.inspect() ?? null, resources: { ...resources } }),
    };
    controllerRef.current = api;
    window.__materialWaveA = api; // Deliberately confined to this unregistered lab route.
    reduced = media.matches;
    const resize = new ResizeObserver(() => { void build(); });
    resize.observe(host);
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      cancel(); schedule();
    }, { threshold: 0 });
    intersection.observe(host);
    let resolution = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    function dprChange() {
      resolution.removeEventListener("change", dprChange);
      resolution = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
      resolution.addEventListener("change", dprChange);
      void build();
    }
    resolution.addEventListener("change", dprChange);
    // Some browser/monitor/CDP changes update DPR without either browser event.
    // A bounded idle check avoids a perpetual render loop and is cleared on unmount.
    let observedDpr = devicePixelRatio;
    const dprWatch = window.setInterval(() => {
      if (devicePixelRatio !== observedDpr) { observedDpr = devicePixelRatio; dprChange(); }
    }, 400);
    const lost = (event: Event) => { event.preventDefault(); fail(new Error("Canvas context lost · showing original")); };
    canvas.addEventListener("contextlost", lost);
    canvas.addEventListener("contextrestored", build);
    document.addEventListener("visibilitychange", visibility);
    document.fonts.addEventListener("loadingdone", build);
    window.addEventListener("scroll", scroll, { passive: true });
    media.addEventListener("change", preference);
    return () => {
      disposed = true; generation++; cancel(); destroyRenderer();
      canvas.width = canvas.height = 1;
      resize.disconnect(); intersection.disconnect();
      window.clearInterval(dprWatch);
      resolution.removeEventListener("change", dprChange);
      canvas.removeEventListener("contextlost", lost);
      canvas.removeEventListener("contextrestored", build);
      document.removeEventListener("visibilitychange", visibility);
      document.fonts.removeEventListener("loadingdone", build);
      window.removeEventListener("scroll", scroll);
      media.removeEventListener("change", preference);
      resources.mounted--;
      if (window.__materialWaveA === api) delete window.__materialWaveA;
      if (controllerRef.current === api) controllerRef.current = null;
    };
  }, [hostRef, canvasRef, controllerRef, kind, source, mode, options]);
}
