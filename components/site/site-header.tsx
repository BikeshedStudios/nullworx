"use client";

import Link from "next/link";
import styles from "./site-header.module.css";

export function SiteHeader() {
  return <header className={styles.header}>
    <div className={`container ${styles.inner}`}>
      <Link className={styles.brand} href="/" prefetch={false} aria-label="UI Forge home">
        <span className={styles.word} style={{fontWeight:750,letterSpacing:"-.075em"}}>UI FORGE<span style={{color:"var(--purple)"}}>.</span></span>
        <span className={styles.brandMeta}>ORIGINAL EFFECTS<br/>REACT + TYPESCRIPT</span>
      </Link>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/effects" className={styles.navLink}>Effects</Link>
        <Link href="/#how" className={styles.navLink}>How it works</Link>
        <Link href="/lab/forge-factory-01" className={styles.navLink}>Playground</Link>
      </nav>
      <div className={styles.actions}>
        <span className={styles.status}>EXPERIMENTAL</span>
        <Link href="/lab/forge-factory-01" className={`button button--small ${styles.headerCta}`}>Try effects ↗</Link>
        <details className={styles.mobile}>
          <summary aria-label="Open navigation">Menu <span className={styles.mobileIcon} aria-hidden="true"><i/><i/></span></summary>
          <nav className={styles.mobilePanel} aria-label="Mobile navigation" onClick={event => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
            <Link href="/effects">Effects</Link><Link href="/#how">How it works</Link><Link href="/lab/forge-factory-01">Live playground</Link><Link href="/effects#install">Installation</Link>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
