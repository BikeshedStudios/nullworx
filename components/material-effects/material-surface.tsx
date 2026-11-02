"use client";

import { useRef, type RefObject } from "react";
import type { Comparison, MaterialKind, MaterialSource } from "../material-core/types";
import { useMaterial, type MaterialDebug, type MaterialStatus } from "../material-core/use-material";
import styles from "./material-surface.module.css";

export function MaterialSurface({ kind, source, mode, controller, onStatus }: {
  kind: MaterialKind; source: MaterialSource; mode: Comparison;
  controller: RefObject<MaterialDebug | null>; onStatus: (status: MaterialStatus) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useMaterial(host, canvas, controller, kind, source, mode, onStatus);
  return (
    <div ref={host} className={`${styles.surface} ${styles[kind]}`} data-material-surface={kind} data-mode={mode} data-ready="false">
      {source.kind === "text" && <>
        <div className={styles.coordinates} aria-hidden="true"><span>01 / TYPE AS MATERIAL</span><span>41° N · WIND NE</span></div>
        <h2 className={styles.headline} data-source>
          {source.lines.map((line, i) => <span key={i} data-material-line data-text={line} style={{ color: source.color }}>
            {line}<i data-baseline aria-hidden="true" />
          </span>)}
        </h2>
        <p className={styles.ashNote}>A trace.<br /><em>Then air.</em></p>
        <span className={styles.sideNote} aria-hidden="true">TRANSIENT BY NATURE</span>
      </>}
      {source.kind === "section" && <>
        <section className={styles.nextSection} aria-label="Underlying section">
          <span className={styles.revealMark}>02 / A NEW GROUND</span>
          <div><h3>Room for what’s next.</h3><a href="#field-notes">Explore the study ↗</a></div>
        </section>
        <div className={styles.heroBackground} style={{ backgroundColor: source.color }} data-source />
        <section className={styles.heroSection} aria-label="Hero section">
          <span>THE EDGES OF POSSIBILITY</span>
          <h2>Good things<br /><em>come apart.</em></h2>
          <a href="#field-notes">Meet the material ↗</a>
        </section>
      </>}
      {source.kind === "raster" && <>
        <div className={styles.underlay}>
          <span>THE SECOND SURFACE</span>
          <h2>Beneath<br /><em>the surface.</em></h2>
          <a href="#field-notes" tabIndex={-1} data-reveal-link>A different perspective ↗</a>
        </div>
        {/* The explicit local image is the accessible source and no-JS fallback. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.raster} src={source.src} alt={source.alt} data-source />
      </>}
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
    </div>
  );
}
