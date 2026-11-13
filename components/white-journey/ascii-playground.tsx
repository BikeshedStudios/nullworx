"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { asciiControls, asciiDefaults, asciiPlayground, proceduralSettings, videoSettings, type AsciiSettings } from "@/lib/ascii-playground";
import { usePlayground } from "../forge-factory-01/use-playground";
import { PlaygroundActions, PlaygroundRange, PlaygroundShare, PreviewToolbar } from "../forge-factory-01/playground-controls";
import { HomeKoiField } from "./home-koi-field";
import { VideoDetailControl } from "./local-video-field";
import { SourceCode } from "./source-code";
import shared from "@/app/lab/forge-factory-01/gallery.module.css";
import styles from "./ascii-playground.module.css";

export function AsciiPlayground({ sources }: { sources: Record<string, string> }) {
  const playground = usePlayground(asciiPlayground);
  const { settings, update } = playground;
  const s = useMemo(() => asciiPlayground.normalize(settings), [settings]);
  const [resetKey, setResetKey] = useState(0);
  const procedural = useMemo(() => proceduralSettings(s), [s]);
  const video = useMemo(() => videoSettings(s), [s]);
  const ranges = ["speed", ...(s.mode === "video" ? ["noiseScale", "waveTension", "waveTwist"] as const : []), ...(s.cursorInteraction ? ["interactionIntensity"] as const : [])] as const;
  function changeMode(mode: AsciiSettings["mode"]) { if (mode === s.mode) return; update({ ...asciiDefaults(mode), preview: s.preview, paused: s.paused }); }
  function reset() { playground.reset(); setResetKey(n => n + 1); }

  return <main id="main" tabIndex={-1} className={shared.page}><div className={shared.wrap}>
    <header className={shared.hero}><div><p className={shared.kicker}>UI FORGE / ASCII WAVES</p><h1>ASCII <em>Waves.</em></h1><p className={shared.intro}>Make a character field your own. Customize the live preview, copy its React code, and keep it moving in your interface.</p></div><Link href="#install">Code &amp; installation ↗</Link></header>
    <div className={styles.bench}>
      <section className={styles.preview} aria-label="Live ASCII preview"><div className={styles.sticky}>
        <div className={shared.viewerHead}><span>02 / LIVE PREVIEW</span><span>{s.mode === "video" ? "BROWSER LOCAL / WEBGL2" : "PROCEDURAL / NO MEDIA"}</span></div>
        <PreviewToolbar preview={s.preview} onChange={preview => update({ preview })} />
        <div className={styles.stage}><div className={styles.frame} data-testid="ascii-preview" data-preview={s.preview}>
          <HomeKoiField mode={s.mode} proceduralSettings={s.mode === "procedural" ? procedural : undefined} videoSettings={video} paused={s.paused} resetKey={resetKey} controls={false} onProcedural={() => changeMode("procedural")} onVideo={() => changeMode("video")} />
        </div></div>
        <div className={styles.files}><p>{s.mode === "video" ? "Choose footage you have permission to use. Your file stays in this browser. No uploads or analytics. Shared links contain settings only; choose a file again after reloading." : "Original teal and violet waves. No source video or image required."}</p></div>
      </div></section>
      <aside className={styles.controls} aria-label="Customize ASCII Waves"><div className={shared.settings}>
        <p className={shared.sectionTitle}>01 / CUSTOMIZE</p>
        <div className={shared.settingRow}><label htmlFor="ascii-mode">Experience</label><select id="ascii-mode" value={s.mode} onChange={e => changeMode(e.target.value as AsciiSettings["mode"])}><option value="procedural">Procedural waves</option><option value="video">Local video → ASCII</option></select></div>
        <div className={shared.settingRow}><label htmlFor="ascii-ramp">Character ramp</label><input id="ascii-ramp" type="text" value={settings.characters} maxLength={48} onChange={e => update({ characters: e.target.value })} aria-describedby="ramp-help" /><span className={shared.note} id="ramp-help">1–48 printable ASCII characters. Blank or invalid input uses the mode default. Video glyphs are sorted by ink coverage.</span></div>
        {s.mode === "procedural" && <label className={styles.check}><input type="checkbox" checked={s.cellSize === 0} onChange={e => update({ cellSize: e.target.checked ? 0 : 10 })} />Responsive density</label>}
        {s.mode === "video" && <VideoDetailControl value={s.cellSize} onChange={cellSize => update({ cellSize })} />}
        {s.mode === "procedural" && s.cellSize !== 0 && <PlaygroundRange id="ascii-cell" {...asciiControls.cellSize} value={s.cellSize} output={`${s.cellSize}px`} onChange={cellSize => update({ cellSize })} />}
        {s.mode === "procedural" && <label className={styles.check}><input type="checkbox" checked={s.color === "spectrum"} onChange={e => update({ color: e.target.checked ? "spectrum" : "#ffffff" })} />Original teal / violet palette</label>}
        {s.color !== "spectrum" && <div className={shared.settingRow}><label htmlFor="ascii-color">{s.mode === "video" ? "Video color tint" : "Character color"}</label><input id="ascii-color" type="color" value={s.color} onChange={e => update({ color: e.target.value })} /></div>}
        {ranges.map(key => <PlaygroundRange key={key} id={`ascii-${key}`} {...asciiControls[key]} value={s[key]} output={String(s[key])} onChange={value => update({ [key]: value })} />)}
        <label className={styles.check}><input type="checkbox" checked={s.cursorInteraction} onChange={e => update({ cursorInteraction: e.target.checked })} />Pointer interaction</label>
        <label className={styles.check}><input type="checkbox" checked={s.invert} onChange={e => update({ invert: e.target.checked })} />Invert character mapping</label>
        <PlaygroundActions paused={s.paused} onPause={() => update({ paused: !s.paused })} onReplay={() => { update({ paused: false }); setResetKey(n => n + 1); }} onReset={reset} note="Animation sleeps when hidden or out of view. Reduced motion keeps a still frame. Touch scrolling stays native." />
        <PlaygroundShare {...playground} />
      </div></aside>
    </div>
    <SourceCode sources={sources} directory={asciiPlayground.directory} usage={asciiPlayground.usage(s)} instructions={<>Copy all ten source/CSS files below into <code>components/white-journey/</code>, keeping the <code>original-ascii/</code> subdirectory. Save Usage as root-level <code>AsciiDemo.tsx</code> and render its named <code>MyInterface</code> export. React + TypeScript + CSS Modules (Next.js or Vite); no extra runtime dependencies, package installation, aliases or backend. Video mode requires WebGL2; procedural mode works without it. Animation speed changes the wave field; video keeps its original playback rate. Keep the repository MIT notice. Space Mono is optional; monospace is the fallback.</>} />
    <footer className={shared.footer}><Link href="/effects">Explore UI Forge ↗</Link><span>ORIGINAL CODE / SETTINGS SHARED, MEDIA PRIVATE</span></footer>
  </div></main>;
}
