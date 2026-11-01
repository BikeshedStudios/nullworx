"use client";
import Link from "next/link";
export default function PageError({ reset }: { reset: () => void }) {
  return <main id="main" className="container section"><p className="eyebrow">UI FORGE / SOMETHING INTERRUPTED THE PREVIEW</p><h1 className="display" style={{fontSize:"clamp(42px, 7vw, 88px)",marginBlock:28}}>Let&apos;s give it<br /><em>another try.</em></h1><p style={{color:"var(--secondary)",marginBottom:24}}>This page could not finish loading. You can retry or return to the collection.</p><div style={{display:"flex",gap:24,flexWrap:"wrap"}}><button type="button" className="button" onClick={reset}>Try again ↻</button><Link href="/effects" className="text-link">Back to effects →</Link></div></main>;
}
