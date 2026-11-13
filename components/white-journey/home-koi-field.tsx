"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { ProceduralSettings } from "./procedural-settings";
import type { WavesSettings } from "./original-ascii/renderer";
import { ProceduralAscii } from "./procedural-ascii";
import styles from "./home-koi-field.module.css";
import { FISH_ORIGINAL, parseFeaturedMedia, verifyFeaturedBytes } from "./featured-media";

const LocalVideoField = lazy(() => import("./local-video-field").then(module => ({ default: module.LocalVideoField })));
const receiptValue = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_ASCII_FEATURED_MEDIA : undefined;
const featured = parseFeaturedMedia(receiptValue);

export function HomeKoiField({ mode = "auto", proceduralSettings, videoSettings, paused, resetKey = 0, controls = true, onProcedural, onPausedChange, onVideo, onVideoSettingsChange }: { mode?: "auto" | "procedural" | "video"; proceduralSettings?: ProceduralSettings; videoSettings?: WavesSettings; paused?: boolean; resetKey?: number; controls?: boolean; onProcedural?: () => void; onPausedChange?: (paused: boolean) => void; onVideo?: () => void; onVideoSettingsChange?: (settings: WavesSettings) => void }) {
  const [source, setSource] = useState<string | null>(null);
  const [notice, setNotice] = useState(receiptValue ? "Checking featured fish availability. Showing procedural waves meanwhile." : "");
  const objectUrl = useRef<string | null>(null);
  const selected = useRef(false);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  useEffect(() => {
    if (mode !== "auto" || !featured) return;
    const controller = new AbortController();
    void verifyFeaturedBytes(featured, controller.signal).then(() => {
      if (!controller.signal.aborted && !selected.current) { setSource(featured.src); setNotice(""); }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !selected.current) setNotice(`${error instanceof Error ? error.message : "Featured fish verification failed."} Showing procedural waves; choose your own video below.`);
    });
    return () => controller.abort();
  }, [mode]);
  useEffect(() => {
    if (mode !== "procedural") return;
    reset();
  }, [mode]);
  function choose(file: File | undefined) {
    if (!file) return;
    selected.current = true;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setSource(objectUrl.current);
    setNotice("");
    onVideo?.();
  }
  function reset() {
    selected.current = true;
    setSource(null);
    setNotice("");
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  }
  return <div className={styles.shell} data-ascii-adapter>
    {source ? <Suspense fallback={<div className={styles.proceduralStage}><ProceduralAscii compact paused /><p className={styles.reduced} role="status">Preparing the featured character field…</p></div>}><LocalVideoField source={source} onReset={() => { reset(); onProcedural?.(); }} featured={source === featured?.src} settings={videoSettings} paused={paused} resetKey={resetKey} controls={controls} onPausedChange={onPausedChange} onSettingsChange={onVideoSettingsChange} /></Suspense> : <>
      <div className={styles.top}><span><i /> ASCII WAVES / UI FORGE</span><span>GENERATIVE STUDY</span></div>
      <div className={styles.proceduralStage}><ProceduralAscii settings={proceduralSettings} paused={paused} resetKey={resetKey} controls={controls} onPausedChange={onPausedChange} /></div>
    </>}
    {source === featured?.src && featured && <div className={styles.receipt} data-ascii-attribution>
      <p><a href={FISH_ORIGINAL} target="_blank" rel="noreferrer">{featured.title}</a> by {featured.uploader}. {featured.licenseBasis === "direct-permission" ? <>Used with direct permission from the rights holder. Credit: {featured.credit}.</> : <><a href={featured.licenseUrl}>Creative Commons Attribution {featured.licenseUrl.split("/").at(-2)}</a>.</>}</p>
      <p>Modified into a silent cyclic loop; source colors sampled into ASCII characters. No endorsement by the original creator is implied.</p>
    </div>}
    {!source && notice && <p className={styles.reduced} role="status">{!featured ? "Featured fish configuration is incomplete. Showing procedural waves; choose your own video below." : notice}</p>}
    <div className={styles.filePicker}>
      <label>Try your own video <input aria-label="ASCII local video" type="file" accept="video/*" onChange={event => { choose(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <span>{source === featured?.src ? "Featured fish video. Choose a file to replace it locally." : "Procedural waves or your own video. Your file stays in this browser."}</span>
      {source && <button type="button" onClick={() => { reset(); onProcedural?.(); }}>Clear local video</button>}
    </div>
  </div>;
}
