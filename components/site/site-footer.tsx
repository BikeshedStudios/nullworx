import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={`container ${styles.top}`}>
      <div className={styles.statement}>
        <p className="eyebrow">UI FORGE / VOL. 01</p>
        <p className={`display ${styles.headline}`}>Good effects.<br/><em>Real components.</em></p>
        <Link className="text-link" href="/lab/forge-factory-01">Explore the live playground →</Link>
      </div>
      <div className={styles.directory}>
        <div><p className={styles.label}>Navigate</p><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/effects">Effects</Link><Link href="/#how">How it works</Link><Link href="/lab/forge-factory-01">Playground</Link></nav></div>
        <div><p className={styles.label}>Information</p><nav aria-label="Legal links"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/licenses">Licences</Link></nav></div>
      </div>
    </div>
    <div className={`container ${styles.bottom}`}><span>© 2026 UI Forge / Nullworx research</span><span>Made for the web. Built to make your own.</span></div>
  </footer>;
}
