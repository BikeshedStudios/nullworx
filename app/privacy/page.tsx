import Link from "next/link";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/discovery/metadata";
import styles from "@/app/white-home.module.css";
export const metadata: Metadata = createPageMetadata({
  title: "Privacy and local media — Nullworx",
  description:
    "Nullworx keeps selected video files in your browser, stores Digital Wake presets locally, and runs no accounts, newsletter collection, checkout or analytics endpoint.",
  path: "/privacy",
  noIndex: true,
});
export default function Privacy(){return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}><p className="eyebrow">UI FORGE / PRIVACY</p><h1 className={styles.title}>Your files.<br/><em>Your browser.</em></h1><section className={styles.install}><p>Local video selectors create a temporary browser URL. The file is decoded in your browser and is never uploaded to this application. Closing or replacing the preview releases that URL.</p><p>Digital Wake stores settings and saved presets in this browser’s local storage. Exported presets contain settings, not your video. Clear site data to remove saved settings.</p><p>This application has no accounts, newsletter collection, checkout or analytics endpoint. Hosted media and site requests may be logged by the hosting provider when a deployment is authorized. No deployment is part of this release.</p><Link href="https://github.com/BikeshedStudios/nullworx">Source and contact ↗</Link></section></div></main>;}
