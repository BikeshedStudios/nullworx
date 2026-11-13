"use client";

import Link from "next/link";
import { useState } from "react";
import { GlyphMorph } from "@/components/forge-factory-01/glyph-morph";
import { PrismText } from "@/components/forge-factory-01/prism-text";
import { MagneticFocus } from "@/components/forge-factory-01/magnetic-focus";
import styles from "./gallery.module.css";
import { SourceCode } from "@/components/white-journey/source-code";
import { FORGE_STUDIES } from "@/lib/forge-studies";
import { magneticControls, magneticPlayground } from "@/lib/magnetic-playground";
import { usePlayground } from "@/components/forge-factory-01/use-playground";
import { glyphControls, glyphPlayground } from "@/lib/glyph-playground";
import { prismControls, prismPlayground } from "@/lib/prism-playground";
import { PlaygroundText, PlaygroundRange, PlaygroundActions, PlaygroundShare, PreviewToolbar } from "@/components/forge-factory-01/playground-controls";

type Effect = "glyph" | "prism" | "magnetic";
const effects = FORGE_STUDIES.map(study => ({id:study.id,name:study.name,kind:study.family,description:study.description,files:study.files}));

const samples = {
  glyph: ["HELLO WORLD", "NEW SIGNAL", "RECONSTRUCT"],
  prism: ["Somewhere else.", "Prismatic.", "After the rain."],
  magnetic: ["ENTER THE FIELD", "LAUNCH PREVIEW", "EXPLORE EFFECT"],
} satisfies Record<Effect, string[]>;

