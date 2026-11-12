"use client";

import Link from "next/link";
import styles from "./site-footer.module.css";
import { gumroadProductUrl, supportUrl } from "@/lib/site";
import { useDropsAvailability } from "@/components/distribution/drops-availability";

export function SiteFooter() {
  const dropsAvailable = useDropsAvailability();
  return <footer className={styles.footer}>
    <div className={`container ${styles.top}`}>
      <div className={styles.statement}>
        <p className="eyebrow">NULLWORX.SPACE / UI FORGE</p>
        <p className={`display ${styles.headline}`}>Good effects.<br/><em>Real components.</em></p>
        <Link className="text-link" href="/effects/magnetic-focus">Explore the live playground →</Link>
        {supportUrl && <a className="text-link" href={supportUrl} target="_blank" rel="noopener noreferrer">Support the experiments ↗</a>}
      </div>
      <div className={styles.directory}>
        <div><p className={styles.label}>Navigate</p><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/effects">Effects</Link><Link href="/kits/bento-duo">Bento Duo — €39</Link><Link href="/#how">How it works</Link><Link href="/effects/magnetic-focus">Playground</Link>{dropsAvailable && <Link href="/drops">Nullworx Drops</Link>}{gumroadProductUrl && <a href={gumroadProductUrl} target="_blank" rel="noopener noreferrer">Creator Pack</a>}</nav></div>
        <div><p className={styles.label}>Information</p><nav aria-label="Legal links"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/licenses">Licences</Link></nav></div>
      </div>
    </div>
    <div className={`container ${styles.bottom}`}><span>© 2026 Bikeshed Studios · nullworx.space</span><span>UI Forge — React effects to make your own.</span></div>
  </footer>;
}
