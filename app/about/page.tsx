import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/discovery/metadata";
import styles from "@/app/white-home.module.css";
import { gumroadProductUrl, supportUrl } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "About Nullworx — experimental effect studio",
  description:
    "Nullworx is an experimental studio collection of original React effects, ASCII studies and material research. Source, limits and release state are documented honestly.",
  path: "/about",
  noIndex: true,
});
export default function AboutPage() {
  return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}>
    <p className="eyebrow">UI FORGE / A POINT OF VIEW</p>
    <div className={styles.sectionIntro}><h1 className={styles.title}>Built to<br /><em>be felt.</em></h1><p>UI Forge explores the small moments that give an interface character. We make effects you can play with, understand, and reshape.</p></div>
    <div className={styles.steps}>
      <div><span>01 / ORIGINAL WORK</span><strong>Follow the experiment</strong><p>This collection grows from local explorations in typography, motion and WebGL. Historical source stays intact, and the renderer behind the ASCII study comes from the first completed standalone five-video build.</p></div>
      <div><span>02 / READABLE SOURCE</span><strong>Keep the control</strong><p>Magnetic Focus, Glyph Morph and Prism Text are independent React components with scoped CSS. Their playgrounds show the actual source used in the preview, alongside controls and usage examples.</p></div>
      <div><span>03 / HONEST PROGRESS</span><strong>Let the work speak</strong><p>This is an experimental collection. Packages remain unpublished. There are no invented customers, release statistics or sales, and no active checkout on this site or mailing-list collection.</p></div>
    </div>
    <section className={styles.install}><h2>A trail worth preserving.</h2><p>The site continues work from the Nullworx research repository. Its original experiments and legacy labs remain preserved. The new journey brings the owner-selected React studies and the original ASCII renderer into one warm, purple workspace.</p><p>Code and media keep their own terms. Read the <Link href="/licenses">license inventory</Link> for the current source and media boundaries.</p><Link className={styles.secondary} href="/effects">Explore the collection <span aria-hidden="true">↗</span></Link>{gumroadProductUrl && <a className={styles.secondary} href={gumroadProductUrl} target="_blank" rel="noopener noreferrer">Get the Creator Pack ↗</a>}{supportUrl && <a className={styles.secondary} href={supportUrl} target="_blank" rel="noopener noreferrer">Support the experiments ↗</a>}</section>
  </div></main>;
}
