import type { Metadata } from "next";
import Link from "next/link";
import { HomeKoiField } from "@/components/white-journey/home-koi-field";
import { EffectCards } from "@/components/white-journey/effect-cards";
import { JsonLd } from "@/components/discovery/json-ld";
import { homeMetadata } from "@/lib/discovery/metadata";
import { homeStructuredData } from "@/lib/discovery/structured-data";
import styles from "./white-home.module.css";

export const metadata: Metadata = homeMetadata();

export default function HomePage() {
  return <main id="main" className={styles.page} tabIndex={-1}>
    <JsonLd data={homeStructuredData()} />
    <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="home-title">
      <div className={styles.eyebrow}><span className={styles.pulse} /> A SMALL LIBRARY. A DISTINCT POINT OF VIEW.<span>UI FORGE / VOL. 01</span></div>
      <div className={styles.introGrid}>
        <h1 className={styles.title} id="home-title">Good effects.<br /><em>Real character.</em></h1>
        <div className={styles.heroAside}><p className={styles.lede}>For interfaces that feel like <i>something.</i> Expressive React components, live controls, and the source to make them yours.</p><div className={styles.actions}><Link className={styles.primary} href="/effects">Explore effects <span aria-hidden="true">↗</span></Link><Link className={styles.secondary} href="/effects/magnetic-focus">Try the playground <span aria-hidden="true">→</span></Link></div><p className={styles.smallNote}>REACT / TYPESCRIPT / SCOPED CSS</p></div>
      </div>
      <div className={styles.fieldHead}><div><span>IN THE FIELD / 001</span><strong>A little motion, written in characters.</strong></div><span>ASCII WAVES / LOOP30</span></div>
      <HomeKoiField />
      <div className={styles.fieldFoot}><span>Video pixels → characters → a little unexpected life.</span><span>Move your cursor. Disturb the surface.</span></div>
    </section>
    <section id="effects" className={`${styles.wrap} ${styles.effects}`} aria-labelledby="effects-heading">
      <div className={styles.sectionTop}><span>01 / THE COLLECTION</span><Link href="/effects">EXPLORE ALL EFFECTS ↗</Link></div>
      <div className={styles.sectionIntro}><h2 id="effects-heading">Small details.<br /><em>Lasting impressions.</em></h2><p>Type that transforms. Color that drifts. An interaction that pulls you closer. Pick a study and find your own expression.</p></div>
      <EffectCards />
    </section>
    <section id="how" className={`${styles.wrap} ${styles.how}`} aria-labelledby="how-heading">
      <div className={styles.sectionTop}><span>02 / FROM PLAYGROUND TO PROJECT</span><span>YOUR CODE. YOUR CALL.</span></div>
      <h2 id="how-heading">See it. Tune it.<br /><em>Make it yours.</em></h2>
      <div className={styles.steps}>
        <div><span>01 / EXPLORE</span><strong>Find your effect</strong><p>Start with a live preview. See how it responds to your cursor, your text, and your ideas.</p></div>
        <div><span>02 / PLAY</span><strong>Get the feeling right</strong><p>Adjust the timing and intensity. Pause, replay, and test with your motion preferences.</p></div>
        <div><span>03 / BUILD</span><strong>Bring the source along</strong><p>Copy the React component and its CSS Module from the playground. Keep the control in your project.</p></div>
      </div><Link className={styles.secondary} href="/effects#install">How to use the components <span aria-hidden="true">→</span></Link>
    </section>
    <section className={styles.end} aria-labelledby="end-heading"><div className={styles.wrap}><div className={styles.sectionTop}><span>03 / GO MAKE SOMETHING</span><span>LESS ORDINARY. MORE YOU.</span></div><div className={styles.endGrid}><h2 id="end-heading">A starting point.<br /><em>Not a template.</em></h2><div><p>Keep the parts you love. Change everything else. The best thing you build with these effects should look like you.</p><Link className={styles.primary} href="/effects">Find your next detail <span aria-hidden="true">↗</span></Link></div></div></div></section>
  </main>;
}
