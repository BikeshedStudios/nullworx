"use client";

import Link from "next/link";
import { useState } from "react";
import { GlyphMorph } from "@/components/forge-factory-01/glyph-morph";
import { PrismText } from "@/components/forge-factory-01/prism-text";
import { MagneticFocus } from "@/components/forge-factory-01/magnetic-focus";
import styles from "./gallery.module.css";
import { SourceCode } from "@/components/white-journey/source-code";
import { FORGE_STUDIES } from "@/lib/forge-studies";

type Effect = "glyph" | "prism" | "magnetic";
const effects = FORGE_STUDIES.map(study => ({id:study.id,name:study.name,kind:study.family,description:study.description,files:study.files}));

const samples = {
  glyph: ["HELLO WORLD", "NEW SIGNAL", "RECONSTRUCT"],
  prism: ["Somewhere else.", "Prismatic.", "After the rain."],
  magnetic: ["ENTER THE FIELD", "LAUNCH PREVIEW", "EXPLORE EFFECT"],
} satisfies Record<Effect, string[]>;

export function ForgeFactoryGallery({ initialEffect = "glyph", sources = {}, detail = false }: { initialEffect?: Effect; sources?: Record<string, string>; detail?: boolean }) {
  const [selected, setSelected] = useState<Effect>(initialEffect);
  const [preset, setPreset] = useState(0);
  const [intensity, setIntensity] = useState(0.68);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [seed, setSeed] = useState(17);
  const [clicks, setClicks] = useState(0);
  const current = effects.find((effect) => effect.id === selected)!;
  const sample = samples[selected][preset]!;
  const study = FORGE_STUDIES.find(item => item.id === selected)!;
  const example = selected === "glyph"
    ? `<GlyphMorph text={${JSON.stringify(sample)}} durationMs={${Math.round(850 / speed)}} frameMs={${Math.round(20 + intensity * 80)}} seed={${seed}} paused={${paused}} />`
    : selected === "prism"
      ? `<PrismText text={${JSON.stringify(sample)}} speed={${speed}} intensity={${intensity}} paused={${paused}} />`
      : `<MagneticFocus label={${JSON.stringify(sample)}} intensity={${intensity}} paused={${paused}} onClick={() => console.log("Activated")} />`;

  function select(effect: Effect) {
    setSelected(effect);
    setPreset(0);
    setPaused(false);
    setSeed((n) => n + 1);
  }
  return (
    <main id="main" tabIndex={-1} className={styles.page} data-forge-factory="01">
      <div className={styles.wrap}>
        <nav className={styles.top} aria-label="Factory navigation">
          <Link href="/effects" className={styles.brand}>UI FORGE<span className={styles.brandDot}>.</span></Link>
          <span className={styles.topCenter}>PLAYGROUND / REACT + TYPESCRIPT</span>
          <span className={styles.topRight}>UI FORGE / VOL. 01</span>
        </nav>
        <header className={styles.hero}>
          <div>
            <div className={styles.kicker}><span className={styles.pulse} /> EFFECT FACTORY / LIVE PLAYGROUND</div>
            <h1>{detail ? current.name : <>Good effects.<br /><em>Real components.</em></>}</h1>
            <p className={styles.intro}>{detail ? current.description : "Three expressive React studies. Change the text, tune the motion, then copy the source into your own interface."}</p>
          </div>
          <div className={styles.meta}>
            <span className={styles.metaNumber}>{detail ? "↗" : "03"}</span>
            <span>ORIGINAL REACT STUDIES</span>
            <span>DOM · CSS · MOTION</span>
            <span>REUSABLE SOURCE INCLUDED</span>
          </div>
        </header>
        <div className={styles.workbench}>
          <div className={styles.sidebar}>
            <div className={styles.sectionTitle}><span>01</span> EFFECT SELECTOR</div>
            <div className={styles.tabs} role="tablist" aria-label="Choose an effect">
              {effects.map((effect, i) => (
                <button
                  key={effect.id} type="button" role="tab"
                  id={`forge-tab-${effect.id}`} aria-controls="forge-stage" aria-selected={selected === effect.id}
                  onClick={() => select(effect.id)}
                  className={selected === effect.id ? styles.tabActive : styles.tab}
                  data-testid={`select-${effect.id}`}
                >
                  <span className={styles.tabIndex}>0{i + 1}</span>
                  <span className={styles.tabName}>{effect.name}<small>{effect.kind}</small></span>
                  <span className={styles.tabArrow}>↗</span>
                </button>
              ))}
            </div>
            <div className={styles.settings}>
              <div className={styles.sectionTitle}><span>02</span> LIVE CONTROLS</div>
              <div className={styles.settingRow}>
                <label htmlFor="forge-preset">Text preset</label>
                <select id="forge-preset" value={preset} onChange={(e) => setPreset(Number(e.target.value))}>
                  {samples[selected].map((item, i) => <option value={i} key={item}>{String(i + 1).padStart(2, "0")} — {item}</option>)}
                </select>
              </div>
              <div className={styles.settingRow}>
                <label htmlFor="forge-speed">Speed <output htmlFor="forge-speed">{speed.toFixed(2)}×</output></label>
                <input type="range" id="forge-speed" min="0.25" max="2" step="0.05" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
              </div>
              <div className={styles.settingRow}>
                <label htmlFor="forge-intensity">{selected === "glyph" ? "Frame cadence" : selected === "prism" ? "Saturation" : "Pointer pull"} <output htmlFor="forge-intensity">{selected === "glyph" ? `${Math.round(20 + intensity * 80)} ms` : `${Math.round(intensity * 100)}%`}</output></label>
                <input type="range" id="forge-intensity" min="0" max="1" step="0.05" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} />
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => setPaused((v) => !v)} data-testid="toggle-motion">{paused ? "RESUME" : "PAUSE"}</button>
                <button type="button" onClick={() => { setSeed((n) => n + 1); setPreset((n) => (n + 1) % samples[selected].length); }} data-testid="replay">REPLAY ↗</button>
              </div>
              <div className={styles.note}>Reduced-motion preference overrides visual movement. Controls affect this preview only.</div>
            </div>
          </div>
          <section className={styles.viewer} id="forge-stage" role="tabpanel" aria-labelledby={`forge-tab-${selected}`}>
            <div className={styles.viewerHead}>
              <span>LIVE STAGE / {current.name.toUpperCase()}</span>
              <span className={styles.live}><span /> INTERACTIVE PREVIEW</span>
            </div>
            <div className={`${styles.stage} ${selected === "prism" ? styles.stagePrism : selected === "magnetic" ? styles.stageMagnetic : styles.stageGlyph}`} data-testid="effect-stage">
              <span className={styles.coordTop}>F/01 — {current.kind.toUpperCase()}</span>
              <div className={styles.effectWrap} data-testid="effect-content">
                {selected === "glyph" && <GlyphMorph text={sample} seed={seed} durationMs={Math.round(850 / speed)} frameMs={Math.round(20 + intensity * 80)} paused={paused} />}
                {selected === "prism" && <PrismText text={sample} speed={speed} intensity={intensity} paused={paused} />}
                {selected === "magnetic" && (
                  <div className={styles.magneticGroup}>
                    <MagneticFocus label={sample} intensity={intensity} paused={paused} onClick={() => setClicks((n) => n + 1)} />
                    <div className={styles.counter} aria-live="polite">{clicks ? `Activated ${clicks} time${clicks === 1 ? "" : "s"}` : "Pointer / keyboard / touch"}</div>
                  </div>
                )}
              </div>
              <span className={styles.coordBottom}>TYPE / EXPERIMENT 001 <span>ORIGINAL SOURCE</span></span>
            </div>
            <div className={styles.viewerFoot}>
              <div><strong>{current.name}</strong><span>{current.description}</span></div>
              <span className={styles.review}>SOURCE INCLUDED</span>
            </div>
          </section>
        </div>
        <section className={styles.under}>
          <div>
            <div className={styles.sectionTitle}><span>03</span> SOURCE CONTRACT</div>
            <h2>A little source.<br /><em>A lot of possibility.</em></h2>
            <p>Each effect is a React component with a scoped CSS Module. Copy the required files below, preserve their relative imports, and adjust the example to your interface. Keyboard support and motion preferences come with it.</p>
          </div>
          <div className={styles.filelist}>
            <div className={styles.fileHead}><span>{current.name.toUpperCase()} / REQUIRED FILES</span><span>LOCAL PROOF</span></div>
            {current.files.map((file, i) => <div className={styles.fileRow} key={file}><span>{String(i + 1).padStart(2, "0")}</span><code>components/forge-factory-01/{file}</code><span>TS/CSS</span></div>)}
            <div className={styles.fileFoot}>Local review source. The component package and registry release remain unpublished.</div>
          </div>
        </section>
        {Object.keys(sources).length > 0 && <SourceCode key={selected} sources={Object.fromEntries(current.files.map(file => [file, sources[file] ?? ""]))} usage={`import { ${study.component} } from "@/components/forge-factory-01/${study.slug}";\n\nexport function MyInterface() {\n  return ${example};\n}`} />}
        <footer className={styles.footer}><span>UI FORGE / EFFECT FACTORY 01</span><span>REACT / TYPESCRIPT / SCOPED CSS</span><Link href="/effects">BACK TO EFFECTS ↗</Link></footer>
      </div>
    </main>
  );
}
