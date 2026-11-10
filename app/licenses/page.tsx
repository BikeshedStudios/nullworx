import Link from "next/link";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/discovery/metadata";
import styles from "@/app/white-home.module.css";
export const metadata: Metadata = createPageMetadata({
  title: "Licences and media rights — Nullworx",
  description:
    "Code and media terms for Nullworx: MIT application code, SIL OFL fonts, original imagegen WebP terms, and unresolved source-specific hosting rights for LOOP30.",
  path: "/licenses",
  noIndex: true,
});
export default function Licenses(){return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}><p className="eyebrow">UI FORGE / SOURCE &amp; MEDIA</p><h1 className={styles.title}>Clear terms.<br/><em>Separate media.</em></h1><section className={styles.install}><p>Owner-authored application code is published under the repository’s MIT licence. Dependency licences are recorded in THIRD_PARTY_NOTICES.md. Fonts are self-hosted under the SIL Open Font License.</p><p>The accepted 30-second LOOP30 video is preserved as the intended Digital Wake asset. The owner approved commercial use, but no source-specific commercial hosting or public repository redistribution licence has yet been verified. Those are separate permissions. Video, masks, source-color data and derivatives are provisioned locally and excluded from this code release.</p><p>Digital Wake remains Experimental/Beta. It uses manual caudal-fin sectors with measured motion and suppresses unsupported frames. It does not automatically locate anatomical fins in arbitrary footage.</p><Link href="https://github.com/BikeshedStudios/nullworx/blob/main/MEDIA_PROVISIONING.md">Media provisioning &amp; rights record ↗</Link></section></div></main>;}
