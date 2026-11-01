import type { Metadata } from "next";
import Link from "next/link";
import { EffectCards } from "@/components/white-journey/effect-cards";
import styles from "@/app/white-home.module.css";

export const metadata: Metadata = { title: "Explore effects", description: "Five expressive effects. Live previews, controls and copyable source.", robots: { index: false, follow: false } };
export default function EffectsPage() {
  return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}>
    <div className={styles.eyebrow}><span className={styles.pulse} /> THE COLLECTION / VOL. 01<span>REACT + TYPESCRIPT</span></div>
    <div className={styles.sectionIntro}><h1 className={styles.title}>Find your<br /><em>signature detail.</em></h1><p>A small collection of expressive components. Open a playground, make a few adjustments, and take the source into your next project.</p></div>
    <EffectCards />
    <section id="install" className={styles.install} aria-labelledby="install-title"><span className="eyebrow">FROM THE PLAYGROUND TO YOUR PROJECT</span><h2 id="install-title">A few files. All yours to explore.</h2><p>Open an effect and select <strong>Code &amp; installation</strong>. Copy the component, its CSS Module and any listed hook into <code>components/forge-factory-01/</code>. Keep the files together, then copy the usage example.</p><p>You need React and a build tool that supports CSS Modules, such as Next.js or Vite. These three effects use no additional runtime packages. The code shown is the code powering the preview.</p><p>ASCII Waves and Digital Wake include their own usage notes. The approved fish video is provisioned separately; local file selectors work without uploads. Digital Wake is Experimental/Beta. Package distribution remains unpublished.</p><Link className={styles.secondary} href="/effects/magnetic-focus#install">Try Magnetic Focus <span aria-hidden="true">↗</span></Link></section>
  </div></main>;
}
