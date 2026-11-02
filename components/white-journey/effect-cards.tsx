import Link from "next/link";
import { EFFECTS } from "@/lib/effect-registry";
import { GlyphMorph } from "@/components/forge-factory-01/glyph-morph";
import { PrismText } from "@/components/forge-factory-01/prism-text";
import { MagneticFocus } from "@/components/forge-factory-01/magnetic-focus";
import styles from "@/app/white-home.module.css";

export function EffectCards() {
  return <div className={styles.effectGrid}>{EFFECTS.map((effect, index) => <article className={styles.effectCard} key={effect.id}>
    <div className={styles.effectMeta}><span>0{index + 1} / {effect.family}</span><span>{effect.status}</span></div>
    <div className={`${styles.preview} ${styles[effect.id] ?? ""}`}>
      {effect.id === "ascii" && <span className={styles.previewType} aria-hidden="true">.:≈✦≈:.</span>}
      {effect.id === "wake" && <span className={styles.previewType} aria-hidden="true">↝ · · ·</span>}
      {effect.id === "magnetic" && <MagneticFocus label="COME CLOSER" className={styles.previewButton} />}
      {effect.id === "glyph" && <GlyphMorph text="MAKE / MARK" className={styles.previewType} />}
      {effect.id === "prism" && <PrismText text="Prismatic." className={styles.previewType} />}
      {effect.id === "ashfall" && <span className={styles.previewType} aria-hidden="true">Nothing<br /><i>stays.</i></span>}
      {effect.id === "seam" && <span className={styles.previewType} aria-hidden="true">Come<br /><i>apart.</i></span>}
      {effect.id === "sediment" && <span style={{ position: "absolute", inset: 0, background: "url('/material-wave-a/mineral-study.webp') center / cover" }} aria-hidden="true" />}
    </div>
    <div className={styles.effectBody}><h3><Link href={`/effects/${effect.slug}`}>{effect.name}</Link></h3><p>{effect.description}</p><Link href={`/effects/${effect.slug}`}>Open playground <span aria-hidden="true">↗</span></Link></div>
  </article>)}</div>;
}
