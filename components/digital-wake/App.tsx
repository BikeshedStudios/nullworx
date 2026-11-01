"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  asJson,
  DEFAULT,
  PRESETS,
  validate,
  type Config,
  type Mode,
} from "./config";
import { parseMotion, VideoGpuRenderer, type MotionSidecar } from "./engine";
import { parseFish, SOURCE_SHA, type Variant } from "./fish";
import { FinWake, parseFinMotion } from "./fin012";
import {
  mediaFacts,
  readyForCapture,
  seekPresentedFrame,
  disposeRenderer,
} from "./readiness012";
import { debugPanels, historical, makeCanvas } from "./debug012";
import "./digital-wake.css";
import Link from "next/link";
import {
  ACCEPTED_VIDEO,
  FISH_DATA,
  FIN_MOTION,
  FIN_REGIONS,
} from "@/lib/media";

const MODES: { id: Mode; label: string; detail: string }[] = [
  { id: "original", label: "Original", detail: "Unaltered source RGB" },
  { id: "ascii", label: "ASCII", detail: "Real video / glyph atlas" },
  {
    id: "pointillism",
    label: "Pointillism",
    detail: "Video-driven colored dots",
  },
  { id: "hybrid", label: "Hybrid", detail: "Mixed reconstruction" },
  {
    id: "wake-debug",
    label: "Wake debug",
    detail: "Original + fish-bound wake",
  },
];
const localKey = "ui-forge-digital-wake-01-v1";
function initialConfig() {
  const requested = new URLSearchParams(location.search).get("preset");
  if (requested && PRESETS[requested]) return PRESETS[requested];
  try {
    const s = localStorage.getItem(localKey);
    return s ? validate(JSON.parse(s)) : DEFAULT;
  } catch {
    return DEFAULT;
  }
}
function initialSavedPresets() {
  try {
    const raw = JSON.parse(localStorage.getItem(localKey + "-presets") ?? "{}");
    return Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, validate(v)]),
    );
  } catch {
    return {};
  }
}
function download(name: string, text: string) {
  const a = document.createElement("a"),
    u = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 500);
}
async function digest(buffer: ArrayBuffer) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
}
function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="range">
      <span>
        {label}
        <output>{value.toFixed(step < 1 ? 2 : 0)}</output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

