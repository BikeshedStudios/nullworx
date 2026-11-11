"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ProceduralAscii } from "./procedural-ascii";
import styles from "./home-koi-field.module.css";

const LocalVideoField = dynamic(() => import("./local-video-field").then(module => module.LocalVideoField));

export function HomeKoiField() {
  const [source, setSource] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  function choose(file: File | undefined) {
    if (!file) return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    setSource(objectUrl.current);
  }
  function reset() {
    setSource(null);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  }
  return <div className={styles.shell}>
    {source ? <LocalVideoField source={source} onReset={reset} /> : <>
      <div className={styles.top}><span><i /> ASCII WAVES / UI FORGE</span><span>GENERATIVE STUDY</span></div>
      <div className={styles.proceduralStage}><ProceduralAscii /></div>
    </>}
    <div className={styles.filePicker}>
      <label>Try your own video <input aria-label="ASCII local video" type="file" accept="video/*" onChange={event => { choose(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <span>Original procedural waves by default. Your video stays in this browser.</span>
    </div>
  </div>;
}
