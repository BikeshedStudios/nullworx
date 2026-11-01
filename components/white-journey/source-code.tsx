"use client";
import { useState } from "react";
import styles from "./source-code.module.css";

export function SourceCode({ sources, usage, directory = "components/forge-factory-01" }: { sources: Record<string, string>; usage: string; directory?: string }) {
  const names = ["Usage", ...Object.keys(sources)];
  const [selected, setSelected] = useState("Usage");
  const [feedback, setFeedback] = useState("");
  const code = selected === "Usage" ? usage : sources[selected];
  async function copy() {
    try { await navigator.clipboard.writeText(code); setFeedback("Copied to clipboard"); }
    catch { setFeedback("Select the code below and copy it manually. Clipboard access is unavailable."); }
  }
  return <section className={styles.code} id="install" aria-labelledby="source-title">
    <div className={styles.heading}><div><p>03 / CODE &amp; INSTALLATION</p><h2 id="source-title">Take it from here.</h2></div><span>REACT + CSS MODULES</span></div>
    <p className={styles.instructions}>Copy each source file into <code>{directory}/</code>. Keep the filenames and their relative imports together. Then use the example below. Use the runtime and file types listed on this effect’s usage notes. The example uses the common @/ import alias; use a relative import if your project has no alias.</p>
    <div className={styles.tabs} role="tablist" aria-label="Component source files">{names.map((name, index) => <button type="button" role="tab" key={name} id={`code-tab-${index}`} aria-controls="source-panel" aria-selected={selected === name} onClick={() => { setSelected(name); setFeedback(""); }}>{name}</button>)}</div>
    <div className={styles.toolbar}><span>{selected === "Usage" ? "In your React component" : `${directory}/${selected}`}</span><button type="button" onClick={copy}>Copy {selected === "Usage" ? "example" : "file"} ↗</button></div>
    <pre id="source-panel" role="tabpanel" aria-labelledby={`code-tab-${names.indexOf(selected)}`} tabIndex={0}><code>{code}</code></pre>
    <p className={styles.feedback} role="status">{feedback || "The source above powers this preview. Local review build; no published package required."}</p>
  </section>;
}