type CaptureSpec = {
  name: string;
  variant: Variant;
  layout?: "final" | "debug" | "spawns" | "wake";
  config?: Partial<Config>;
};
type DebugApi = {
  ready: () => Promise<unknown>;
  config: () => Config;
  setConfig: (c: Partial<Config>) => void;
  births: (v?: Variant) => ReturnType<FinWake["births"]>;
  particles: (t: number, v?: Variant) => ReturnType<FinWake["particles"]>;
  metrics: () => Record<string, unknown>;
  frameAt: (
    frame: number,
    variant: Variant,
    layout?: CaptureSpec["layout"],
  ) => Promise<string>;
  capture: (
    frame: number,
    specs: CaptureSpec[],
  ) => Promise<Record<string, string>>;
};
declare global {
  interface Window {
    __wake?: DebugApi;
  }
}
export default function App() {
  const [config, setConfig] = useState<Config>(initialConfig),
    [source, setSource] = useState(ACCEPTED_VIDEO),
    [sourceName, setSourceName] = useState("loop30-v2.mp4"),
    [status, setStatus] = useState(
      "Verifying source, fish masks and fin motion…",
    ),
    [error, setError] = useState(""),
    [renderProblem, setRenderProblem] = useState(""),
    [ready, setReady] = useState(false),
    [playing, setPlaying] = useState(false),
    [meta, setMeta] = useState({ w: 0, h: 0, duration: 0 }),
    [position, setPosition] = useState(0),
    [frames, setFrames] = useState(0),
    [frameTime, setFrameTime] = useState(0),
    [particleCount, setParticleCount] = useState(0),
    [maskReady, setMaskReady] = useState(false),
    [motionInfo, setMotionInfo] = useState("Historical flow: none"),
    [presetName, setPresetName] = useState("Custom"),
    [savedPresets, setSavedPresets] =
      useState<Record<string, Config>>(initialSavedPresets),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const configRef = useRef(config);
  const reducedRef = useRef(reduced);
  useEffect(() => {
    configRef.current = config;
    reducedRef.current = reduced;
  }, [config, reduced]);
  const video = useRef<HTMLVideoElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    overlay = useRef<HTMLCanvasElement>(null),
    diagnostic = useRef<HTMLCanvasElement>(null),
    engine = useRef<VideoGpuRenderer | null>(null),
    field = useRef<FinWake | null>(null),
    motion = useRef<MotionSidecar | null>(null),
    sourceBlob = useRef<string | null>(null),
    sourceVerified = useRef(false),
    loadError = useRef<string | null>(null),
    lastStatus = useRef(0),
    nowDraw = useRef<((time?: number) => void) | null>(null),
    timeRef = useRef(0),
    work = useRef<number[]>([]),
    mediaFrames = useRef<number[]>([]),
    callbackTimes = useRef<number[]>([]),
    loopCount = useRef(0),
    lastFrame = useRef(-1),
    presented = useRef(-1),
    manualSeekTarget = useRef<number | null>(null),
    scratch = useRef<HTMLCanvasElement | null>(null),
    resources = useRef({ created: 0, destroyed: 0 }),
    baseCache = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const patch = useCallback(
    <K extends keyof Config>(key: K, value: Config[K]) => {
      setPresetName("Custom");
      setConfig((p) => ({ ...p, [key]: value }));
    },
    [],
  );
  useEffect(() => {
    try {
      localStorage.setItem(localKey, asJson(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      changed = () => {
        setReduced(q.matches);
        if (q.matches) video.current?.pause();
      };
    q.addEventListener("change", changed);
    return () => q.removeEventListener("change", changed);
  }, []);
  useEffect(() => {
    const v = video.current;
    return () =>
      queueMicrotask(() => {
        if (v && !v.isConnected) {
          v.pause();
          v.removeAttribute("src");
          v.load();
        }
      });
  }, []);
  useEffect(() => {
    const cv = canvas.current,
      stats = resources.current;
    if (!cv) return;
    let active = true;
    try {
      engine.current = new VideoGpuRenderer(cv);
      stats.created++;
    } catch (e) {
      queueMicrotask(() => {
        if (active) {
          setRenderProblem(String(e));
          loadError.current = String(e);
        }
      });
    }
    return () => {
      active = false;
      if (engine.current) {
        disposeRenderer(engine.current);
        stats.destroyed++;
      }
      engine.current = null;
    };
  }, []);
  // Native metadata may already exist when a lazy client component subscribes.
  // Read current facts and future events; readiness never depends on one event.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let active = true;
    const sync = () => {
      if (!active) return;
      const facts = mediaFacts(v);
      if (
        facts.duration !== null &&
        facts.width > 0 &&
        facts.height > 0 &&
        !v.error
      ) {
        setMeta({ w: facts.width, h: facts.height, duration: facts.duration });
        setReady(v.readyState >= 2);
        setError("");
      } else if (v.error) {
        setReady(false);
        setError(
          "The approved video is unavailable or unsupported. Provision LOOP30 or choose a local video below. Files stay in your browser.",
        );
      }
    };
    const events = [
      "loadedmetadata",
      "loadeddata",
      "durationchange",
      "canplay",
      "error",
    ];
    events.forEach((event) => v.addEventListener(event, sync));
    queueMicrotask(sync);
    return () => {
      active = false;
      events.forEach((event) => v.removeEventListener(event, sync));
    };
  }, [source]);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    field.current = null;
    sourceVerified.current = false;
    loadError.current = null;
    baseCache.current = null;
    void (async () => {
      try {
        const get = async (path: string) => {
          const r = await fetch(path, { signal: controller.signal });
          if (!r.ok) throw new Error(`Asset ${path}: HTTP ${r.status}`);
          return r.arrayBuffer();
        };
        const [fishBuffer, finBuffer, regionBuffer, srcBuffer] =
          await Promise.all([
            get(FISH_DATA),
            get(FIN_MOTION),
            get(FIN_REGIONS),
            get(source).catch((e) => {
              if (alive) {
                setError(
                  "The approved video is unavailable or unsupported. Provision LOOP30 or choose a local video below. Files stay in your browser.",
                );
                setReady(false);
              }
              throw e;
            }),
          ]);
        const decode = (b: ArrayBuffer) =>
          JSON.parse(new TextDecoder().decode(b));
        const d = parseFish(decode(fishBuffer)),
          fin = parseFinMotion(decode(finBuffer), d);
        const hashes = await Promise.all([
          digest(srcBuffer),
          digest(fishBuffer),
          digest(regionBuffer),
        ]);
        if (!alive) return;
        if (
          hashes[0] !== SOURCE_SHA ||
          hashes[1] !== fin.fishDataSha256 ||
          hashes[2] !== fin.regionSha256
        )
          throw new Error(
            "Source/mask/fin annotation SHA differs; rebuild before emitting.",
          );
        field.current = new FinWake(d, fin);
        sourceVerified.current = true;
        setMaskReady(true);
        setStatus(
          "Source + mask + fin-map hashes matched · manually defined caudal regions · measured edge motion",
        );
        nowDraw.current?.();
      } catch (e) {
        if (alive) {
          field.current = null;
          loadError.current = String(e);
          setStatus(
            "Fish-bound wake unavailable: exact source and matching fin/mask data are required. " +
              String(e),
          );
        }
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [source]);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let callback = 0,
      raf = 0,
      stopped = false;
    presented.current = -1;
    lastFrame.current = -1;
    const tick = (pts?: number) => {
      if (stopped || v.readyState < 2 || !v.videoWidth) return;
      const start = performance.now(),
        c = configRef.current,
        t = pts ?? timeRef.current;
      timeRef.current = t;
      try {
        engine.current?.render(v, c);
        const ov = overlay.current,
          view = canvas.current,
          w = field.current;
        if (ov && view) {
          if (ov.width !== view.width || ov.height !== view.height) {
            ov.width = view.width;
            ov.height = view.height;
          }
          let count = 0;
          if (reducedRef.current)
            ov.getContext("2d")?.clearRect(0, 0, ov.width, ov.height);
          else if (c.emissionVariant === "A" && w && sourceVerified.current)
            count = historical(ov, c, t, v, motion.current);
          else if (w && sourceVerified.current) count = w.draw(ov, c, t);
          else ov.getContext("2d")?.clearRect(0, 0, ov.width, ov.height);
          if (w && sourceVerified.current) {
            const layer = scratch.current ?? makeCanvas();
            scratch.current = layer;
            if (layer.width !== ov.width || layer.height !== ov.height) {
              layer.width = ov.width;
              layer.height = ov.height;
            }
            const ctx = ov.getContext("2d")!,
              f = Math.min(899, Math.floor(t * 30 + 1e-4));
            if (c.showMask) {
              w.paintMask(layer, f, true);
              ctx.globalAlpha = 0.4;
              ctx.drawImage(layer, 0, 0);
              ctx.globalAlpha = 1;
            }
            if (c.showSpawns && !reducedRef.current) {
              w.paintSpawns(layer, c, f);
              ctx.drawImage(layer, 0, 0);
            }
            if (c.debugOverlay && diagnostic.current)
              debugPanels(
                diagnostic.current,
                v,
                view,
                w,
                reducedRef.current
                  ? { ...c, wakeEnabled: false, mode: "original" }
                  : c,
                t,
                c.emissionVariant,
                motion.current,
              );
          }
          if (performance.now() - lastStatus.current > 250)
            setParticleCount(count);
        }
        const elapsed = performance.now() - start;
        work.current.push(elapsed);
        if (work.current.length > 10000) work.current.shift();
        if (performance.now() - lastStatus.current > 250) {
          lastStatus.current = performance.now();
          setPosition(t);
          setFrames(engine.current?.frames ?? 0);
          setFrameTime(elapsed);
        }
      } catch (e) {
        setRenderProblem(e instanceof Error ? e.message : String(e));
      }
    };
    nowDraw.current = tick;
    const frame = (now: number, m?: VideoFrameCallbackMetadata) => {
      if (stopped) return;
      const t = m?.mediaTime ?? v.currentTime,
        f = Math.floor(t * 30 + 1e-4);
      const manual = manualSeekTarget.current !== null;
      if (lastFrame.current >= 0 && f + 450 < lastFrame.current && !manual)
        loopCount.current++;
      if (manual && Math.abs(f - manualSeekTarget.current!) <= 2)
        manualSeekTarget.current = null;
      lastFrame.current = f;
      presented.current = f;
      mediaFrames.current.push(f);
      callbackTimes.current.push(now);
      if (mediaFrames.current.length > 10000) {
        mediaFrames.current.shift();
        callbackTimes.current.shift();
      }
      tick(t);
      if (v.requestVideoFrameCallback)
        callback = v.requestVideoFrameCallback(frame);
      else raf = requestAnimationFrame((n) => frame(n));
    };
    if (v.requestVideoFrameCallback)
      callback = v.requestVideoFrameCallback(frame);
    else raf = requestAnimationFrame((n) => frame(n));
    return () => {
      stopped = true;
      nowDraw.current = null;
      if (callback) v.cancelVideoFrameCallback(callback);
      cancelAnimationFrame(raf);
    };
  }, [source]);
  useEffect(() => {
    if (video.current) video.current.playbackRate = config.speed;
    nowDraw.current?.();
  }, [config, maskReady, reduced]);
  useEffect(
    () => () => {
      if (sourceBlob.current) URL.revokeObjectURL(sourceBlob.current);
    },
    [],
  );
  useEffect(() => {
    const ready = async () => {
      const v = video.current;
      if (!v) throw new Error("No video element");
      return readyForCapture(v, () => ({
        data: sourceVerified.current && !!field.current,
        renderer: !!engine.current,
        error: loadError.current,
      }));
    };
    const capture = async (frame: number, specs: CaptureSpec[]) => {
      await ready();
      const v = video.current!,
        w = field.current!,
        view = canvas.current!;
      v.pause();
      if (presented.current !== frame || v.seeking)
        manualSeekTarget.current = frame;
      const actual = await seekPresentedFrame(
        v,
        frame,
        () => presented.current,
      );
      presented.current = Math.floor(actual * 30 + 1e-4);
      if (presented.current !== frame)
        throw new Error("Presented source frame differs");
      timeRef.current = actual;
      if (v.seeking || v.readyState < 2)
        throw new Error("Presented frame is not decoded/upload-ready");
      const c = configRef.current,
        key = JSON.stringify([
          source,
          frame,
          c.mode,
          c.asciiSize,
          c.asciiBlend,
          c.asciiRamp,
          c.dotSize,
          c.dotDensity,
          c.dotStability,
          c.dotDistribution,
          c.brightness,
          c.contrast,
          c.saturation,
          c.compare,
          c.compareSplit,
        ]);
      let cached = baseCache.current;
      if (!cached || cached.key !== key) {
        engine.current!.render(v, c);
        const snapshot = makeCanvas(view.width, view.height);
        snapshot.getContext("2d")!.drawImage(view, 0, 0);
        cached = { key, canvas: snapshot };
        baseCache.current = cached;
      }
      const result: Record<string, string> = {};
      for (const spec of specs) {
        let settings = validate({
          ...c,
          ...spec.config,
          emissionVariant: spec.variant,
        });
        if (reducedRef.current)
          settings = { ...settings, wakeEnabled: false, mode: "original" };
        const layout = spec.layout ?? "final",
          out = makeCanvas(layout === "debug" ? 1920 : 1280, 720),
          ctx = out.getContext("2d")!;
        if (layout === "debug")
          debugPanels(
            out,
            v,
            cached.canvas,
            w,
            settings,
            frame / 30,
            spec.variant,
            motion.current,
          );
        else {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, out.width, out.height);
          if (layout !== "wake") ctx.drawImage(cached.canvas, 0, 0, 1280, 720);
          const layer = makeCanvas();
          if (!reducedRef.current) {
            if (spec.variant === "A")
              historical(layer, settings, frame / 30, v, motion.current);
            else w.draw(layer, settings, frame / 30, spec.variant);
          }
          ctx.drawImage(layer, 0, 0);
          if (layout === "spawns" && !reducedRef.current) {
            w.paintSpawns(layer, settings, frame, spec.variant);
            ctx.drawImage(layer, 0, 0);
          }
          ctx.fillStyle = "#14121de0";
          ctx.fillRect(0, 691, 1280, 29);
          ctx.fillStyle = "#eae1f1";
          ctx.font = "13px monospace";
          ctx.fillText(
            `DIGITAL WAKE 01.2 / ${spec.name} / f${frame} / seed41 / cap${settings.particleBudget}`,
            12,
            710,
          );
        }
        result[spec.name] = out.toDataURL("image/jpeg", 0.9);
      }
      return result;
    };
    window.__wake = {
      ready,
      config: () => configRef.current,
      setConfig: (c) => setConfig((p) => validate({ ...p, ...c })),
      births: (v) =>
        reducedRef.current
          ? []
          : (field.current?.births(configRef.current, v) ?? []),
      particles: (t, v) =>
        reducedRef.current
          ? []
          : (field.current?.particles(t, configRef.current, v) ?? []),
      capture,
      frameAt: async (f, v, l = "final") =>
        (await capture(f, [{ name: "frame", variant: v, layout: l }])).frame!,
      metrics: () => ({
        sourceVerified: sourceVerified.current,
        maskReady: !!field.current,
        readinessError: loadError.current,
        media: video.current ? mediaFacts(video.current) : null,
        mediaTime: timeRef.current,
        presentedFrame: presented.current,
        loopCount: loopCount.current,
        reducedMotion: reducedRef.current,
        resources: resources.current,
        work: work.current,
        mediaFrames: mediaFrames.current,
        callbackTimes: callbackTimes.current,
        rendered: engine.current?.frames,
        fin: field.current
          ? field.current.motion.frames[
              Math.max(0, Math.min(899, presented.current))
            ]?.regions
          : null,
        webgl: engine.current
          ? {
              version: engine.current.gl.getParameter(
                engine.current.gl.VERSION,
              ),
              renderer: engine.current.gl.getParameter(
                engine.current.gl.RENDERER,
              ),
            }
          : null,
      }),
    };
    return () => {
      delete window.__wake;
    };
  }, [source]);
  async function chooseVideo(file: File | undefined) {
    if (!file) return;
    field.current = null;
    sourceVerified.current = false;
    setMaskReady(false);
    const old = sourceBlob.current,
      url = URL.createObjectURL(file);
    sourceBlob.current = url;
    setSource(url);
    setSourceName(file.name);
    setError("");
    setReady(false);
    motion.current = null;
    if (old) URL.revokeObjectURL(old);
  }
  async function loadMotion(file: File | undefined) {
    if (!file) return;
    try {
      motion.current = parseMotion(JSON.parse(await file.text()));
      setMotionInfo("Historical A flow loaded");
    } catch (e) {
      motion.current = null;
      setMotionInfo(String(e));
    }
  }
  async function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      try {
        await v.play();
        setError("");
      } catch (e) {
        setError(String(e));
      }
    } else v.pause();
  }
  function scrub(n: number) {
    const v = video.current;
    if (v && Number.isFinite(v.duration)) {
      const time = Math.max(0, Math.min(v.duration - 0.001, n));
      manualSeekTarget.current = Math.floor(time * 30);
      v.currentTime = time;
    }
  }
  function savePreset() {
    const name = prompt("Preset name", presetName)?.trim();
    if (!name) return;
    const out = { ...savedPresets, [name]: config };
    setSavedPresets(out);
    localStorage.setItem(localKey + "-presets", JSON.stringify(out));
    setPresetName(name);
  }
  function importPreset(file: File | undefined) {
    if (file)
      void file.text().then((t) => {
        try {
          setConfig(validate(JSON.parse(t)));
          setPresetName("Custom");
        } catch (e) {
          setError(String(e));
        }
      });
  }
  const numeric = (
    key: keyof Config,
    min: number,
    max: number,
    step: number,
    label: string,
  ) => (
    <Range
      key={key}
      label={label}
      value={config[key] as number}
      min={min}
      max={max}
      step={step}
      onChange={(n) => patch(key, n as never)}
    />
  );
  return (
    <div className="digital-wake">
      <div className="app-shell">
        <main id="main" tabIndex={-1}>
          <section className="intro">
            <div>
              <div className="eyebrow">
                <i /> EXPERIMENTAL / BETA · DIGITAL WAKE 01.2
              </div>
              <h1>
                Digital <em>Wake.</em>
              </h1>
              <p>
                The fish leaves the trace. Source-colored particles detach from
                its moving silhouette, with explicit caudal-fin regions,
                measured edge displacement and body-relative motion.
              </p>
            </div>
            <div className="intro-side">
              <b>01.2</b>
              <span>FISH → MOTION → WAKE</span>
              <span>MANUAL CAUDAL REGIONS · SOURCE RGB</span>
            </div>
          </section>
          <section className="workbench">
            <div className="stage-panel">
              <div className="stage-bar">
                <span>
                  REALTIME STAGE / {config.mode.toUpperCase()} /{" "}
                  {config.emissionVariant}
                </span>
                <span>
                  {error || renderProblem
                    ? "ERROR"
                    : playing
                      ? "PLAYBACK ACTIVE"
                      : "PAUSED"}
                </span>
              </div>
              <div className={"stage " + config.fit}>
                <video
                  ref={video}
                  src={source}
                  muted
                  playsInline
                  loop={config.loop}
                  preload="auto"
                  crossOrigin="anonymous"
                  style={{ display: renderProblem ? "block" : "none" }}
                  onLoadedData={(e) => {
                    if (!e.currentTarget.requestVideoFrameCallback)
                      nowDraw.current?.(e.currentTarget.currentTime);
                  }}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onError={() => {
                    setError(
                      `The approved video is unavailable or unsupported. Provision LOOP30 or choose a local video below. Files stay in your browser.`,
                    );
                    setReady(false);
                  }}
                />
                <canvas
                  ref={canvas}
                  className="render-canvas"
                  aria-label="Live video reconstruction"
                />
                <canvas
                  ref={overlay}
                  className="wake-canvas"
                  aria-label="Fish-bound particle wake"
                />
                {!ready && (
                  <div className="stage-empty">
                    <b>{error ? "VIDEO UNAVAILABLE" : "PREPARING VIDEO"}</b>
                    <p>
                      {error ||
                        "The approved loop needs provisioned media. You can also open a local video in Video & source below."}
                    </p>
                  </div>
                )}
                {renderProblem && (
                  <div className="stage-error">{renderProblem}</div>
                )}
                <div className="stage-coord">
                  {config.emissionVariant === "A"
                    ? "A / HISTORICAL FIXED EMITTERS — REFERENCE ONLY"
                    : maskReady
                      ? "SOURCE VERIFIED / FISH MASK REQUIRED"
                      : "MASK UNAVAILABLE / EMISSION SUPPRESSED"}
                </div>
                {config.compare && (
                  <div
                    className="split-mark"
                    style={{ left: `${config.compareSplit * 100}%` }}
                  />
                )}
              </div>
              <div className="transport">
                <button onClick={() => void toggle()} disabled={!ready}>
                  {playing ? "PAUSE Ⅱ" : "PLAY ▶"}
                </button>
                <button onClick={() => scrub(0)} disabled={!ready}>
                  ↺ START
                </button>
                <label className="timeline">
                  <input
                    aria-label="Video time"
                    type="range"
                    min={0}
                    max={meta.duration || 30}
                    step="0.0333333333"
                    value={Math.min(position, meta.duration || 30)}
                    onChange={(e) => scrub(Number(e.target.value))}
                  />
                  <span>
                    {position.toFixed(2)} / {meta.duration.toFixed(2)}s
                  </span>
                </label>
              </div>
              <div className="stage-footer">
                <span>
                  RENDERED FRAMES <b>{frames}</b>
                </span>
                <span>
                  FRAME WORK <b>{frameTime.toFixed(1)} ms</b>
                </span>
                <span>
                  WAKE DOTS <b>{particleCount}</b>
                </span>
                <span>
                  VIDEO{" "}
                  <b>
                    {meta.w}×{meta.h}
                  </b>
                </span>
              </div>
              {(error || renderProblem) && (
                <p className="error">{error || renderProblem}</p>
              )}
              <p className="caption">
                {reduced
                  ? "Reduced motion: source starts paused; wake suppressed. "
                  : ""}
                {status}
              </p>
              {config.debugOverlay && (
                <div className="diagnostics">
                  <canvas
                    ref={diagnostic}
                    aria-label="Original, fish mask, fin regions, actual spawn points and final wake"
                  />
                  <p>
                    Yellow crosses mark actual births. Green fin regions have
                    measured support; red regions suppress emission. Vectors
                    show body-relative motion, not detection probability.
                  </p>
                </div>
              )}
            </div>
            <aside className="side-panel">
              <div className="side-title">01 / RENDERING MODE</div>
              <div className="mode-tabs">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    className={config.mode === m.id ? "selected" : ""}
                    onClick={() => patch("mode", m.id)}
                  >
                    <strong>{m.label}</strong>
                    <small>{m.detail}</small>
                  </button>
                ))}
              </div>
              <div className="side-title">02 / CONTROLS</div>
              <details open>
                <summary>Fin motion / 01.2</summary>
                <div className="controls">
                  <div className="button-pair">
                    <button
                      onClick={() => {
                        setConfig(PRESETS.SUBTLE!);
                        setPresetName("SUBTLE");
                      }}
                    >
                      SUBTLE
                    </button>
                    <button
                      onClick={() => {
                        setConfig(PRESETS.EXPRESSIVE!);
                        setPresetName("EXPRESSIVE");
                      }}
                    >
                      EXPRESSIVE
                    </button>
                  </div>
                  <label className="control-inline">
                    Comparison
                    <select
                      aria-label="Emission variant"
                      value={config.emissionVariant}
                      onChange={(e) =>
                        patch("emissionVariant", e.target.value as Variant)
                      }
                    >
                      <option value="A">A · historical fixed anchors</option>
                      <option value="B">B · preserved 01.1 wake</option>
                      <option value="C">C · measured caudal-fin motion</option>
                      <option value="S">S · shuffled timing control</option>
                    </select>
                  </label>
                  <label className="control-inline">
                    Wake enabled
                    <input
                      type="checkbox"
                      checked={config.wakeEnabled}
                      onChange={(e) => patch("wakeEnabled", e.target.checked)}
                    />
                  </label>
                  {numeric("finEmission", 0, 3, 0.05, "Fin emission strength")}
                  {config.emissionVariant === "B" ? (
                    numeric(
                      "bodyEmission",
                      0,
                      1,
                      0.05,
                      "Historical body contour emission",
                    )
                  ) : (
                    <small>Body emission locked off for C / S</small>
                  )}
                  {numeric("wakeVelocity", 0, 5, 0.1, "Detachment velocity")}
                  {numeric("wakeLifetime", 0.2, 5, 0.1, "Wake lifetime")}
                  {numeric("wakeCurl", 0, 3, 0.05, "Curl strength")}
                  {numeric("wakeOpacity", 0, 1, 0.05, "Fade")}
                  <label className="control-inline">
                    Show fin regions / validity
                    <input
                      type="checkbox"
                      checked={config.showMask}
                      onChange={(e) => patch("showMask", e.target.checked)}
                    />
                  </label>
                  <label className="control-inline">
                    Show actual spawn positions
                    <input
                      type="checkbox"
                      checked={config.showSpawns}
                      onChange={(e) => patch("showSpawns", e.target.checked)}
                    />
                  </label>
                  <label className="control-inline">
                    Five-panel debug
                    <input
                      type="checkbox"
                      checked={config.debugOverlay}
                      onChange={(e) => patch("debugOverlay", e.target.checked)}
                    />
                  </label>
                  <div className="notice">
                    C uses explicit distal caudal-fin sectors and measured edge
                    motion. B preserves 01.1; S shuffles motion timing while
                    retaining current geometry and color. Unsupported C/S frames
                    suppress births.
                  </div>
                  <a
                    className="editor-link"
                    href="/tools/fin-editor-012.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    MANUAL FIN KEYFRAMES ↗
                  </a>
                  <button
                    disabled={!maskReady || config.emissionVariant === "A"}
                    onClick={() =>
                      download(
                        "particle-births-" + config.emissionVariant + ".json",
                        JSON.stringify(
                          {
                            sourceSha256: SOURCE_SHA,
                            config,
                            births: field.current?.births(config),
                          },
                          null,
                          2,
                        ),
                      )
                    }
                  >
                    EXPORT SOURCE TRACE / ONE LOOP
                  </button>
                </div>
              </details>
              <details>
                <summary>Particle appearance / budget</summary>
                <div className="controls">
                  {numeric("wakeRate", 0, 100, 1, "Emission / sec / stream")}
                  {numeric("wakeTurbulence", 0, 3, 0.05, "Diffusion")}
                  {numeric("wakeSize", 0.3, 8, 0.1, "Point size")}
                  {numeric("particleBudget", 100, 4000, 100, "Particle cap")}
                  <div className="notice">
                    A/B/C share four stream budgets and seed 41. C can suppress
                    weak motion. Birth colors stay attached to their source
                    frame.
                  </div>
                </div>
              </details>
              <details>
                <summary>Video &amp; source</summary>
                <div className="controls">
                  <label className="upload-btn secondary">
                    CHOOSE VIDEO
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => void chooseVideo(e.target.files?.[0])}
                    />
                  </label>
                  <label className="upload-btn secondary">
                    LOAD HISTORICAL FLOW
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => void loadMotion(e.target.files?.[0])}
                    />
                  </label>
                  <small>{motionInfo}</small>
                  {numeric("speed", 0.25, 2, 0.05, "Speed")}
                  {numeric("brightness", 0.4, 2.3, 0.05, "Brightness")}
                  {numeric("contrast", 0.5, 2, 0.05, "Contrast")}
                  {numeric("saturation", 0, 2.5, 0.05, "Saturation")}
                  <label className="control-inline">
                    Frame fit
                    <select
                      value={config.fit}
                      onChange={(e) =>
                        patch("fit", e.target.value as Config["fit"])
                      }
                    >
                      <option value="contain">Contain</option>
                      <option value="cover">Cover</option>
                    </select>
                  </label>
                  <label className="control-inline">
                    Loop
                    <input
                      type="checkbox"
                      checked={config.loop}
                      onChange={(e) => patch("loop", e.target.checked)}
                    />
                  </label>
                  <label className="control-inline">
                    Compare split
                    <input
                      type="checkbox"
                      checked={config.compare}
                      onChange={(e) => patch("compare", e.target.checked)}
                    />
                  </label>
                  {config.compare &&
                    numeric("compareSplit", 0.1, 0.9, 0.05, "Original side")}
                </div>
              </details>
              <details>
                <summary>ASCII fidelity</summary>
                <div className="controls">
                  {numeric("asciiSize", 3, 24, 1, "Glyph pixels (Fine = 5)")}
                  {numeric("asciiBlend", 0, 1, 0.05, "Hybrid glyph blend")}
                  <label className="control-inline">
                    Glyph ramp
                    <input
                      type="text"
                      value={config.asciiRamp}
                      maxLength={32}
                      onChange={(e) =>
                        patch(
                          "asciiRamp",
                          e.target.value.length >= 2
                            ? e.target.value
                            : config.asciiRamp,
                        )
                      }
                    />
                  </label>
                </div>
              </details>
              <details>
                <summary>Pointillism</summary>
                <div className="controls">
                  {numeric("dotSize", 0.35, 8, 0.05, "Dot size")}
                  {numeric("dotDensity", 0.4, 3, 0.05, "Dot density")}
                  {numeric("dotStability", 0, 1, 0.05, "Seeded jitter")}
                  <label className="control-inline">
                    Distribution
                    <select
                      value={config.dotDistribution}
                      onChange={(e) =>
                        patch(
                          "dotDistribution",
                          e.target.value as Config["dotDistribution"],
                        )
                      }
                    >
                      <option value="grid">Regular</option>
                      <option value="jitter">Stable jitter</option>
                    </select>
                  </label>
                </div>
              </details>
              <details>
                <summary>Presets / receipts</summary>
                <div className="controls">
                  <label className="control-inline">
                    Preset
                    <select
                      value={presetName}
                      onChange={(e) => {
                        setPresetName(e.target.value);
                        setConfig(
                          PRESETS[e.target.value] ??
                            savedPresets[e.target.value] ??
                            DEFAULT,
                        );
                      }}
                    >
                      <option value="Custom">Custom / edited</option>
                      {Object.keys({ ...PRESETS, ...savedPresets })
                        .filter((n) => n !== "Custom")
                        .map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                    </select>
                  </label>
                  <div className="button-pair">
                    <button onClick={() => setConfig(DEFAULT)}>RESET</button>
                    <button onClick={savePreset}>SAVE</button>
                  </div>
                  <button
                    onClick={() =>
                      download("digital-wake-preset-v1.json", asJson(config))
                    }
                  >
                    EXPORT PRESET JSON
                  </button>
                  <label className="upload-btn secondary">
                    IMPORT PRESET JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => importPreset(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </details>
            </aside>
          </section>
          <section id="install" className="lower">
            <div>
              <span className="eyebrow">INSTALLATION / USAGE</span>
              <h2>
                Bring the <em>source.</em>
              </h2>
              <p>
                Digital Wake is integrated at components/digital-wake/ in the
                repository. Run pnpm install and pnpm dev to use this
                playground. Preset JSON imports and exports preserve the
                accepted settings.
              </p>
              <p>
                For a separate React app, keep the renderer, config, fish,
                fin012, debug helpers and readiness012 together; App is the
                Next.js adapter. Provision the exact video and matching sidecars
                as described in MEDIA_PROVISIONING.md.
              </p>
              <p>
                Fin awareness uses manually defined caudal sectors and measured
                edge motion. It is a bounded proof, with unsupported frames
                suppressed. It does not automatically identify anatomical fins
                in arbitrary videos.
              </p>
              <a href="https://github.com/BikeshedStudios/nullworx/blob/main/MEDIA_PROVISIONING.md">
                Media &amp; manual correction workflow ↗
              </a>
            </div>
            <div>
              <span className="eyebrow">LOCAL FILES / NO UPLOAD</span>
              <p>
                A local video plays in Original, ASCII, Pointillism and Hybrid.
                Fish-bound emission is available only when its SHA-256 matches
                the accepted loop and its matching mask/motion data is
                provisioned. No fallback emitters are used.
              </p>
              <Link href="/effects">Back to the effect gallery ↗</Link>
            </div>
          </section>
          <section className="lower">
            <div>
              <span className="eyebrow">03 / ART DIRECTION</span>
              <h2>
                Motion must <em>earn</em> the wake.
              </h2>
              <p>
                C births require both the fish mask and an explicit supported
                fin region. A held-out edge-motion reference and shuffled-timing
                control test temporal causality. Transparent rims, fast turns
                and dissolves remain limitations.
              </p>
            </div>
            <div className="readouts">
              <div>
                <strong>SOURCE</strong>
                <span>{sourceName}</span>
              </div>
              <div>
                <strong>RENDERING</strong>
                <span>Preserved GPU glyph atlas / stable dot lattice</span>
              </div>
              <div>
                <strong>MOTION</strong>
                <span>
                  Named caudal regions + edge displacement / temporal support
                </span>
              </div>
              <div>
                <strong>STATE</strong>
                <span>Deterministic cyclic birth history / no loop reset</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
