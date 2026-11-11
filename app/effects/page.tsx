import type { Metadata } from "next";
import Link from "next/link";
import { EffectCards } from "@/components/white-journey/effect-cards";
import { JsonLd } from "@/components/discovery/json-ld";
import { galleryMetadata } from "@/lib/discovery/metadata";
import { galleryStructuredData } from "@/lib/discovery/structured-data";
import styles from "@/app/white-home.module.css";

export const metadata: Metadata = galleryMetadata();
export default function EffectsPage() {
  return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}>
    <JsonLd data={galleryStructuredData()} />
    <div className={styles.eyebrow}><span className={styles.pulse} /> UI FORGE / THE COLLECTION<span>REACT + TYPESCRIPT</span></div>
    <div className={styles.sectionIntro}><h1 className={styles.title}>Find your<br /><em>signature detail.</em></h1><p>The React effects kit by Bikeshed Studios, at nullworx.space. Open a playground, make a few adjustments, and take the source into your next project.</p></div>
    <EffectCards />
    <section id="install" className={styles.install} aria-labelledby="install-title"><span className="eyebrow">FROM THE PLAYGROUND TO YOUR PROJECT</span><h2 id="install-title">A few files. All yours to explore.</h2><p>Open an effect and select <strong>Code &amp; installation</strong>. Copy the files into the directory shown on that effect, preserve their relative imports, then use its example.</p><p>You need React and a build tool that supports CSS Modules, such as Next.js or Vite. The material effects include their shared source and local asset notes. No additional animation engine is required. Source files and usage examples stay with each playground.</p><p>ASCII Waves includes an original procedural animation and a browser-local video selector. No third-party video is bundled or requested. Each approved effect includes its source and usage notes.</p><Link className={styles.secondary} href="/effects/magnetic-focus#install">Try Magnetic Focus <span aria-hidden="true">↗</span></Link></section>
  </div></main>;
}
