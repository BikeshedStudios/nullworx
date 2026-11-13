"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ProceduralAscii } from "./procedural-ascii";
import styles from "./home-koi-field.module.css";
import { FISH_ORIGINAL, parseFeaturedMedia, verifyFeaturedBytes } from "./featured-media";

const LocalVideoField = dynamic(() => import("./local-video-field").then(module => module.LocalVideoField), {
  loading: () => <div className={styles.proceduralStage}><ProceduralAscii compact paused /><p className={styles.reduced} role="status">Preparing the featured character field…</p></div>,
});
const receiptValue = process.env.NEXT_PUBLIC_ASCII_FEATURED_MEDIA;
const featured = parseFeaturedMedia(receiptValue);

export function HomeKoiField() {
  const [source, setSource] = useState<string | null>(null);
  const [notice, setNotice] = useState(receiptValue ? "Checking featured fish availability. Showing procedural waves meanwhile." : "");
  const objectUrl = useRef<string | null>(null);
  const selected = useRef(false);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  useEffect(() => {
    if (!featured) return;
    const controller = new AbortController();
    void verifyFeaturedBytes(featured, controller.signal).then(() => {
      if (!controller.signal.aborted && !selected.current) { setSource(featured.src); setNotice(""); }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !selected.current) setNotice(`${error instanceof Error ? error.message : "Featured fish verification failed."} Showing procedural waves; choose your own video below.`);
    });
    return () => controller.abort();
  }, []);
  function choose(file: File | undefined) {
    if (!file) return;
    selected.current = true;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setSource(objectUrl.current);
    setNotice("");
  }
  function reset() {
    selected.current = true;
    setSource(null);
    setNotice("");
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  }
  return <div className={styles.shell}>
    {source ? <LocalVideoField source={source} onReset={reset} featured={source === featured?.src} /> : <>
      <div className={styles.top}><span><i /> ASCII WAVES / UI FORGE</span><span>GENERATIVE STUDY</span></div>
      <div className={styles.proceduralStage}><ProceduralAscii /></div>
    </>}
    {source === featured?.src && featured && <div className={styles.receipt} data-ascii-attribution>
      <p><a href={FISH_ORIGINAL} target="_blank" rel="noreferrer">{featured.title}</a> by {featured.uploader}. {featured.licenseBasis === "direct-permission" ? <>Used with direct permission from the rights holder. Credit: {featured.credit}.</> : <><a href={featured.licenseUrl}>Creative Commons Attribution {featured.licenseUrl.split("/").at(-2)}</a>.</>}</p>
      <p>Modified into a silent cyclic loop; source colors sampled into ASCII characters. No endorsement by the original creator is implied.</p>
    </div>}
    {!source && notice && <p className={styles.reduced} role="status">{!featured ? "Featured fish configuration is incomplete. Showing procedural waves; choose your own video below." : notice}</p>}
    <div className={styles.filePicker}>
      <label>Try your own video <input aria-label="ASCII local video" type="file" accept="video/*" onChange={event => { choose(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <span>{source === featured?.src ? "Featured fish video. Choose a file to replace it locally." : "Procedural waves or your own video. Your file stays in this browser."}</span>
    </div>
  </div>;
}
