"use client";

import type { ReactNode } from "react";
import type { PreviewSize } from "@/lib/playground";
import styles from "@/app/lab/forge-factory-01/gallery.module.css";

export function PlaygroundText({ id, label, value, maxLength, fallback, presets, onChange }: { id: string; label: string; value: string; maxLength: number; fallback: string; presets: string[]; onChange: (value: string) => void }) {
  return <>
    <div className={styles.settingRow}>
      <label htmlFor={`${id}-preset`}>Text preset</label>
      <select id={`${id}-preset`} value={presets.indexOf(value)} onChange={e => onChange(presets[Number(e.target.value)])}>
        <option value={-1} disabled>Custom text</option>
        {presets.map((item, i) => <option key={item} value={i}>{String(i + 1).padStart(2, "0")} — {item}</option>)}
      </select>
    </div>
    <div className={styles.settingRow}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" maxLength={maxLength} value={value} onChange={e => onChange(e.target.value)} aria-describedby={`${id}-help`} />
      <span className={styles.note} id={`${id}-help`}>Up to {maxLength} characters. Blank text uses {fallback}.</span>
    </div>
  </>;
}

export function PlaygroundRange({ id, label, min, max, step, value, output, onChange }: { id: string; label: string; min: number; max: number; step: number; value: number; output: string; onChange: (value: number) => void }) {
  return <div className={styles.settingRow}>
    <label htmlFor={id}>{label} <output htmlFor={id}>{output}</output></label>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
  </div>;
}

export function PlaygroundActions({ paused, onPause, onReplay, onReset, note }: { paused: boolean; onPause: () => void; onReplay: () => void; onReset: () => void; note: ReactNode }) {
  return <>
    <div className={styles.actions}>
      <button type="button" aria-pressed={paused} onClick={onPause} data-testid="toggle-motion">{paused ? "RESUME" : "PAUSE"}</button>
      <button type="button" onClick={onReplay} data-testid="replay">REPLAY ↗</button>
      <button type="button" onClick={onReset}>RESET</button>
    </div>
    <p className={styles.note}>{note}</p>
  </>;
}

export function PlaygroundShare({ share, sharedUrl, feedback }: { share: () => Promise<void>; sharedUrl: string; feedback: string }) {
  return <div className={styles.share}>
    <button type="button" onClick={share}>Share settings ↗</button>
    {sharedUrl && <label>Settings link<input type="url" readOnly value={sharedUrl} onFocus={e => e.currentTarget.select()} /></label>}
    <span role="status" className={styles.note}>{feedback}</span>
  </div>;
}

export function PreviewToolbar({ preview, onChange }: { preview: PreviewSize; onChange: (value: PreviewSize) => void }) {
  return <div className={styles.previewToolbar} role="group" aria-label="Preview size">
    <button type="button" aria-pressed={preview === "desktop"} onClick={() => onChange("desktop")}>Desktop</button>
    <button type="button" aria-pressed={preview === "mobile"} onClick={() => onChange("mobile")}>Mobile · 390px</button>
    <span>Fits the available width</span>
  </div>;
}
