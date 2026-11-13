import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SIGNATURE_HERO_SHOWCASE } from "@/lib/signature-hero-showcase";
import styles from "./page.module.css";

const pageTitle = "Signature Hero 01 — Carbon, Porcelain & Cobalt | Nullworx";
const pageDescription = "Three approved visual directions for one responsive React and TypeScript signature hero. Preview the designs; the source kit is not for sale yet.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: SIGNATURE_HERO_SHOWCASE.path },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true, noimageindex: true } },
  openGraph: { title: pageTitle, description: pageDescription, url: SIGNATURE_HERO_SHOWCASE.path },
};

export default function SignatureHeroShowcasePage() {
  return (
    <main id="main" tabIndex={-1} className={styles.page} data-signature-hero-showcase>
      <header className={styles.hero}>
        <div className={styles.shell}>
          <div className={styles.kicker}><span>NULLWORX / SIGNATURE HERO 01</span><span>LOCAL RELEASE CANDIDATE</span></div>
          <h1>One signature.<br /><em>Three characters.</em></h1>
          <div className={styles.intro}>
            <p>Carbon. Porcelain. Cobalt. Three art-directed versions of an editable React hero, composed as one system. These are captures of the approved designs, not live interactive demos.</p>
            <a href="#directions" className={styles.textLink}>Explore the directions <span aria-hidden="true">↓</span></a>
          </div>
          <p className={styles.status} role="status">Preview only. The installable source is not currently available for purchase.</p>
        </div>
      </header>
      <section id="directions" aria-labelledby="directions-title" className={styles.directions}>
        <div className={styles.shell}>
          <h2 id="directions-title" className={styles.sectionTitle}>Three directions.<em> One composition.</em></h2>
          {SIGNATURE_HERO_SHOWCASE.presets.map((preset) => (
            <article key={preset.slug} id={preset.slug} className={styles.preset} aria-labelledby={`${preset.slug}-title`}>
              <div className={styles.presetHeader}>
                <div><p className={styles.presetLabel}>{preset.label}</p><h3 id={`${preset.slug}-title`}>{preset.name}</h3></div>
                <p>{preset.description}</p>
              </div>
              <div className={styles.previews}>
                <figure className={styles.desktop}>
                  <figcaption>DESKTOP / APPROVED CAPTURE</figcaption>
                  <a href={preset.desktop} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size desktop preview of ${preset.name}`}>
                    <Image src={preset.desktop} width={1440} height={980} alt={`${preset.name} signature hero approved desktop design`} loading="lazy" unoptimized />
                  </a>
                </figure>
                <figure className={styles.mobile}>
                  <figcaption>MOBILE / APPROVED CAPTURE</figcaption>
                  <a href={preset.mobile} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size mobile preview of ${preset.name}`}>
                    <Image src={preset.mobile} width={390} height={718} alt={`${preset.name} signature hero approved mobile design`} loading="lazy" unoptimized />
                  </a>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.outro} aria-labelledby="availability-title">
        <div className={styles.shell}>
          <p className={styles.presetLabel}>RELEASE STATUS / IN REVIEW</p>
          <h2 id="availability-title">Designed to be used.<br /><em>Not for sale yet.</em></h2>
          <p>The approved source candidate includes React, TypeScript, three editable presets and independent Next.js/Vite installation examples. Customer licensing and distribution are being finalized.</p>
          <div className={styles.links}><Link href="/kits/bento-duo">Explore available Bento Duo <span aria-hidden="true">↗</span></Link><Link href="/effects">Explore free effects <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>
    </main>
  );
}
