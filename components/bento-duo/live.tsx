"use client";

import { useState } from "react";
import Link from "next/link";
import { OrbitBento } from "./orbit";
import { FoilReactor } from "./foil";
import { BENTO_DUO } from "@/lib/bento-duo";
import styles from "./live.module.css";

export function OrbitLive() {
  const [status, setStatus] = useState("Select a project or complete a checklist item.");
  return <div className={styles.live} data-live-kit="orbit">
    <OrbitBento onProjectChange={id => setStatus(`${id} selected. The brief and checklist updated in place.`)} />
    <p className={styles.receipt} role="status" data-live-receipt><span aria-hidden="true">●</span> LIVE / {status}</p>
  </div>;
}

export function FoilLive() {
  const [status, setStatus] = useState("Move the pointer, tap a surface, or use the native controls.");
  return <div className={styles.live} data-live-kit="foil">
    <FoilReactor onChange={({ material, phase }) => setStatus(`${material} / ${phase}. One shared light updated every surface.`)} />
    <p className={styles.receipt} role="status" data-live-receipt><span aria-hidden="true">●</span> LIVE / {status}</p>
  </div>;
}

export function BentoDuoTeaser() {
  return <div className={styles.teaserGrid}>
    {BENTO_DUO.kits.map((kit, index) => <article className={styles.teaserCard} key={kit.slug}>
      <div className={styles.teaserHead}><span>{kit.label}</span><span>LIVE / SCROLL INSIDE</span></div>
      <div className={styles.teaserViewport} data-teaser={kit.slug}>
        {index === 0 ? <OrbitBento /> : <FoilReactor />}
      </div>
      <div className={styles.teaserFoot}>
        <div><h3>{kit.name}</h3><p>{kit.detail}</p></div>
        <Link href={`${BENTO_DUO.path}#${kit.slug}`}>Open the full kit <span aria-hidden="true">↗</span></Link>
      </div>
    </article>)}
  </div>;
}
