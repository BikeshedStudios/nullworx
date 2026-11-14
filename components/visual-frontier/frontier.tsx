"use client";

import { useEffect, useRef, useState } from "react";
import { gpuSession } from "./gpu-session";
import { runScene } from "./runtime";
import { create as createLight } from "./renderers/light";
import { clamp, type FrontierKind, type SceneState, type Values, type Variant } from "./types";
import styles from "./frontier.module.css";

export type FrontierProps = {
  /** Full is explicitly opt-in. Light is a live Canvas2D companion. */
  mode?: "light" | "full";
  paused?: boolean;
  /** Explicit user Play may opt into motion even with the OS preference. */
  motion?: "respect-preference" | "user-activated";
  resetKey?: number;
  className?: string;
};
type SurfaceProps = FrontierProps & { kind: FrontierKind; variant: Variant; values: Values };

export function FrontierSurface({ kind, variant, values, mode = "light", paused = false,
  motion = "respect-preference", resetKey = 0, className = "" }: SurfaceProps) {
  const host = useRef<HTMLDivElement>(null), runner = useRef<ReturnType<typeof runScene> | null>(null);
  const state = useRef<SceneState>({ pointer: [0, 0], values, paused: true });
  const [activity, setActivity] = useState({ seen: false, reduced: true });
  const [status, setStatus] = useState({ phase: "light", error: "", variant });
  const [superseded, setSuperseded] = useState(false);
  const full = mode === "full" && !superseded && !status.error;
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => setActivity(current => ({ seen: current.seen || visible, reduced: media.matches }));
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node); media.addEventListener("change", sync);
    return () => { observer.disconnect(); media.removeEventListener("change", sync); };
  }, []);
  useEffect(() => {
    state.current.values = values;
    state.current.paused = paused || (activity.reduced && motion !== "user-activated");
    runner.current?.invalidate();
  }, [values, paused, activity.reduced, motion]);
  useEffect(() => { runner.current?.reset(); }, [resetKey]);
  useEffect(() => {
    const node = host.current;
    if (!node || !activity.seen) return;
    let cancelled = false;
    const failure = (error: unknown) => {
      if (!cancelled) setStatus({ phase: "error", error: error instanceof Error ? error.message : String(error), variant });
    };
    const ready = () => { if (!cancelled) setStatus(current => ({ ...current, phase: full ? "ready" : "light", variant })); };
    const started = performance.now();
    if (!full) {
      try {
        const local = runScene(node, createLight(node, kind, variant), state, ready, failure, started);
        runner.current = local;
        return () => { cancelled = true; runner.current = null; void local.dispose(); };
      } catch (error) { failure(error); return; }
    }
    const session = gpuSession(async signal => {
      if (!cancelled) setStatus({ phase: "loading", error: "", variant });
      const rendererModule = kind === "refractive-type" ? await import("./renderers/refractive") : await import("./renderers/material");
      if (signal.aborted) return () => {};
      const engine = await rendererModule.create(node, variant, signal);
      if (signal.aborted) { await engine.dispose(); return () => {}; }
      const local = runScene(node, engine, state, ready, failure, started);
      runner.current = local;
      return () => local.dispose();
    }, () => { if (!cancelled) { setSuperseded(true); runner.current = null; } });
    void session.ready.catch(failure);
    return () => { cancelled = true; runner.current = null; void session.close().catch(() => {}); };
  }, [kind, variant, full, activity.seen]);
  const name = kind === "refractive-type" ? "Refractive Type" : "Impossible Material";
  const variantName = kind === "refractive-type" ? variant ? "Split signal / VOID" : "Spectral mass / PHASE" : variant ? "Folded mineral" : "Quicksilver";
  return <div className={`${styles.surface} ${className}`} data-frontier={kind} data-variant={variant} data-mode={full ? "full" : "light"} data-status={status.variant === variant ? status.phase : "loading"}>
    <div ref={host} className={`${styles.host} ${full ? styles.full : ""}`} role="img" tabIndex={0} aria-label={`${name}: ${variantName}. Move, drag, or use arrow keys.`} />
    <div className={styles.caption} aria-hidden="true"><span>{kind === "refractive-type" ? "A" : "C"}{variant + 1} / {variantName.toUpperCase()}</span><span>{full ? "LIVE WEBGL2" : "LIVE CANVAS2D"}</span></div>
    <div className={`${styles.caption} ${styles.foot}`} aria-hidden="true"><span>{kind === "refractive-type" ? variant ? "THE SPACE BETWEEN" : "LIGHT HAS A MEMORY" : variant ? "GEOLOGY OF THE UNREAL" : "AN OBJECT WITHOUT AN INSIDE"}</span><span>{full ? "Drag · touch · arrow keys" : "Lightweight live preview"}</span></div>
    {full && (status.variant !== variant || status.phase !== "ready") && <div className={styles.status} role="status">Forming the study…<p>Preparing geometry and shaders.</p></div>}
    {status.error && <p className={styles.error} role="alert">{status.error} Showing the live lightweight companion where Canvas2D is available.</p>}
    {superseded && <p className={styles.error} role="status">Full renderer released for another study. Activate again to resume here.</p>}
  </div>;
}

export type RefractiveTypeProps = FrontierProps & { variant?: "spectral-mass" | "split-signal"; dispersion?: number; deformation?: number };
export function RefractiveType({ variant = "spectral-mass", dispersion = .5, deformation = .45, ...props }: RefractiveTypeProps) {
  return <FrontierSurface {...props} kind="refractive-type" variant={variant === "split-signal" ? 1 : 0} values={[clamp(dispersion, .5), clamp(deformation, .45)]} />;
}
export type ImpossibleMaterialProps = FrontierProps & { variant?: "quicksilver" | "folded-mineral"; tension?: number; iridescence?: number };
export function ImpossibleMaterial({ variant = "quicksilver", tension = .5, iridescence = .55, ...props }: ImpossibleMaterialProps) {
  return <FrontierSurface {...props} kind="impossible-material" variant={variant === "folded-mineral" ? 1 : 0} values={[clamp(tension, .5), clamp(iridescence, .55)]} />;
}
