import Link from "next/link";
import { EFFECTS } from "@/lib/effect-registry";
import { DISCOVERY_MANIFEST } from "@/lib/discovery/manifest";
import { LiveEffectPreview } from "./live-effect-preview";
import styles from "@/app/white-home.module.css";

export function EffectCards({ collection = "all" }: { collection?: "all" | "frontier" | "original" }) {
  return <div className={styles.effectGrid}>{EFFECTS.filter(effect => (collection === "all" || (collection === "frontier" ? ["refractive", "impossible"].includes(effect.id) : !["refractive", "impossible"].includes(effect.id))) && DISCOVERY_MANIFEST.effects.some(entry => entry.slug === effect.slug && entry.releaseState === "approved")).map((effect, index) => <article className={styles.effectCard} key={effect.id}>
    <div className={styles.effectMeta}><span>0{index + 1} / {effect.family}</span><span>{effect.status}</span></div>
    <LiveEffectPreview id={effect.id} name={effect.name} />
    <div className={styles.effectBody}><h3><Link href={`/effects/${effect.slug}`}>{effect.name}</Link></h3><p>{effect.description}</p><Link href={`/effects/${effect.slug}`}>Open playground <span aria-hidden="true">↗</span></Link></div>
  </article>)}</div>;
}
