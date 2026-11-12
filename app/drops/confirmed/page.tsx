import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/discovery/metadata";
import styles from "@/app/white-home.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Nullworx Drops — Confirmation",
  description: "Newsletter signup confirmation destination.",
  path: "/drops/confirmed",
  noIndex: true,
});

export default function DropsConfirmedPage() {
  return <main id="main" tabIndex={-1} className={styles.page}>
    <section className={[styles.wrap, styles.hero].join(" ")}>
      <p className="eyebrow">NULLWORX / DROPS</p>
      <h1 className={styles.title}>Back to<br/><em>making things.</em></h1>
      <p className={styles.lede}>If you just confirmed your email through the Brevo confirmation link, you are subscribed. You can unsubscribe using any future newsletter.</p>
      <Link className={styles.secondary} href="/effects">Explore free effects →</Link>
    </section>
  </main>;
}
