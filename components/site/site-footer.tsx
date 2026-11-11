import Link from "next/link";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return <footer className={styles.footer}>
    <div className={`container ${styles.top}`}>
      <div className={styles.statement}>
        <p className="eyebrow">NULLWORX.SPACE / UI FORGE</p>
        <p className={`display ${styles.headline}`}>Good effects.<br/><em>Real components.</em></p>
        <Link className="text-link" href="/effects/magnetic-focus">Explore the live playground →</Link>
      </div>
      <div className={styles.directory}>
        <div><p className={styles.label}>Navigate</p><nav aria-label="Footer navigation"><Link href="/">Home</Link><Link href="/effects">Effects</Link><Link href="/#how">How it works</Link><Link href="/effects/magnetic-focus">Playground</Link></nav></div>
        <div><p className={styles.label}>Information</p><nav aria-label="Legal links"><Link href="/about">About</Link><Link href="/privacy">Privacy</Link><Link href="/licenses">Licences</Link></nav></div>
      </div>
    </div>
    <div className={`container ${styles.bottom}`}><span>© 2026 Bikeshed Studios · nullworx.space</span><span>UI Forge — React effects to make your own.</span></div>
  </footer>;
}
