"use client";

import { useEffect, useRef, useState } from "react";
import { ProceduralAscii } from "./procedural-ascii";
import { AsciiWavesRenderer, DEFAULT_SETTINGS, type WavesSettings } from "./original-ascii/renderer";
import styles from "./home-koi-field.module.css";

type Phase = "loading" | "verifying" | "live" | "paused" | "reduced" | "blocked" | "buffering" | "error";
type Playback = { phase: Phase; message: string };

export function VideoDetailControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <label className={styles.detail}>Detail <select aria-label="local video character detail" value={value} onChange={e => onChange(Number(e.target.value))}>
    {![8, 12, 16].includes(value) && <option value={value}>Custom · {value}px</option>}
    <option value={16}>Original</option><option value={12}>Fine</option><option value={8}>Dense</option>
  </select></label>;
}

/** Lifecycle and presentation adapter. Calibrated video mapping with an independent idle-draw gate. */
export function LocalVideoField({ source, onReset, featured = false, settings, paused, resetKey = 0, controls = true, onPausedChange, onSettingsChange }: { source: string; onReset: () => void; featured?: boolean; settings?: WavesSettings; paused?: boolean; resetKey?: number; controls?: boolean; onPausedChange?: (paused: boolean) => void; onSettingsChange?: (settings: WavesSettings) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const renderer = useRef<AsciiWavesRenderer | null>(null);
  const wantsPlayback = useRef(true);
  const onPausedChangeRef = useRef(onPausedChange);
  useEffect(() => { onPausedChangeRef.current = onPausedChange; }, [onPausedChange]);
  const reduced = useRef(false);
  const resume = useRef<() => void>(() => {});
  const [playback, setPlayback] = useState<Playback>({ phase: "loading", message: "Loading local video clip…" });
  const [localDensity, setDensity] = useState(featured ? 8 : 12);
  const density = settings?.cellSize ?? localDensity;
  const input = useRef({ settings, density, paused });
  const refresh = useRef<() => void>(() => {});
  const pausePlayback = useRef<() => void>(() => {});
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [renderedSource, setRenderedSource] = useState<string | null>(null);


  useEffect(() => {
    const node = root.current, field = canvas.current, media = video.current;
    if (!node || !field || !media) return;
    let active = true, lastCheck = 0, lastTime = 0, lastFrames = 0, lastUploads = 0;
    let lastProgress = performance.now();
    let previous: Uint8ClampedArray | null = null;
    let instance: AsciiWavesRenderer | null = null;
    let failed = false, receivedFrame = false;
    node.dataset.codec = featured ? "H.264 / avc1" : "Local browser file";
    let inView = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = motion.matches;
    const sample = document.createElement("canvas");
    sample.width = 96; sample.height = 54;
    const pixels = sample.getContext("2d", { willReadFrequently: true });
    const report = (phase: Phase, message: string) => {
      if (active) setPlayback(current => current.phase === phase && current.message === message ? current : { phase, message });
    };
    const fail = (message: string) => {
      failed = true; media.pause();
      instance?.setFrozenTime(instance.getWaveClock()); instance?.setSuspended(true);
      report("error", message);
    };
    const syncSettings = () => {
      const width = field.getBoundingClientRect().width;
      // Maintain silhouette detail on a small stage without cropping the source.
      const current = input.current.settings ?? { ...DEFAULT_SETTINGS, cellSize: input.current.density };
      const cellSize = width < 700 ? Math.max(4, current.cellSize * width / 960) : current.cellSize;
      instance?.setSettings({ ...current, cellSize, cursorInteraction: current.cursorInteraction && wantsPlayback.current && !reduced.current });
      field.dataset.settings = JSON.stringify(instance?.snapshot().settings);
      instance?.resize();
      // Resizing clears the drawing buffer. Refresh a visible still frame once.
      if (!failed && inView && !document.hidden && (reduced.current || !wantsPlayback.current)) instance?.redraw();
    };
    const hold = () => {
      media.pause(); instance?.setPointerActive(false);
      instance?.setFrozenTime(instance.getWaveClock()); instance?.setSuspended(true);
    };
    const play = () => {
      if (failed || !active || !inView || document.hidden) return;
      lastProgress = performance.now(); instance?.setFrozenTime(null); instance?.setSuspended(false);
      report("verifying", "Checking video, rendered frames and visible motion…");
      void media.play().then(() => {
        if (!active || !inView || document.hidden || !wantsPlayback.current || reduced.current) hold();
      }).catch((error: unknown) => {
        instance?.setFrozenTime(instance.getWaveClock()); instance?.setSuspended(true);
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          report("blocked", "Your browser needs a click to start this muted video.");
        } else if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          fail(`local video playback failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    };
    resume.current = () => {
      wantsPlayback.current = true;
      onPausedChangeRef.current?.(false);
      // Preserve the existing explicit Play opt-in. Shared prop updates never opt in.
      reduced.current = false;
      syncSettings(); play();
    };
    const ready = () => {
      lastCheck = 0;
      instance?.markVideoDirty();
      if (reduced.current || !wantsPlayback.current || document.hidden) {
        hold();
        if (inView && !document.hidden) instance?.redraw();
        report(reduced.current ? "reduced" : "paused", reduced.current ? "Reduced motion · still ASCII frame of local video" : "Playback paused");
      } else play();
    };
    const loop = () => {
      if (!failed && wantsPlayback.current && !reduced.current && !document.hidden && inView) {
        instance?.markVideoDirty();
        media.currentTime = 0;
        play();
      }
    };
    const metadata = () => {
      node.dataset.duration = String(media.duration);
      node.dataset.videoResolution = `${media.videoWidth}×${media.videoHeight}`;
      media.currentTime = 0;
    };
    const mediaError = () => {
      const reasons: Record<number, string> = { 1: "Playback was interrupted", 2: "This file could not be read", 3: "Your browser could not decode this file", 4: "This video format is not supported in your browser" };
      node.dataset.mediaError = String(media.error?.code ?? "unknown");
      fail((reasons[media.error?.code ?? 0] ?? "This video could not be played") + ". Choose another file or use procedural animation.");
    };
    const contextLost = (event: Event) => { event.preventDefault(); fail("WebGL2 context lost. Retry to create a fresh renderer."); };
    const contextRestored = () => {
      if (active) { setRenderedSource(null); setPlayback({ phase: "loading", message: "Restoring video rendering…" }); setAttempt(n => n + 1); }
    };
    const mediaPause = () => { instance?.setFrozenTime(instance.getWaveClock()); instance?.setSuspended(true); };
    const mediaPlay = () => {
      if (reduced.current || !wantsPlayback.current || document.hidden || !inView) hold();
      else { instance?.setFrozenTime(null); instance?.setSuspended(false); }
    };
    const visibility = () => {
      if (document.hidden || !inView) { hold(); if (!failed) report("paused", "Playback paused while the preview is out of view"); }
      else if (!failed) ready();
    };
    const motionChange = () => { reduced.current = motion.matches; syncSettings(); ready(); };
    const monitor = (now: number) => {
      if (!active || !instance) return;
      if ((lastCheck !== 0 && now - lastCheck < 700) || failed) return;
      lastCheck = now;
      const snapshot = instance.snapshot(), metrics = instance.getMetrics();
      let difference = 0, energy = 0;
      if (pixels && media.readyState >= 2) {
        // Runs after the renderer's RAF, before its non-preserved WebGL buffer is discarded.
        pixels.drawImage(field, 0, 0, sample.width, sample.height);
        const current = pixels.getImageData(0, 0, sample.width, sample.height).data;
        for (let i = 0; i < current.length; i += 4) {
          energy += current[i] + current[i + 1] + current[i + 2];
          if (previous) difference += Math.abs(current[i] - previous[i]) + Math.abs(current[i + 1] - previous[i + 1]) + Math.abs(current[i + 2] - previous[i + 2]);
        }
        difference /= sample.width * sample.height * 3;
        energy /= sample.width * sample.height * 3;
        previous = new Uint8ClampedArray(current);
        if (!receivedFrame && metrics.videoUploads > 0 && energy > 0.3) {
          receivedFrame = true;
          setRenderedSource(source);
        }
      }
      Object.assign(node.dataset, {
        time: snapshot.waveClock.toFixed(3), frame: String(snapshot.frameCount), currentTime: media.currentTime.toFixed(4), frameCount: String(snapshot.frameCount),
        videoUploads: String(metrics.videoUploads), outputDifference: difference.toFixed(4),
        outputEnergy: energy.toFixed(4), webgl: "webgl2", cellSize: String(snapshot.cellSize),
        canvasSize: `${field.width}×${field.height}`, source: media.currentSrc || source, fps: String(metrics.fps), sampledAt: now.toFixed(1),
      });
      const timeMoved = Math.abs(media.currentTime - lastTime) > 0.04;
      const fresh = snapshot.frameCount > lastFrames && metrics.videoUploads > lastUploads;
      if (timeMoved && fresh && difference > 0.12 && energy > 0.3 && !media.paused && !document.hidden && inView) {
        lastProgress = now;
        report("live", "local video · video, ASCII frames and visible motion verified");
      } else if (!media.paused && !document.hidden && inView && now - lastProgress > 2600) {
        report("buffering", "Waiting for fresh local video frames. Playback has stalled.");
      } else if (media.paused && !document.hidden && inView && !reduced.current && wantsPlayback.current && !failed) {
        report("blocked", "Playback stopped. Start local video to continue.");
      }
      lastTime = media.currentTime; lastFrames = snapshot.frameCount; lastUploads = metrics.videoUploads;
    };
    refresh.current = () => {
      if (input.current.paused !== undefined) wantsPlayback.current = !input.current.paused;
      syncSettings();
      if (!failed) ready();
    };
    pausePlayback.current = () => {
      wantsPlayback.current = false; onPausedChangeRef.current?.(true); hold(); syncSettings();
      report("paused", "local video and its wave field are paused");
    };
    field.addEventListener("webglcontextlost", contextLost);
    field.addEventListener("webglcontextrestored", contextRestored);
    media.addEventListener("pause", mediaPause);
    media.addEventListener("play", mediaPlay);
    media.crossOrigin = "anonymous";
    media.addEventListener("loadedmetadata", metadata);
    media.addEventListener("loadeddata", ready);
    media.addEventListener("seeked", ready);
    media.addEventListener("error", mediaError);
    media.addEventListener("ended", loop);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", motionChange);
    const resize = new ResizeObserver(syncSettings);
    const intersection = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting && entry.intersectionRatio >= 0.2; visibility(); }, { threshold: [0, 0.2] });
    intersection.observe(node);
    try {
      // Read the non-preserved buffer immediately after a draw, including wake-up.
      instance = new AsciiWavesRenderer(field, monitor); renderer.current = instance;
      instance.setSuspended(true);
      if (input.current.paused !== undefined) wantsPlayback.current = !input.current.paused;
      syncSettings(); instance.setVideo(media, true);
      if (reduced.current) instance.setFrozenTime(0);
      resize.observe(field);
      // Muted and inline properties must be set before assigning the local source.
      media.muted = true; media.defaultMuted = true; media.playsInline = true;
      media.loop = true;
      media.src = source; media.load();
    } catch (error) {
      fail(`local video renderer initialization: ${error instanceof Error ? error.message : String(error)}`);
    }
    return () => {
      active = false; resize.disconnect(); intersection.disconnect();
      field.removeEventListener("webglcontextlost", contextLost);
      field.removeEventListener("webglcontextrestored", contextRestored);
      media.removeEventListener("pause", mediaPause);
      media.removeEventListener("play", mediaPlay);
      media.removeEventListener("loadedmetadata", metadata);
      media.removeEventListener("loadeddata", ready);
      media.removeEventListener("seeked", ready);
      media.removeEventListener("error", mediaError);
      media.removeEventListener("ended", loop);
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", motionChange);
      media.pause(); media.removeAttribute("src"); media.load(); instance?.dispose();
      // StrictMode reuses the connected canvas; only detached canvases lose their context.
      queueMicrotask(() => { if (!field.isConnected) field.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext(); });
      if (renderer.current === instance) renderer.current = null;
    };
  }, [attempt, source, featured]);

  useEffect(() => {
    // Uniform updates are immediate; glyph/cell changes share one debounced atlas update.
    const previous = input.current;
    const glyphChanged = previous.settings?.characters !== settings?.characters || previous.density !== density;
    input.current = { settings: settings && glyphChanged ? { ...settings, characters: previous.settings?.characters ?? settings.characters, cellSize: previous.density } : settings, density: glyphChanged ? previous.density : density, paused };
    refresh.current();
    if (!glyphChanged) return;
    const timer = setTimeout(() => { input.current = { settings, density, paused }; refresh.current(); }, 100);
    return () => clearTimeout(timer);
  }, [settings, density, paused]);

  useEffect(() => {
    if (!resetKey) return;
    const instance = renderer.current, media = video.current;
    instance?.setFrozenTime(0);
    if (media?.readyState) media.currentTime = 0;
    refresh.current();
  }, [resetKey]);

  const phase = playback.phase;
  const pause = () => pausePlayback.current();
  return <div ref={root} className={styles.shell} data-koi-field data-ascii-field data-source-id={featured ? "featured-loop30-807bb27e" : "local-browser-file"} data-detail={density === 12 ? "fine" : density === 16 ? "original" : "dense"} data-phase={phase}>
    <div className={styles.top}><span><i /> FIELD STUDY / 001</span><span>{featured ? "featured fish" : "local video"} · {density === 12 ? "FINE" : density === 16 ? "ORIGINAL" : "DENSE"} ASCII</span><span className={styles.signal} data-phase={phase} role="status">{phase === "live" ? "● LIVE" : phase.toUpperCase()}</span></div>
    <div className={styles.stage}>
      <canvas key={attempt} ref={canvas} aria-label={`Source video rendered with ${density === 8 ? "dense" : density === 12 ? "fine" : "original"} colored ASCII characters`} data-testid="koi-home-field"
        onPointerMove={event => { if (phase !== "live" || event.pointerType === "touch") return; const box = event.currentTarget.getBoundingClientRect(); renderer.current?.setPointer((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height); }}
        onPointerLeave={() => { if (phase === "live") renderer.current?.setPointerActive(false); }} />
      <video ref={video} muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} className={styles.video} />
      {(renderedSource !== source || phase === "loading" || phase === "error" || phase === "blocked") && <div className={styles.fallback}>
        <div className={styles.loadingField} aria-hidden="true"><ProceduralAscii compact paused /></div>
        <div className={styles.notice}><strong>{phase === "error" ? "Video unavailable" : phase === "blocked" ? "Ready when you are." : "Preparing the character field"}</strong><p>{playback.message}</p>
          {phase === "blocked" && <button type="button" onClick={() => resume.current()}>Start local video ↗</button>}
          {phase === "error" && <button type="button" onClick={() => { setRenderedSource(null); setPlayback({ phase: "loading", message: "Retrying your local file…" }); setAttempt(n => n + 1); }}>Retry local video ↻</button>}
        </div>
      </div>}
    </div>
    <div className={styles.bottom}>
      <div className={styles.source}><strong>{featured ? "FEATURED FISH" : "LOCAL VIDEO"}</strong><span>{featured ? "VERIFIED SOURCE / WEBGL2" : "BROWSER LOCAL / WEBGL2"}</span></div>
      {controls && (!settings || onSettingsChange) && <VideoDetailControl value={density} onChange={cellSize => settings ? onSettingsChange?.({ ...settings, cellSize }) : setDensity(cellSize)} />}
      {controls && phase !== "error" && <button className={styles.play} type="button" aria-label={phase === "paused" || phase === "reduced" || phase === "blocked" ? "Play local video" : "Pause local video"} onClick={phase === "paused" || phase === "reduced" || phase === "blocked" ? () => resume.current() : pause}>{phase === "paused" || phase === "reduced" || phase === "blocked" ? "Play local video ↗" : "Pause local video Ⅱ"}</button>}
      <button type="button" className={styles.expand} onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>Source notes {expanded ? "−" : "+"}</button>
    </div>
    <div className={styles.filePicker}><button type="button" onClick={onReset}>Use procedural animation</button><span>{featured ? "Featured media is served from this site." : "Your file stays in this browser. No upload."}</span></div>
    {phase === "reduced" && <p className={styles.reduced}>Reduced motion is on. Showing a still ASCII frame; Play local video opts into animation.</p>}
    {phase === "buffering" && <p className={styles.reduced} role="status">{playback.message}</p>}
    {expanded && <div className={styles.receipt}><p>The video uses the calibrated glyph mapping. The homepage starts at Dense (8px desktop cells); Fine uses 12px and Original uses 16px. Mobile density scales with the stage. The original mapping is available with ?asciiRamp=original.</p><p>{playback.message}</p><span>{featured ? "Featured media is served from this site." : "Your file stays in this browser. No upload."}</span><span>Rendering uses the source colors. Purple belongs to the interface.</span></div>}
  </div>;
}
