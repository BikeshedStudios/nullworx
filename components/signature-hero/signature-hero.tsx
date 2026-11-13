"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { LivingType } from "./living-type/living-type";
import type { LivingTypeColors } from "./living-type/living-type-recipe";
import { DEFAULT_SIGNATURE_COPY, SIGNATURE_PRESETS, supportedWordmark, type SignatureCopy, type SignaturePreset } from "./signature-presets";
import styles from "./signature-hero.module.css";

export interface SignatureHeroProps {
  preset?: SignaturePreset;
  copy?: Partial<SignatureCopy>;
  /** Hex colors only. Overrides travel with the source; no editor runtime needed. */
  colors?: Partial<{ background: string; ink: string; muted: string; accent: string; line: string; material: LivingTypeColors }>;
  settings?: { motion?: "auto" | "static"; speed?: number; weight?: number; tracking?: number; pointer?: boolean };
  links?: { home?: string; work?: string; contact?: string };
  /** Optional external pause. The in-component control remains available unless motion is static. */
  paused?: boolean;
  className?: string;
}

const hex = (value: string | undefined, fallback: string) => value && /^#[a-f\d]{6}$/i.test(value) ? value : fallback;
const bounded = (value: number | undefined, fallback: number, min: number, max: number) =>
  value !== undefined && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
// A self-serve link can use anchors, relative routes, https, mailto or tel; never script URLs.
const href = (value: string | undefined, fallback: string) => value && /^(?:#|\/(?!\/)|\.\.?\/|https?:\/\/|mailto:|tel:)/i.test(value.trim()) ? value.trim() : fallback;

export function SignatureHero({ preset = "cobalt", copy, colors, settings, links, paused: externallyPaused = false, className = "" }: SignatureHeroProps) {
  const direction = SIGNATURE_PRESETS[preset] ?? SIGNATURE_PRESETS.cobalt;
  const content = { ...DEFAULT_SIGNATURE_COPY, ...copy };
  const wordmark = supportedWordmark(content.wordmark);
  const root = useRef<HTMLElement>(null);
  const pointerFrame = useRef(0);
  const [environment, setEnvironment] = useState({ ready: false, reduced: true, visible: true, inView: true });
  const [manualPaused, setManualPaused] = useState(false);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnvironment(previous => ({ ...previous, ready: true, reduced: query.matches, visible: !document.hidden }));
    update();
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      setEnvironment(previous => ({ ...previous, inView: entry.isIntersecting }));
    });
    if (root.current) observer?.observe(root.current);
    return () => {
      cancelAnimationFrame(pointerFrame.current);
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      observer?.disconnect();
    };
  }, []);

  const staticMode = settings?.motion === "static" || environment.reduced;
  const animate = environment.ready && !staticMode;
  const motionPaused = externallyPaused || manualPaused || !environment.visible || !environment.inView;
  const pointerEnabled = settings?.pointer !== false && !staticMode;
  const weight = Math.round(bounded(settings?.weight, direction.weight, 200, 900) / 100) * 100;
  const tracking = bounded(settings?.tracking, direction.tracking, -0.04, 0.08);
  const speed = bounded(settings?.speed, direction.material.speed, 0, 0.6);
  const materialColors = colors?.material?.length === 4
    ? colors.material.map((color, index) => hex(color, direction.colors[index])) as LivingTypeColors
    : direction.colors;
  const style = {
    "--sh-bg": hex(colors?.background, direction.background), "--sh-ink": hex(colors?.ink, direction.ink),
    "--sh-muted": hex(colors?.muted, direction.muted), "--sh-accent": hex(colors?.accent, direction.accent),
    "--sh-line": hex(colors?.line, direction.line), "--sh-weight": weight, "--sh-tracking": `${tracking}em`,
    "--sh-type-size": `${Math.min(26, 93 / (wordmark.length * 0.83))}cqi`,
    "--sh-px": `${(pointer.x * 100).toFixed(2)}%`, "--sh-py": `${(pointer.y * 100).toFixed(2)}%`,
  } as CSSProperties;

  function trackPointer(event: ReactPointerEvent<HTMLElement>) {
    if (!pointerEnabled || event.pointerType === "touch") return;
    const bounds = root.current?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    const next = {
      x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
      y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
    };
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => setPointer(next));
  }

  return (
    <section ref={root} className={`${styles.hero} ${className}`} style={style} data-signature-hero={preset} data-motion={staticMode ? "static" : motionPaused ? "paused" : "running"} data-pointer={pointerEnabled ? "active" : "off"} onPointerMove={trackPointer} onPointerLeave={() => { cancelAnimationFrame(pointerFrame.current); setPointer({ x: 0.5, y: 0.5 }); }} aria-label={`${content.brand} introduction`}>
      <header className={styles.header}>
        <a className={styles.brand} href={href(links?.home, "#")}><span className={styles.brandmark} aria-hidden="true">f.</span>{content.brand}</a>
        <nav className={styles.nav} aria-label="Studio navigation">
          <a href={href(links?.work, "#work")}>{content.secondaryLabel}<span aria-hidden="true">↗</span></a>
          <a href={href(links?.contact, "#contact")}>{content.navContactLabel}<span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <div className={styles.intro}><p>{content.eyebrow}</p><span className={styles.edition}>{content.editionLabel} <span aria-hidden="true">(01—∞)</span></span></div>

      <h1 className={styles.heading}>
        <span className={styles.wordFrame}>
          <span className={`${styles.staticWord} ${animate ? styles.backingWord : ""}`}>{wordmark}</span>
          {animate && <span aria-hidden="true"><LivingType text={wordmark} preset="night-bloom" colors={materialColors} weight={weight} tracking={tracking} fit={0.94} aspect={4.1} material={{ ...direction.material, speed }} paused={motionPaused} pointer={pointer} className={styles.livingWord} /></span>}
        </span>
        <span className={styles.counterRow}><span className={styles.asterisk} aria-hidden="true">✳</span><span className={styles.counterline}>{content.counterline}</span></span>
      </h1>

      <div className={styles.bottom}>
        <div className={styles.caption}><span className={styles.index}>{content.indexLabel}</span><p>{content.location}</p><p>{content.discipline}</p></div>
        <div className={styles.pitch}><p>{content.description}</p><a className={styles.cta} href={href(links?.contact, "#contact")}>{content.primaryLabel}<span aria-hidden="true">↗</span></a></div>
        <div className={styles.sideNote}><span aria-hidden="true">↙</span><p>{content.asideFirst}<br />{content.asideSecond}</p></div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.availability}><span aria-hidden="true" />{content.availability}</span>
        <span className={styles.surface}>{direction.note}</span>
        <button className={styles.motion} type="button" disabled={staticMode} aria-pressed={manualPaused} onClick={() => setManualPaused(value => !value)}>{staticMode ? "Still composition" : manualPaused ? "Resume motion" : "Pause motion"}<span aria-hidden="true">{staticMode || manualPaused ? "Ⅱ" : "∿"}</span></button>
      </footer>
    </section>
  );
}

export { SIGNATURE_PRESETS, DEFAULT_SIGNATURE_COPY };
export type { SignatureCopy, SignaturePreset };
