"use client";

import { useEffect, useRef, useState } from "react";
import { AsciiWavesRenderer, DEFAULT_SETTINGS } from "./original-ascii/renderer";
import { HOME_VIDEO_SOURCE } from "./video-presets.generated";
import styles from "./home-koi-field.module.css";

type Phase = "loading" | "verifying" | "live" | "paused" | "reduced" | "blocked" | "buffering" | "error";
type Playback = { phase: Phase; message: string };

/** Lifecycle and presentation adapter. The original renderer/atlas/shaders remain byte-identical. */
export function HomeKoiField() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const renderer = useRef<AsciiWavesRenderer | null>(null);
  const wantsPlayback = useRef(true);
  const reduced = useRef(false);
  const resume = useRef<() => void>(() => {});
  const [playback, setPlayback] = useState<Playback>({ phase: "loading", message: "Loading LOOP30 clip…" });
  const [density, setDensity] = useState(12);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [localSource, setLocalSource] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  const chooseVideo = (file: File | undefined) => {
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setPlayback({ phase: "loading", message: `Opening local file: ${file.name}. It stays in this browser.` });
    setLocalSource(objectUrl.current); setAttempt(n => n + 1);
  };

  useEffect(() => {
    const node = root.current, field = canvas.current, media = video.current;
    if (!node || !field || !media) return;
    let active = true, raf = 0, lastCheck = 0, lastTime = 0, lastFrames = 0, lastUploads = 0;
    let lastProgress = performance.now();
    let previous: Uint8ClampedArray | null = null;
    let instance: AsciiWavesRenderer | null = null;
    let failed = false;
    const source = localSource ?? (!media.canPlayType('video/mp4; codecs="avc1.640028"') && media.canPlayType('video/webm; codecs="vp9"') ? HOME_VIDEO_SOURCE.compatibilitySrc : HOME_VIDEO_SOURCE.src);
    node.dataset.codec = localSource ? "Local browser file" : source === HOME_VIDEO_SOURCE.src ? "H.264 High / yuv420p" : "VP9 lossless / yuv420p";
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
      instance?.setFrozenTime(instance.getWaveClock());
      report("error", message);
    };
    const syncSettings = () => {
      const width = field.getBoundingClientRect().width;
      // Maintain silhouette detail on a small stage without cropping the source.
      const cellSize = width < 700 ? Math.max(4, density * width / 960) : density;
      instance?.setSettings({ ...DEFAULT_SETTINGS, cellSize, cursorInteraction: wantsPlayback.current && !reduced.current });
      instance?.resize();
    };
    const hold = () => {
      media.pause(); instance?.setPointerActive(false);
      instance?.setFrozenTime(instance.getWaveClock());
    };
    const play = () => {
      if (failed) return;
      lastProgress = performance.now(); instance?.setFrozenTime(null);
      report("verifying", "Checking video, rendered frames and visible motion…");
      void media.play().catch((error: unknown) => {
        instance?.setFrozenTime(instance.getWaveClock());
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          report("blocked", "Your browser needs a click to start this muted video.");
        } else if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          fail(`LOOP30 playback failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      });
    };
    resume.current = () => {
      wantsPlayback.current = true; reduced.current = false;
      syncSettings(); play();
    };
    const ready = () => {
      instance?.markVideoDirty();
      if (reduced.current || !wantsPlayback.current || document.hidden) {
        hold();
        report(reduced.current ? "reduced" : "paused", reduced.current ? "Reduced motion · still ASCII frame of LOOP30" : "Playback paused");
      } else play();
    };
    const loop = () => {
      if (!failed && wantsPlayback.current && !reduced.current && !document.hidden) {
        instance?.markVideoDirty();
        media.currentTime = 0;
        play();
      }
    };
    const metadata = () => {
      node.dataset.duration = String(media.duration);
      node.dataset.videoResolution = `${media.videoWidth}×${media.videoHeight}`;
      media.currentTime = HOME_VIDEO_SOURCE.startTime;
    };
    const mediaError = () => {
      const reasons: Record<number, string> = { 1: "request aborted", 2: "network or missing asset", 3: "video decode failed", 4: `source or ${source === HOME_VIDEO_SOURCE.src ? "H.264" : "VP9"} codec unsupported` };
      fail(`LOOP30 ${reasons[media.error?.code ?? 0] ?? "media failure"} (MEDIA_ERR_${media.error?.code ?? "UNKNOWN"}). Source: ${source}`);
    };
    const contextLost = (event: Event) => { event.preventDefault(); fail("WebGL2 context lost. Retry to create a fresh renderer."); };
    const visibility = () => {
      if (document.hidden) { hold(); if (!failed) report("paused", "Playback paused while this tab is hidden"); }
      else if (!failed) ready();
    };
    const motionChange = () => { reduced.current = motion.matches; syncSettings(); ready(); };
    const monitor = (now: number) => {
      if (!active || !instance) return;
      raf = requestAnimationFrame(monitor);
      if (now - lastCheck < 700 || failed) return;
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
      }
      Object.assign(node.dataset, {
        currentTime: media.currentTime.toFixed(4), frameCount: String(snapshot.frameCount),
        videoUploads: String(metrics.videoUploads), outputDifference: difference.toFixed(4),
        outputEnergy: energy.toFixed(4), webgl: "webgl2", cellSize: String(snapshot.cellSize),
        canvasSize: `${field.width}×${field.height}`, source: media.currentSrc || source, fps: String(metrics.fps), sampledAt: now.toFixed(1),
      });
      const timeMoved = Math.abs(media.currentTime - lastTime) > 0.04;
      const fresh = snapshot.frameCount > lastFrames && metrics.videoUploads > lastUploads;
      if (timeMoved && fresh && difference > 0.12 && energy > 0.3 && !media.paused && !document.hidden) {
        lastProgress = now;
        report("live", "LOOP30 · video, ASCII frames and visible motion verified");
      } else if (!media.paused && !document.hidden && now - lastProgress > 2600) {
        report("buffering", "Waiting for fresh LOOP30 frames. Playback has stalled.");
      } else if (media.paused && !document.hidden && !reduced.current && wantsPlayback.current && !failed) {
        report("blocked", "Playback stopped. Start LOOP30 to continue.");
      }
      lastTime = media.currentTime; lastFrames = snapshot.frameCount; lastUploads = metrics.videoUploads;
    };
    field.addEventListener("webglcontextlost", contextLost);
    media.crossOrigin = "anonymous";
    media.addEventListener("loadedmetadata", metadata);
    media.addEventListener("loadeddata", ready);
    media.addEventListener("seeked", ready);
    media.addEventListener("error", mediaError);
    media.addEventListener("ended", loop);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", motionChange);
    const resize = new ResizeObserver(syncSettings);
    try {
      instance = new AsciiWavesRenderer(field); renderer.current = instance;
      syncSettings(); instance.setVideo(media, true);
      if (reduced.current) instance.setFrozenTime(0);
      resize.observe(field); raf = requestAnimationFrame(monitor);
      // Linux WebKit's native VP9 loop can stall at EOS; explicit ended/seek/play keeps the same clip moving.
      media.loop = source === HOME_VIDEO_SOURCE.src;
      media.src = source; media.load();
    } catch (error) {
      fail(`LOOP30 renderer initialization: ${error instanceof Error ? error.message : String(error)}`);
    }
    return () => {
      active = false; cancelAnimationFrame(raf); resize.disconnect();
      field.removeEventListener("webglcontextlost", contextLost);
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
  }, [density, attempt, localSource]);

  const phase = playback.phase;
  const pause = () => {
    wantsPlayback.current = false; video.current?.pause();
    const current = renderer.current;
    current?.setPointerActive(false);
    current?.setSettings({ ...current.snapshot().settings, cursorInteraction: false, interactionIntensity: 0 });
    current?.setFrozenTime(current.getWaveClock());
    setPlayback({ phase: "paused", message: "LOOP30 and its wave field are paused" });
  };
  return <div ref={root} className={styles.shell} data-koi-field data-ascii-field data-source-id={localSource ? "local-browser-file" : "loop30-v2"} data-detail={density === 12 ? "fine" : density === 16 ? "original" : "dense"} data-phase={phase}>
    <div className={styles.top}><span><i /> FIELD STUDY / 001</span><span>LOOP30 · {density === 12 ? "FINE" : density === 16 ? "ORIGINAL" : "DENSE"} ASCII</span><span className={styles.signal} data-phase={phase} role="status">{phase === "live" ? "● LIVE" : phase.toUpperCase()}</span></div>
    <div className={styles.stage}>
      <canvas key={`${attempt}-${density}`} ref={canvas} aria-label="Source video rendered with fine colored ASCII characters" data-testid="koi-home-field"
        onPointerMove={event => { if (phase !== "live" || event.pointerType === "touch") return; const box = event.currentTarget.getBoundingClientRect(); renderer.current?.setPointer((event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height); }}
        onPointerLeave={() => renderer.current?.setPointerActive(false)} />
      <video ref={video} muted loop playsInline preload="auto" aria-hidden="true" tabIndex={-1} className={styles.video} />
      {(phase === "loading" || phase === "error" || phase === "blocked") && <div className={styles.fallback}>
        <div className={styles.notice}><strong>{phase === "error" ? "Video unavailable" : phase === "blocked" ? "Ready when you are." : "Preparing the character field"}</strong><p>{playback.message}</p>
          {phase === "blocked" && <button type="button" onClick={() => resume.current()}>Start LOOP30 ↗</button>}
          {phase === "error" && <button type="button" onClick={() => { setPlayback({ phase: "loading", message: "Retrying the original source…" }); setAttempt(n => n + 1); }}>Retry LOOP30 ↻</button>}
        </div>
      </div>}
    </div>
    <div className={styles.bottom}>
      <div className={styles.source}><strong>{localSource ? "LOCAL VIDEO" : "LOOP30"}</strong><span>1920 × 1080 / FULL COLOR / WEBGL2</span></div>
      <label className={styles.detail}>Detail <select aria-label="LOOP30 character detail" value={density} onChange={e => { setPlayback({ phase: "loading", message: "Updating the character field…" }); setDensity(Number(e.target.value)); }}><option value={16}>Original</option><option value={12}>Fine</option><option value={8}>Dense</option></select></label>
      {phase !== "error" && <button className={styles.play} type="button" onClick={phase === "paused" || phase === "reduced" || phase === "blocked" ? () => resume.current() : pause}>{phase === "paused" || phase === "reduced" || phase === "blocked" ? "Play LOOP30 ↗" : "Pause LOOP30 Ⅱ"}</button>}
      <button type="button" className={styles.expand} onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>Source notes {expanded ? "−" : "+"}</button>
    </div>
    <div className={styles.filePicker}><label>Open a local video <input aria-label="ASCII local video" type="file" accept="video/*" onChange={e => chooseVideo(e.target.files?.[0])} /></label><span>Your file stays in this browser. The approved loop is used when provisioned.</span></div>
    {phase === "reduced" && <p className={styles.reduced}>Reduced motion is on. Showing a still ASCII frame; Play LOOP30 opts into animation.</p>}
    {phase === "buffering" && <p className={styles.reduced} role="status">{playback.message}</p>}
    {expanded && <div className={styles.receipt}><p>Local LOOP30 video study · 30 seconds, 1920 × 1080, 30fps. Raw fish footage is rendered once through the preserved original ASCII renderer. Fine uses 12px desktop cells; mobile density scales with the stage.</p><p>{playback.message}</p><span>{localSource ? "Your file stays in this browser. No upload." : "The approved 30s loop requires provisioned media. Website hosting and repository redistribution rights are recorded separately."}</span><span>Rendering uses the source colors. Purple belongs to the interface.</span></div>}
  </div>;
}
