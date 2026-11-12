import Link from "next/link";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/discovery/metadata";
import styles from "@/app/white-home.module.css";
import { isDropsConfigured } from "@/lib/distribution/config";
export const metadata: Metadata = createPageMetadata({
  title: "Privacy and local media — Nullworx",
  description:
    "Nullworx handles local media in your browser. Optional newsletter signups are handled by Brevo when enabled; support and product checkouts are external.",
  path: "/privacy",
  noIndex: true,
});
export default function Privacy(){const dropsAvailable = isDropsConfigured();return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}><p className="eyebrow">UI FORGE / PRIVACY</p><h1 className={styles.title}>Your files.<br/><em>Your browser.</em></h1><section className={styles.install}><p>Local video selectors create a temporary browser URL. The file is decoded in your browser and is never uploaded to this application. Closing or replacing the preview releases that URL.</p><p>Digital Wake stores settings and saved presets in this browser’s local storage. Exported presets contain settings, not your video. Clear site data to remove saved settings.</p><p>This application has no accounts, built-in checkout or marketing analytics endpoint. Contributions are handled on Buy Me a Coffee; any published product checkout is handled on Gumroad. Those sites have their own privacy policies. Hosting infrastructure may record request logs.</p>{dropsAvailable ? <p>Nullworx Drops uses Brevo to process your email address for occasional creative-coding updates. The signup triggers a confirmation email; you are added to the list only after confirming. Every newsletter includes an unsubscribe link. For data access or deletion requests, use the contact link below. The signup integration requests anonymised open/click tracking.</p> : <p>Newsletter collection is not active. No email address is collected by Nullworx until the subscription service is configured.</p>}<Link href="https://github.com/BikeshedStudios/nullworx">Source and contact ↗</Link></section></div></main>;}
