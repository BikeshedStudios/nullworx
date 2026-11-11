import Link from "next/link";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { HomeKoiField } from "./home-koi-field";
import { SourceCode } from "./source-code";
import styles from "@/app/white-home.module.css";
export async function AsciiStudy() {
  const names = ["renderer.ts", "glyphAtlas.ts"];
  const sources = Object.fromEntries(await Promise.all(names.map(async file => [file, await readFile(path.join(process.cwd(),"components/white-journey/original-ascii",file),"utf8")])));
  return <main id="main" tabIndex={-1} className={styles.page}><div className={`${styles.wrap} ${styles.hero}`}>
    <div className={styles.eyebrow}>UI FORGE / ASCII WAVES</div><h1 className={styles.title}>ASCII <em>Waves.</em></h1>
    <p>An original procedural character field, ready to play. Or choose your own local video to explore the original renderer, density and pointer controls.</p>
    <HomeKoiField />
    <section className={styles.install}><h2>Use the original renderer.</h2><p>Copy both TypeScript files together. Create a canvas and a local or CORS-enabled video element. Dispose the renderer when the component unmounts. The source video is provisioned separately; local files stay in your browser.</p><Link href="/effects">Explore UI Forge ↗</Link></section>
    <SourceCode directory="components/white-journey/original-ascii" sources={sources} usage={'import { AsciiWavesRenderer, DEFAULT_SETTINGS } from "./renderer";\n\nconst renderer = new AsciiWavesRenderer(canvas);\nrenderer.setSettings({ ...DEFAULT_SETTINGS, cellSize: 12 });\nrenderer.setVideo(video, true);\n// On unmount: renderer.dispose();'} />
  </div></main>;
}
