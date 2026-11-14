import type { Engine, SceneMetrics, SceneState } from "./types";

/** One demand clock. Paused edits draw once; hidden/disconnected hosts never draw. */
export function runScene(host: HTMLElement, engine: Engine, state: { current: SceneState },
  ready: () => void, failure: (error: unknown) => void, started: number) {
  let raf = 0, timer = 0, disposed = false, visible = false, dirty = true;
  let previous = 0, time = 2.4, sample = 0, count = 0;
  let lastWidth = 0, lastHeight = 0;
  const metrics: SceneMetrics = { frames: 0, running: false, time, fps: 0, startupMs: 0, compileMs: engine.compileMs ?? null,
    intervals: [], cpuMs: [], backend: engine.backend };
  const debugHost = host as HTMLElement & { frontier?: SceneMetrics & { memory?: ReturnType<NonNullable<Engine["info"]>> } };
  debugHost.frontier = metrics;
  const canDraw = () => !disposed && visible && !document.hidden && host.isConnected;
  const schedule = () => { if (!raf && canDraw()) raf = requestAnimationFrame(tick); };
  const invalidate = () => { dirty = true; schedule(); };
  const resize = () => {
    if (!canDraw()) return;
    const { width, height } = host.getBoundingClientRect();
    if (width > 0 && height > 0 && (width !== lastWidth || height !== lastHeight)) {
      lastWidth = width; lastHeight = height; engine.resize(width, height); dirty = true;
    }
  };
  function tick(now: number) {
    raf = 0;
    if (!canDraw()) { previous = 0; metrics.running = false; return; }
    const running = !state.current.paused;
    if (running && previous) time += Math.min((now - previous) / 1000, .08);
    if (dirty || running) {
      const begin = performance.now();
      try { engine.draw(time, state.current); }
      catch (error) { failure(error); void dispose(); return; }
      metrics.cpuMs.push(performance.now() - begin);
      if (running && previous) metrics.intervals.push(now - previous);
      if (metrics.cpuMs.length > 600) metrics.cpuMs.shift();
      if (metrics.intervals.length > 600) metrics.intervals.shift();
      metrics.frames++; metrics.time = time; count++;
      if (metrics.frames === 1) { metrics.startupMs = performance.now() - started; ready(); }
      if (now - sample > 1000) { metrics.fps = count * 1000 / Math.max(1, now - sample); sample = now; count = 0; debugHost.frontier!.memory = engine.info?.(); }
      dirty = false;
    }
    metrics.running = running; host.dataset.running = String(running);
    host.dataset.frames = String(metrics.frames);
    previous = running ? now : 0;
    if (running) schedule();
  }
  const observer = new ResizeObserver(() => {
    window.clearTimeout(timer); timer = window.setTimeout(() => { resize(); invalidate(); }, 100);
  });
  observer.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting; previous = 0;
    if (visible) { resize(); invalidate(); }
    else { cancelAnimationFrame(raf); raf = 0; metrics.running = false; host.dataset.running = "false"; }
  });
  intersection.observe(host);
  const visibility = () => {
    previous = 0;
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; metrics.running = false; host.dataset.running = "false"; }
    else { resize(); invalidate(); }
  };
  document.addEventListener("visibilitychange", visibility);
  const pointer = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (rect.width && rect.height) state.current.pointer = [
      Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
      Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2)),
    ];
    invalidate();
  };
  const down = (event: PointerEvent) => { host.setPointerCapture(event.pointerId); pointer(event); };
  const key = (event: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault(); const p = state.current.pointer;
    state.current.pointer = [Math.max(-1, Math.min(1, p[0] + (event.key === "ArrowRight" ? .2 : event.key === "ArrowLeft" ? -.2 : 0))),
      Math.max(-1, Math.min(1, p[1] + (event.key === "ArrowUp" ? .2 : event.key === "ArrowDown" ? -.2 : 0)))];
    invalidate();
  };
  const lost = (event: Event) => {
    if (disposed) return;
    event.preventDefault(); failure(new Error("WebGL context lost. The live lightweight preview is available; retry to recreate the full effect.")); void dispose();
  };
  host.addEventListener("pointermove", pointer); host.addEventListener("pointerdown", down);
  host.addEventListener("keydown", key); host.addEventListener("webglcontextlost", lost, true);
  let disposal: Promise<void> | undefined;
  function dispose(): Promise<void> {
    if (disposal) return disposal;
    disposed = true; cancelAnimationFrame(raf); window.clearTimeout(timer);
    observer.disconnect(); intersection.disconnect(); document.removeEventListener("visibilitychange", visibility);
    host.removeEventListener("pointermove", pointer); host.removeEventListener("pointerdown", down);
    host.removeEventListener("keydown", key); host.removeEventListener("webglcontextlost", lost, true);
    metrics.running = false; host.dataset.running = "false";
    disposal = Promise.resolve(engine.dispose()); return disposal;
  }
  return { invalidate, dispose, reset() { time = 2.4; previous = 0; state.current.pointer = [0, 0]; invalidate(); } };
}
