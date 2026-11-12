"use client";

import Link from "next/link";
import styles from "./site-header.module.css";
import { useDropsAvailability } from "@/components/distribution/drops-availability";

export function SiteHeader() {
  const dropsAvailable = useDropsAvailability();
  return <header className={styles.header}>
    <div className={`container ${styles.inner}`}>
      <Link className={styles.brand} href="/" prefetch={false} aria-label="nullworx.space home">
        <span className={styles.word}>nullworx<span>.space</span></span>
        <span className={styles.brandMeta}>UI FORGE<br/>BY BIKESHED STUDIOS</span>
      </Link>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/effects" className={styles.navLink}>Effects</Link>
        <Link href="/kits/bento-duo" className={styles.navLink}>Bento Duo</Link>
        <Link href="/#how" className={styles.navLink}>How it works</Link>
        <Link href="/effects/magnetic-focus" className={styles.navLink}>Playground</Link>
        {dropsAvailable && <Link href="/drops" className={styles.navLink}>Drops</Link>}
      </nav>
      <div className={styles.actions}>
        <span className={styles.status}>UI FORGE / VOL. 01</span>
        <Link href="/effects/magnetic-focus" className={`button button--small ${styles.headerCta}`}>Try effects ↗</Link>
        <details className={styles.mobile}>
          <summary aria-label="Open navigation">Menu <span className={styles.mobileIcon} aria-hidden="true"><i/><i/></span></summary>
          <nav className={styles.mobilePanel} aria-label="Mobile navigation" onClick={event => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
            <Link href="/effects">Effects</Link><Link href="/kits/bento-duo">Bento Duo — €39</Link><Link href="/#how">How it works</Link><Link href="/effects/magnetic-focus">Live playground</Link><Link href="/effects#install">Installation</Link>{dropsAvailable && <Link href="/drops">Get free Drops</Link>}
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