export function ForgeFactoryGallery({ initialEffect = "glyph", sources = {}, detail = false }: { initialEffect?: Effect; sources?: Record<string, string>; detail?: boolean }) {
  const [selected, setSelected] = useState<Effect>(initialEffect);
  const [replay, setReplay] = useState(0);
  const [clicks, setClicks] = useState(0);
  const magnetic = usePlayground(magneticPlayground);
  const glyph = usePlayground(glyphPlayground);
  const prism = usePlayground(prismPlayground);
  const magneticSettings = magneticPlayground.normalize(magnetic.settings);
  const glyphSettings = glyphPlayground.normalize(glyph.settings);
  const prismSettings = prismPlayground.normalize(prism.settings);
  const active = selected === "magnetic" ? magnetic : selected === "glyph" ? glyph : prism;
  const contract = selected === "magnetic" ? magneticPlayground : selected === "glyph" ? glyphPlayground : prismPlayground;
  const usage = selected === "magnetic" ? magneticPlayground.usage(magneticSettings) : selected === "glyph" ? glyphPlayground.usage(glyphSettings) : prismPlayground.usage(prismSettings);
  const current = effects.find((effect) => effect.id === selected)!;

  function select(effect: Effect) {
    setSelected(effect);
    setReplay(n => n + 1);
    const next = effect === "magnetic" ? magnetic : effect === "glyph" ? glyph : prism;
    next.update({ paused: false });
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
              {selected === "magnetic" ? <>
                <PlaygroundText id="magnetic-label" {...magneticControls.label} label={magneticControls.label.label} value={magnetic.settings.label} fallback={magneticPlayground.defaults.label} presets={samples.magnetic} onChange={label => magnetic.update({ label })} />
                <PlaygroundRange id="magnetic-intensity" {...magneticControls.intensity} value={magneticSettings.intensity} output={`${Math.round(magneticSettings.intensity * 100)}%`} onChange={intensity => magnetic.update({ intensity })} />
              </> : selected === "glyph" ? <>
                <PlaygroundText id="glyph-text" {...glyphControls.text} value={glyph.settings.text} fallback={glyphPlayground.defaults.text} presets={samples.glyph} onChange={text => glyph.update({ text })} />
                <PlaygroundRange id="glyph-duration" {...glyphControls.durationMs} value={glyphSettings.durationMs} output={`${glyphSettings.durationMs} ms`} onChange={durationMs => glyph.update({ durationMs })} />
                <PlaygroundRange id="glyph-frame" {...glyphControls.frameMs} value={glyphSettings.frameMs} output={`${glyphSettings.frameMs} ms`} onChange={frameMs => glyph.update({ frameMs })} />
                <div className={styles.settingRow}>
                  <label htmlFor="glyph-seed">{glyphControls.seed.label}</label>
                  <input id="glyph-seed" type="number" inputMode="numeric" min={glyphControls.seed.min} max={glyphControls.seed.max} step={glyphControls.seed.step} value={Number.isFinite(glyph.settings.seed) ? glyph.settings.seed : ""} onChange={e => glyph.update({ seed: e.target.valueAsNumber })} aria-describedby="glyph-seed-help" />
                  <span className={styles.note} id="glyph-seed-help">0–2147483647. Invalid seeds use 17. Replay repeats the same sequence.</span>
                </div>
              </> : <>
                <PlaygroundText id="prism-text" {...prismControls.text} value={prism.settings.text} fallback={prismPlayground.defaults.text} presets={samples.prism} onChange={text => prism.update({ text })} />
                <PlaygroundRange id="prism-speed" {...prismControls.speed} value={prismSettings.speed} output={`${prismSettings.speed.toFixed(2)}×`} onChange={speed => prism.update({ speed })} />
                <PlaygroundRange id="prism-intensity" {...prismControls.intensity} value={prismSettings.intensity} output={`${Math.round(prismSettings.intensity * 100)}%`} onChange={intensity => prism.update({ intensity })} />
              </>}
              <PlaygroundActions paused={active.settings.paused} onPause={() => active.update({ paused: !active.settings.paused })}
                onReplay={() => { setReplay(n => n + 1); active.update({ paused: false }); }}
                onReset={() => { active.reset(); setReplay(n => n + 1); if (selected === "magnetic") setClicks(0); }}
                note={selected === "glyph" ? "Pause shows the settled text. Resume or replay starts the same seeded sequence. Reduced-motion preference always takes priority." : selected === "prism" ? "Pause freezes the color sweep; resume continues it. Reduced-motion preference always takes priority." : "Replay recenters the button and resumes pointer interaction. Reduced-motion preference always takes priority."} />
              <PlaygroundShare share={active.share} sharedUrl={active.sharedUrl} feedback={active.feedback} />
            </div>
          </div>
          <section className={styles.viewer} id="forge-stage" role="tabpanel" aria-labelledby={`forge-tab-${selected}`}>
            <div className={styles.viewerHead}>
              <span>LIVE STAGE / {current.name.toUpperCase()}</span>
              <span className={styles.live}><span /> INTERACTIVE PREVIEW</span>
            </div>
            <PreviewToolbar preview={active.settings.preview} onChange={preview => active.update({ preview })} />
            <div className={`${styles.stage} ${selected === "prism" ? styles.stagePrism : selected === "magnetic" ? styles.stageMagnetic : styles.stageGlyph}`} data-testid="effect-stage">
              <span className={styles.coordTop}>F/01 — {current.kind.toUpperCase()}</span>
              <div className={`${styles.effectWrap} ${selected === "magnetic" ? styles.magneticPreview : styles.textPreview}`} data-preview={active.settings.preview} data-testid="effect-content">
                {selected === "glyph" && <GlyphMorph key={replay} text={glyphSettings.text} seed={glyphSettings.seed} durationMs={glyphSettings.durationMs} frameMs={glyphSettings.frameMs} paused={glyphSettings.paused} />}
                {selected === "prism" && <PrismText key={replay} text={prismSettings.text} speed={prismSettings.speed} intensity={prismSettings.intensity} paused={prismSettings.paused} />}
                {selected === "magnetic" && (
                  <div className={styles.magneticGroup} style={{ overflowWrap: "anywhere" }}>
                    <MagneticFocus key={replay} label={magneticSettings.label} intensity={magneticSettings.intensity} paused={magneticSettings.paused} onClick={() => setClicks((n) => n + 1)} />
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
            <div className={styles.fileFoot}>{current.files.length} free source files. React + CSS Modules; no extra animation dependency. Keep the repository’s MIT notice with reused source.</div>
          </div>
        </section>
        {Object.keys(sources).length > 0 && <SourceCode key={selected} sources={Object.fromEntries(current.files.map(file => [file, sources[file] ?? ""]))} usage={usage} instructions={<>In an existing React + TypeScript project, copy all {current.files.length === 3 ? "three" : "two"} source files below into <code>{contract.directory}/</code>. Save the Usage example as <code>{current.name.replaceAll(" ", "")}Demo.tsx</code> at the project root, then import its <code>MyInterface</code> export into your page. Keep the relative imports together. Verified with React 19.3.1, Next.js App Router 16.4.3 and Vite 8.3.7. These support CSS Modules; no extra runtime package is needed. The example includes the Next.js client directive. Keep the repository’s <a href="https://github.com/BikeshedStudios/nullworx/blob/aa38f55554176b2185bc4ddd046d513470d5bee1/LICENSE">MIT notice</a> with the source.</>} />}
        <footer className={styles.footer}><span>UI FORGE / EFFECT FACTORY 01</span><span>REACT / TYPESCRIPT / SCOPED CSS</span><Link href="/effects">BACK TO EFFECTS ↗</Link></footer>
      </div>
    </main>
  );
}
