import Link from "next/link";
import { getDiscoveryEffect } from "@/lib/discovery/manifest";
import { effectStructuredData } from "@/lib/discovery/structured-data";
import { JsonLd } from "./json-ld";
import styles from "./effect-documentation.module.css";

/**
 * Server-rendered documentation for an indexable effect page. It deliberately
 * sits outside the existing playground <main> and never changes the renderer,
 * controls or approved visual surface.
 */
export function EffectDocumentation({ slug }: { slug: string }) {
  const effect = getDiscoveryEffect(slug);
  if (!effect || effect.indexStatus !== "index") return null;
  const jsonLd = effectStructuredData(slug);
  const headingId = `about-${effect.slug}`;

  return (
    <section id="effect-notes" className={styles.section} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          DISCOVERY NOTE / {effect.releaseState.toUpperCase()} / SOURCE INCLUDED
        </p>
        <div className={styles.intro}>
          <div>
            <h2 id={headingId} className={styles.heading}>
              {effect.name} <em>in practice.</em>
            </h2>
            <p className={styles.summary}>{effect.content.summary}</p>
          </div>
          <div className={styles.details}>
            <h3>Use it for</h3>
            <ul className={styles.list}>
              {effect.content.useCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Limits</h3>
            <ul className={styles.list}>
              {effect.content.limits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.install}>
          <div>
            <h3>Use the source</h3>
            <ol className={styles.steps}>
              {effect.content.install.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.rights}>
            <h3>Code &amp; media rights</h3>
            <p>{effect.content.rightsNote}</p>
            <Link href="/effects">
              Compare the collection <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
    </section>
  );
}
