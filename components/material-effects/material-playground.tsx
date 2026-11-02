"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { AshfallType, SeamErosion, SedimentReveal } from "./material-components";
import { SourceCode } from "@/components/white-journey/source-code";
import { MATERIAL_STUDIES, materialUsage } from "@/lib/material-studies";
import { TOTAL_MS, type Comparison, type MaterialKind } from "@/components/material-core/types";
import type { MaterialDebug, MaterialStatus } from "@/components/material-core/use-material";
import styles from "./material-playground.module.css";

const studies = MATERIAL_STUDIES;
const initial: MaterialStatus = { phase: "IDLE", elapsedMs: 0, paused: false, reason: "", coverage: 1, particles: 0 };

export function MaterialPlayground({ initialEffect, sources }: { initialEffect: MaterialKind; sources: Record<string, string> }) {
  // Gallery links can retain a scroll offset inside the new, much longer page.
  // Establish the route's starting position before the source/clock mounts.
  useLayoutEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [initialEffect]);
  const selected = initialEffect;
  const [mode, setMode] = useState<Comparison>("candidate");
  const [status, setStatus] = useState(initial);
  const controller = useRef<MaterialDebug | null>(null);
  const study = studies.find(item => item.id === selected)!;
  const active = ["WINDUP", "ACTIVE", "SETTLING"].includes(status.phase);
  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.intro}>
      <div className={styles.eyebrow}><span /> UI FORGE / MATERIAL EFFECTS <b>SOURCE INCLUDED</b></div>
      <div className={styles.titleRow}><h1>{study.name.split(" ")[0]}<br /><em>{study.name.split(" ")[1]}.</em></h1><p>Three studies in coming apart.<br />Real source. A little tension.<br />Something new underneath.</p></div>
    </header>
    <nav className={styles.studies} aria-label="Select material study">
      {studies.map((item, i) => <Link key={item.id} href={`/effects/${item.slug}`} aria-current={selected === item.id ? "page" : undefined} data-testid={`select-${item.id}`}>
        <span className={styles.number}>0{i + 1}</span><span>{item.name}<small>{item.family}</small></span><span className={styles.arrow}>↗</span>
      </Link>)}
    </nav>
    <div className={styles.comparison} role="group" aria-label="Visual comparison">
      <span>SAME MATERIAL. THREE WAYS.</span>
      <div>{(["original", "css", "candidate"] as const).map((item, i) => <button type="button" key={item} aria-pressed={mode === item}
        onClick={() => { setMode(item); setStatus(initial); }}>{["A / Original", "B / CSS control", "C / Material"][i]}</button>)}</div>
    </div>
    <section className={styles.lane} data-scroll-lane aria-label="Scroll activation lane">
      <div className={styles.sticky}>
        <div className={styles.stageTop}><span>{study.name.toUpperCase()} <b>/ {mode === "css" ? study.control : mode === "original" ? "Original surface" : "Material study"}</b></span><span className={styles.phase} data-testid="phase">{status.phase}</span></div>
        {selected === "ashfall" ? <AshfallType key={mode} comparison={mode} controllerRef={controller} onStatus={setStatus} /> : selected === "seam" ? <SeamErosion key={mode} comparison={mode} controllerRef={controller} onStatus={setStatus} /> : <SedimentReveal key={mode} comparison={mode} controllerRef={controller} onStatus={setStatus} />}
        <div className={styles.controls}>
          <button type="button" data-testid="play" disabled={mode === "original" || status.phase === "COMPLETE" || Boolean(status.reason)}
            onClick={() => active && !status.paused ? controller.current?.pause() : controller.current?.play()}>
            {active ? status.paused ? "Resume ↗" : "Pause Ⅱ" : "Play study ↗"}
          </button>
          <button type="button" onClick={() => controller.current?.reset()} data-testid="reset">Reset</button>
          <label className={styles.timeline}>Inspect time <input aria-label="Inspect time" type="range" min="0" max={TOTAL_MS} step="10" value={Math.round(status.elapsedMs)}
            disabled={mode === "original" || Boolean(status.reason)} onChange={event => controller.current?.seek(Number(event.target.value))} /><output>{(status.elapsedMs / 1000).toFixed(2)}s</output></label>
        </div>
        <div className={styles.stageFoot} role="status" aria-label="Material status">{status.reason || (mode === "original" ? "Original · a static reference" : status.phase === "COMPLETE" ? "Complete · Reset to replay, or exit above the scroll lane to rearm." : "Scroll down to release the material, or play the study.")}</div>
      </div>
      <div className={styles.scrollNote} aria-hidden="true"><span>SCROLL TO RELEASE</span><span>↓</span><span>ONE GESTURE / ONE COMPLETE MOTION</span></div>
    </section>
    <section className={styles.notes} id="field-notes">
      <div><span className={styles.eyebrow}>FIELD NOTES / 0{studies.indexOf(study) + 1}</span><h2>{study.name}</h2><p>{study.description}</p></div>
      <div className={styles.readout}><span>LIVE MATERIAL</span><p><strong>{Math.round(status.coverage * 100)}%</strong> source remains</p><p><strong>{status.particles.toLocaleString()}</strong> detached fragments</p><small>Accessible DOM. Reduced motion. Source included.</small></div>
    </section>
    <p className={styles.usageNote}>Copy the listed source files into the two component folders. Text uses the included Instrument Serif and Space Mono font setup. Sediment uses the licensed local raster at <code>/material-wave-a/mineral-study.webp</code>. Scroll starts one complete motion; the inspector pauses at an exact time.</p>
    <SourceCode sources={sources} usage={materialUsage(selected)} directory="components" />
    <footer className={styles.footer}><span>UI FORGE / FINITE MATERIALS</span><Link href="/effects">Back to effects ↗</Link></footer>
  </main>;
}
