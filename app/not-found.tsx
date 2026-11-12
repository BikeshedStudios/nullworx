import type { Metadata } from "next";
import Link from "next/link";
import { notFoundMetadata } from "@/lib/discovery/metadata";
import styles from "./not-found.module.css";

export const metadata: Metadata = notFoundMetadata();

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className={`container ${styles.page}`}>
      <div className={styles.meta}>
        <p className="eyebrow">Error / 404</p>
        <span className="mono">Route dissolved</span>
      </div>
      <div className={styles.panel}>
        <span className={styles.code}>NO SIGNAL</span>
        <h1 className="display">
          This page was never <em>here.</em>
        </h1>
        <p>
          The URL may be mistyped or the page may have moved. Explore the collection to find a
          working playground and its source.
        </p>
        <div className={styles.actions}>
          <Link className="button" href="/">
            Return to Nullworx <span className="arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="text-link" href="/effects">Explore effects <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </main>
  );
}
