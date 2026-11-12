import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BENTO_DUO } from "@/lib/bento-duo";
import { createPageMetadata } from "@/lib/discovery/metadata";
import { getDiscoveryPage } from "@/lib/discovery/manifest";
import { bentoDuoStructuredData } from "@/lib/discovery/structured-data";
import { JsonLd } from "@/components/discovery/json-ld";
import styles from "./page.module.css";

const discovery = getDiscoveryPage("/kits/bento-duo");
if (!discovery) throw new Error("Bento Duo discovery entry is missing");

export const metadata: Metadata = createPageMetadata({
  title: discovery.search.title,
  description: discovery.search.description,
  path: BENTO_DUO.path,
});

function CheckoutLink({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <a
      className={compact ? styles.checkoutSmall : styles.checkout}
      href={BENTO_DUO.checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label + " — €39 on Gumroad, opens in a new tab"}
      data-bento-checkout
    >
      <span>{label}</span><span aria-hidden="true">↗</span>
    </a>
  );
}

export default function BentoDuoProductPage() {
  return (
    <main id="main" tabIndex={-1} className={styles.page} data-bento-duo-product>
      <JsonLd data={bentoDuoStructuredData()} />
      <section className={styles.hero} aria-labelledby="bento-title">
        <div className={styles.shell}>
          <div className={styles.kicker}>
            <span>UI FORGE / PREMIUM COMPOSITION 01</span>
            <span>REACT · TYPESCRIPT · MIT</span>
          </div>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="bento-title">Two ways to<br/><em>break the grid.</em></h1>
              <p>Two independent interactive bento kits. One expressive editorial interface, one responsive material experiment. Real controls, editable React source, and no subscription.</p>
              <div className={styles.heroActions}>
                <CheckoutLink label="Get Bento Duo — €39" />
                <a className={styles.jump} href="#kits">See both kits <span aria-hidden="true">↓</span></a>
              </div>
              <p className={styles.licenseNote}>One-time purchase of v{BENTO_DUO.version} · MIT code · Third-party notices included</p>
            </div>
            <div className={styles.pricePanel} aria-label="Product details">
              <div className={styles.panelTop}><span>THE COLLECTION / 001</span><span>2 KITS</span></div>
              <strong className={styles.price}>€39<span>EUR</span></strong>
              <p>Two complete compositions, not a subscription or a promise of future releases.</p>
              <div className={styles.panelDivider}/>
              <dl className={styles.spec}>
                <div><dt>Framework</dt><dd>React 19 / TypeScript</dd></div>
                <div><dt>Styles</dt><dd>Scoped CSS Modules</dd></div>
                <div><dt>Included</dt><dd>Source, 2 packages, Next/Vite examples, docs</dd></div>
                <div><dt>Delivery</dt><dd>Digital ZIP via Gumroad</dd></div>
                <div><dt>Rights</dt><dd>MIT — non-exclusive</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section id="kits" className={styles.kits} aria-labelledby="kits-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>01 / THE TWO KITS</span><h2 id="kits-title">Different character.<br/><em>Equal attention.</em></h2></div>
            <p>The screenshots below are from the working kits at desktop and mobile widths. They are still previews, not simulated live animations. The actual interactions are in the source download.</p>
          </div>
          {BENTO_DUO.kits.map((kit, index) => (
            <article id={kit.slug} className={styles.kit} key={kit.slug} aria-labelledby={kit.slug + "-title"}>
              <div className={styles.kitHead}>
                <span>{kit.label}</span>
                <span>0{index + 1} / 02</span>
              </div>
              <div className={styles.kitIntro}>
                <h3 id={kit.slug + "-title"}>{kit.name}</h3>
                <div><p>{kit.description}</p><p className={styles.kitDetail}>{kit.detail}</p></div>
              </div>
              <div className={styles.previews}>
                <figure className={styles.desktopFrame}>
                  <div className={styles.frameBar}><span>DESKTOP / 1440 PX</span><span>APPROVED CAPTURE</span></div>
                  <a href={kit.desktop.src} target="_blank" rel="noopener noreferrer" aria-label={"Open full desktop preview of " + kit.name}>
                    <Image
                      src={kit.desktop.src}
                      alt={kit.name + " desktop screenshot of the approved interactive bento layout"}
                      width={kit.desktop.width}
                      height={kit.desktop.height}
                      unoptimized
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </a>
                </figure>
                <figure className={styles.mobileFrame}>
                  <div className={styles.frameBar}><span>MOBILE / 390 PX</span><span>APPROVED CAPTURE</span></div>
                  <a href={kit.mobile.src} target="_blank" rel="noopener noreferrer" aria-label={"Open full mobile preview of " + kit.name}>
                    <Image
                      src={kit.mobile.src}
                      alt={kit.name + " mobile screenshot of the approved responsive bento layout"}
                      width={kit.mobile.width}
                      height={kit.mobile.height}
                      unoptimized
                      loading="lazy"
                    />
                  </a>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.included} aria-labelledby="included-title">
        <div className={styles.shell}>
          <div className={styles.sectionHead}>
            <div><span className={styles.eyebrow}>02 / INSIDE THE ZIP</span><h2 id="included-title">Built to leave<br/><em>this website.</em></h2></div>
            <p>Each kit can be integrated independently. The package provides typed React components and install instructions, without a Nullworx account, hosted API, or proprietary activation.</p>
          </div>
          <div className={styles.includedGrid}>
            <div><strong>01</strong><h3>Editable source</h3><p>React 19, TypeScript, scoped CSS Modules, typed APIs and original compositions.</p></div>
            <div><strong>02</strong><h3>Separate packages</h3><p>Orbit and Foil ship independently, alongside a combined collection and example integrations.</p></div>
            <div><strong>03</strong><h3>Integration fixtures</h3><p>Next.js and Vite examples, installation notes, package manifests and required license notices.</p></div>
          </div>
          <div className={styles.terms}>
            <p><strong>Rights:</strong> Source is MIT-licensed, copyright © 2026 CipherCuttle. You may use, modify and redistribute it under the included MIT terms; keep the notices. Fonts retain their own included licenses. This is not an exclusive or proprietary source license.</p>
            <p><strong>Purchasing:</strong> €39 once for the delivered v{BENTO_DUO.version}. No subscription or guaranteed future updates, bespoke integration, or individual support. Mandatory consumer rights remain unaffected. Checkout and download are handled by Gumroad.</p>
            <Link href="/effects">Prefer free effects? Explore UI Forge Free →</Link>
          </div>
        </div>
      </section>

      <section className={styles.final} aria-labelledby="final-title">
        <div className={styles.shell}>
          <div className={styles.finalInner}>
            <div><span className={styles.eyebrow}>READY WHEN YOU ARE</span><h2 id="final-title">Make the grid<br/><em>your own.</em></h2></div>
            <div className={styles.finalAction}><CheckoutLink label="Get both kits — €39" compact/><p>One-time purchase · Digital download via Gumroad</p></div>
          </div>
        </div>
      </section>
    </main>
  );
}
