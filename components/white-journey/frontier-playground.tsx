"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FrontierSurface } from "@/components/visual-frontier/frontier";
import type { FrontierKind, Values, Variant } from "@/components/visual-frontier/types";
import { FRONTIER_STUDIES, frontierUsage } from "@/lib/visual-frontier";
import { SourceCode } from "./source-code";
import home from "@/app/white-home.module.css";
import styles from "./frontier-playground.module.css";

export function FrontierPlayground({ kind }: { kind: FrontierKind }) {
  const study = FRONTIER_STUDIES.find(item => item.slug === kind)!;
  const [variant, setVariant] = useState<Variant>(0), [values, setValues] = useState<Values>(study.defaults);
  const [paused, setPaused] = useState(false), [playOptIn, setPlayOptIn] = useState(false);
  const [full, setFull] = useState(false), [epoch, setEpoch] = useState(0), [reset, setReset] = useState(0);
  const [sources, setSources] = useState<Record<string, string> | null>(null), [sourceStatus, setSourceStatus] = useState("");
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { if (media.matches) { setPlayOptIn(false); setPaused(true); } };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  function resetAll() { setValues(study.defaults); setPaused(false); setPlayOptIn(false); setReset(value => value + 1); }
  async function loadSource() {
    setSourceStatus("Loading complete source…");
    try {
      const response = await fetch("/api/effects/visual-frontier/source");
      if (!response.ok) throw new Error(`Source request returned ${response.status}`);
      const data = await response.json(); setSources(data.sources); setSourceStatus("");
    } catch (error) { setSourceStatus(error instanceof Error ? error.message : String(error)); }
  }
  return <main id="main" tabIndex={-1} className={`${home.page} ${home.wrap}`}>
    <header className={styles.intro}><Link href="/effects">← The effects collection</Link><h1>{study.name}</h1><p>{study.subtitle} {study.description}</p></header>
    <div className={styles.stage}>
      <FrontierSurface key={`${full}-${epoch}`} kind={kind} variant={variant} values={values} mode={full ? "full" : "light"} paused={paused} motion={playOptIn ? "user-activated" : "respect-preference"} resetKey={reset} />
    </div>
    <section className={styles.controls} aria-label={`Customize ${study.name}`}>
      <div className={styles.variants} role="group" aria-label="Visual variant">{study.variants.map((label, index) => <button key={label} type="button" aria-pressed={variant === index} onClick={() => setVariant(index as Variant)}>{kind === "refractive-type" ? "A" : "C"}{index + 1} / {label}</button>)}</div>
      <div className={styles.sliders}>{study.labels.map((label, index) => <label key={label}><span>{label}<output>{values[index].toFixed(2)}</output></span><input aria-label={label} type="range" min="0" max="1" step="0.01" value={values[index]} onChange={event => setValues(current => index === 0 ? [Number(event.target.value), current[1]] : [current[0], Number(event.target.value)])} /></label>)}</div>
      <div className={styles.transport}>
        <button type="button" className={styles.activate} onClick={() => { setFull(true); setEpoch(value => value + 1); }}>Activate full WebGL effect</button>
        {full && <button type="button" onClick={() => setFull(false)}>Use lightweight preview</button>}
        <button type="button" onClick={() => { setPaused(true); setPlayOptIn(false); }}>Pause</button>
        <button type="button" onClick={() => { setPaused(false); setPlayOptIn(true); }}>Play</button>
        <button type="button" onClick={() => { setReset(value => value + 1); setPaused(false); setPlayOptIn(true); }}>Replay</button>
        <button type="button" onClick={resetAll}>Reset</button>
        <span>Live 2D companion by default. Full geometry is loaded on activation. Reduced motion starts still.</span>
      </div>
    </section>
    <section className={styles.source} aria-labelledby="frontier-install-title">
      <h2 id="frontier-install-title">Code &amp; installation</h2>
      <p>Copy the complete <code>components/visual-frontier/</code> directory and keep its relative imports. This is a React / TypeScript component with CSS Modules, shader source, compiled GLSL, embedded HarfBuzz WASM and the licensed Space Grotesk font. All files and notices are required; this is a multi-file installation.</p>
      <p><code>pnpm add --save-exact three@0.187.0 three-text@0.6.5</code><br/><code>pnpm add -D --save-exact @types/three@0.187.0</code></p>
      <p>Use React 19, TypeScript 5.9 and a CSS Modules build such as Vite or Next.js. Enable <code>resolveJsonModule</code>. Put the example in a root component beside <code>components/</code>, or adjust its relative import. No Shader Park compiler, external media, font server or Next.js runtime is required by the copied component.</p>
      <p><code>{'mode="light"'}</code> is the live Canvas2D companion. Set <code>{'mode="full"'}</code> after user activation for the approved mesh/SDF rendering. WebGL2 and GPU capacity are required for full mode; software GPUs can be slow. Give the parent an explicit height. The component pauses when hidden or offscreen and honors reduced motion; explicit user Play can set <code>{'motion="user-activated"'}</code>.</p>
      {!sources && <button type="button" onClick={loadSource} disabled={sourceStatus.startsWith("Loading")}>Load complete source &amp; copy files</button>}
      <p role="status">{sourceStatus}</p>
    </section>
    {sources && <SourceCode sources={sources} usage={frontierUsage(kind, variant, values, paused)} directory="components/visual-frontier" instructions={<>Copy every listed file, preserving the renderers subdirectory. Install the pinned dependencies above. The example reflects the selected variant and controls; motion respects the OS preference.</>} />}
    <nav className={styles.related} aria-label="Related effects"><Link href={`/effects/${kind === "refractive-type" ? "impossible-material" : "refractive-type"}`}>Explore {kind === "refractive-type" ? "Impossible Material" : "Refractive Type"} ↗</Link><Link href={`/effects/${kind === "refractive-type" ? "prism-text" : "sediment-reveal"}`}>{kind === "refractive-type" ? "Prism Text" : "Sediment Reveal"} ↗</Link><Link href="/effects">All effects ↗</Link></nav>
  </main>;
}
