import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/discovery/metadata";
import { isDropsConfigured } from "@/lib/distribution/config";
import { DropsForm } from "@/components/distribution/drops-form";
import styles from "@/app/white-home.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Nullworx Drops — Free effects and creative coding",
  description: "Occasional free React effects, presets, integration examples and creative coding experiments.",
  path: "/drops",
  noIndex: true,
});

export default function DropsPage() {
  const enabled = isDropsConfigured();
  return <main id="main" tabIndex={-1} className={styles.page}>
    <section className={[styles.wrap, styles.hero].join(" ")}>
      <p className="eyebrow">NULLWORX / DROPS</p>
      <h1 className={styles.title}>Interesting things.<br/><em>Occasionally.</em></h1>
      <p className={styles.lede}>New free effects, source code, presets and creative experiments. Sent only when there is something worth sharing.</p>
      <section className={styles.install} aria-label="Newsletter">
        <h2>Get Nullworx Drops</h2>
        {enabled ? <DropsForm /> : <p>Signups are not active yet. No email addresses are being collected. You can still explore the <Link href="/effects">free effects</Link> and follow the <a href="https://github.com/BikeshedStudios/nullworx">source on GitHub</a>.</p>}
      </section>
    </section>
  </main>;
}
