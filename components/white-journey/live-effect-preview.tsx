"use client";

import { useEffect, useRef, useState } from "react";
import { GlyphMorph } from "@/components/forge-factory-01/glyph-morph";
import { PrismText } from "@/components/forge-factory-01/prism-text";
import { MagneticFocus } from "@/components/forge-factory-01/magnetic-focus";
import type { MaterialDebug, MaterialStatus } from "@/components/material-core/use-material";
import type { MaterialKind } from "@/components/material-core/types";
import { ProceduralAscii } from "./procedural-ascii";
import { usePreviewActivity } from "./use-preview-activity";
import styles from "@/app/white-home.module.css";

import { AshfallType, SeamErosion, SedimentReveal } from "@/components/material-effects/material-components";

function MaterialPreview({ kind, active, replay }: { kind: MaterialKind; active: boolean; replay: number }) {
  const controller = useRef<MaterialDebug | null>(null);
  useEffect(() => {
    const api = controller.current;
    if (!api) return;
    if (active) { api.reset(); api.play(); }
    else if (!api.snapshot().paused) api.pause();
  }, [active, replay]);
  function ready(status: MaterialStatus) {
    if (active && !status.reason && status.phase === "IDLE") controller.current?.play();
  }
  const props = { controllerRef: controller, onStatus: ready };
  return <div className={styles.materialPreview} data-scroll-lane inert>
    {kind === "ashfall" ? <AshfallType {...props} /> : kind === "seam" ? <SeamErosion {...props} /> : <SedimentReveal {...props} />}
  </div>;
}

export function LiveEffectPreview({ id, name }: { id: string; name: string }) {
  const host = useRef<HTMLDivElement>(null);
  const { visible, reduced, seen } = usePreviewActivity(host);
  const [paused, setPaused] = useState(false);
  const [replay, setReplay] = useState(0);
  const active = visible && !reduced && !paused;
  const material = id === "ashfall" || id === "seam" || id === "sediment";
  return <div ref={host} data-live-preview={id} data-playing={active}>
    <div className={`${styles.preview} ${styles[id] ?? ""}`}>
      {seen && <>
        {id === "ascii" && <ProceduralAscii compact paused={!active} />}
        {id === "magnetic" && <MagneticFocus label={replay % 2 ? "YOU FOUND IT" : "COME CLOSER"} paused={!active} className={styles.previewButton} onClick={() => setReplay(value => value + 1)} />}
        {id === "glyph" && <GlyphMorph key={replay} seed={17 + replay} text="MAKE / MARK" paused={!active} className={styles.previewType} />}
        {id === "prism" && <PrismText text="Prismatic." paused={!active} className={styles.previewType} />}
        {material && <MaterialPreview kind={id} active={active} replay={replay} />}
      </>}
    </div>
    <div className={styles.previewControls}>
      <span>{reduced ? "Reduced motion" : id === "magnetic" ? "Hover or tap" : id === "ascii" ? "Procedural ASCII" : "Live component"}</span>
      {id === "glyph" || material ? <button type="button" aria-label={`Replay ${name} preview`} disabled={reduced} onClick={() => { setPaused(false); setReplay(value => value + 1); }}>Replay ↻</button> : null}
      {id !== "magnetic" && <button type="button" aria-label={`${paused ? "Play" : "Pause"} ${name} preview`} aria-pressed={paused} disabled={reduced} onClick={() => setPaused(value => !value)}>{paused ? "Play" : "Pause"}</button>}
    </div>
  </div>;
}
