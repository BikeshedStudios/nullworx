"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SignatureHero } from "./signature-hero";
import type { SignaturePreset } from "./signature-presets";
import {
  SIGNATURE_INSTALL,
  SIGNATURE_PRESET_IDS,
  parseSignatureQuery,
  signatureCode,
  signatureConfigJson,
  signatureDefaults,
  signatureQuery,
  type SignatureConfig,
  type SignatureViewport,
} from "@/lib/signature-playground";
import styles from "./playground.module.css";

const TABS = ["preview", "customize", "code", "install", "share"] as const;
type Tab = (typeof TABS)[number];
const LABELS: Record<Tab, string> = {
  preview: "Preview",
  customize: "Customize",
  code: "Code",
  install: "Install",
  share: "Share",
};
const WEIGHTS = [200, 300, 400, 500, 600, 700, 800, 900] as const;

export function SignaturePlayground({ initial }: { initial: SignatureConfig }) {
  const [config, setConfig] = useState(initial);
  const [tab, setTab] = useState<Tab>("preview");
  const [viewport, setViewport] = useState<SignatureViewport>("desktop");
  const [paused, setPaused] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const query = signatureQuery(config);
    const next = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [config]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const query = signatureQuery(config);
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
  }, [config]);
  const code = useMemo(() => signatureCode(config), [config]);
  const json = useMemo(() => signatureConfigJson(config), [config]);

  function patch(next: Partial<SignatureConfig>) {
    setConfig(current => ({
      ...current,
      ...next,
      copy: { ...current.copy, ...(next.copy ?? {}) },
      colors: { ...current.colors, ...(next.colors ?? {}) },
      settings: { ...current.settings, ...(next.settings ?? {}) },
    }));
  }

  function choosePreset(preset: SignaturePreset) {
    setConfig(current => {
      const base = signatureDefaults(preset);
      return {
        ...base,
        copy: current.copy,
        settings: { ...base.settings, motion: current.settings.motion, pointer: current.settings.pointer },
      };
    });
    setFeedback("");
  }

  function reset() {
    setConfig(signatureDefaults(config.preset));
    setFeedback("Reset to the approved default for this direction.");
  }

  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(message);
    } catch {
      setFeedback("Clipboard access is unavailable. Select the text and copy it manually.");
    }
  }

  function moveTab(direction: number) {
    const index = TABS.indexOf(tab);
    const next = TABS[(index + direction + TABS.length) % TABS.length];
    setTab(next);
    document.getElementById(`signature-tab-${next}`)?.focus();
  }

  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.masthead}>
      <div className={styles.breadcrumb}><Link href="/effects">UI FORGE</Link><span>/</span><span>SIGNATURE HERO 01</span><b>LIVE / UNPUBLISHED</b></div>
      <div className={styles.intro}>
        <h1>Three directions.<br/><em>One living hero.</em></h1>
        <div>
          <p>A real React composition, not a screenshot. Move your pointer across the stage. Change the copy, palette, type and material; the same component updates in place.</p>
          <p className={styles.note}>Cobalt, Carbon and Porcelain are owner-approved directions. This preview is intentionally noindex until release rights and staging are settled.</p>
        </div>
      </div>
    </header>

    <nav className={styles.presets} aria-label="Signature Hero direction">
      {SIGNATURE_PRESET_IDS.map((preset, index) => <button type="button" key={preset} aria-pressed={config.preset === preset} onClick={() => choosePreset(preset)}>
        <span>0{index + 1}</span><strong>{preset}</strong><small>{preset === "cobalt" ? "ELECTRIC HOURS" : preset === "carbon" ? "AFTER HOURS" : "IN GOOD LIGHT"}</small>
      </button>)}
      <button type="button" className={styles.reset} onClick={reset}>Reset direction</button>
    </nav>

    <section className={styles.stage} aria-labelledby="stage-title">
      <div className={styles.stageBar}>
        <div><span className={styles.liveDot} aria-hidden="true" /><strong id="stage-title">LIVE COMPONENT</strong><span>REAL DOM / REAL MATERIAL</span></div>
        <div className={styles.stageActions}>
          <button type="button" aria-pressed={viewport === "desktop"} onClick={() => setViewport("desktop")}>Desktop</button>
          <button type="button" aria-pressed={viewport === "mobile"} onClick={() => setViewport("mobile")}>Mobile 390</button>
          <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Resume" : "Pause"}</button>
        </div>
      </div>
      <div className={styles.frameWrap} data-viewport={viewport}>
        <div className={styles.frame} data-viewport={viewport}>
          <SignatureHero
            preset={config.preset}
            copy={config.copy}
            colors={config.colors}
            settings={config.settings}
            paused={paused}
            links={{ home: "#signature-top", work: "#customize", contact: "#install" }}
          />
        </div>
      </div>
      <div className={styles.stageFoot}><span>Pointer light: {config.settings.pointer ? "active" : "off"} · {config.settings.motion === "static" ? "static frame" : "material running"}</span><span>Changes update this instance, never a copied image.</span></div>
    </section>

    <section className={styles.workbench} aria-label="Signature Hero playground">
      <div className={styles.tabs} role="tablist" aria-label="Playground sections" onKeyDown={event => {
        if (event.key === "ArrowRight") { event.preventDefault(); moveTab(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); moveTab(-1); }
      }}>
        {TABS.map(item => <button key={item} type="button" role="tab" id={`signature-tab-${item}`} aria-controls="signature-panel" aria-selected={tab === item} tabIndex={tab === item ? 0 : -1} onClick={() => { setTab(item); setFeedback(""); }}>{LABELS[item]}</button>)}
      </div>

      <div id="signature-panel" role="tabpanel" aria-labelledby={`signature-tab-${tab}`} className={styles.panel}>
        {tab === "preview" && <div className={styles.previewPanel}>
          <div><span className={styles.panelIndex}>01 / PREVIEW</span><h2>See it before you read the code.</h2><p>The stage above is the exported component with the selected direction. Try the mobile viewport, pause the material, or switch the customizer to static mode. The pointer light is a bounded material offset, never a fake cursor image.</p></div>
          <ul>
            <li><strong>Real type.</strong> The wordmark is selectable DOM text; the shader is decorative.</li>
            <li><strong>Real fallback.</strong> No WebGL, a lost context or reduced motion still leaves a readable hero.</li>
            <li><strong>Real lifecycle.</strong> The shader pauses when hidden or offscreen.</li>
          </ul>
        </div>}

        {tab === "customize" && <div className={styles.customize} id="customize">
          <div className={styles.controlGroup}>
            <span className={styles.panelIndex}>01 / COPY</span>
            <label>Brand<input value={config.copy.brand} maxLength={40} onChange={event => patch({ copy: { ...config.copy, brand: event.target.value } })}/></label>
            <label>Wordmark<input value={config.copy.wordmark} maxLength={12} spellCheck={false} onChange={event => {
              const value = event.target.value;
              if (value === "" || /^[A-Za-z0-9][A-Za-z0-9 .&'!?+\-/]{0,11}$/.test(value)) patch({ copy: { ...config.copy, wordmark: value } });
            }}/><small>2–12 characters. Latin letters, digits, space, . &amp; &apos; ! ? + - /</small></label>
            <label>Counterline<input value={config.copy.counterline} maxLength={60} onChange={event => patch({ copy: { ...config.copy, counterline: event.target.value } })}/></label>
            <label>Description<textarea value={config.copy.description} maxLength={220} rows={4} onChange={event => patch({ copy: { ...config.copy, description: event.target.value } })}/></label>
            <label>Primary action<input value={config.copy.primaryLabel} maxLength={40} onChange={event => patch({ copy: { ...config.copy, primaryLabel: event.target.value } })}/></label>
          </div>

          <div className={styles.controlGroup}>
            <span className={styles.panelIndex}>02 / MATERIAL &amp; TYPE</span>
            <div className={styles.colors}>
              {(["background", "ink", "accent", "muted", "line"] as const).map(key => <label key={key}>{key}<span><input type="color" value={config.colors[key]} aria-label={`${key} color`} onChange={event => patch({ colors: { ...config.colors, [key]: event.target.value } })}/><code>{config.colors[key]}</code></span></label>)}
            </div>
            <div className={styles.colors}>
              {config.colors.material.map((color, index) => <label key={index}>material {index + 1}<span><input type="color" value={color} aria-label={`material color ${index + 1}`} onChange={event => {
                const material = [...config.colors.material] as SignatureConfig["colors"]["material"];
                material[index] = event.target.value;
                patch({ colors: { ...config.colors, material } });
              }}/><code>{color}</code></span></label>)}
            </div>
            <label>Weight<select value={config.settings.weight} onChange={event => patch({ settings: { ...config.settings, weight: Number(event.target.value) } })}>{WEIGHTS.map(weight => <option key={weight} value={weight}>{weight}</option>)}</select></label>
            <label>Tracking <output>{config.settings.tracking.toFixed(3)}em</output><input type="range" min="-0.04" max="0.08" step="0.001" value={config.settings.tracking} onChange={event => patch({ settings: { ...config.settings, tracking: Number(event.target.value) } })}/></label>
            <label>Material speed <output>{config.settings.speed.toFixed(2)}</output><input type="range" min="0" max="0.6" step="0.01" value={config.settings.speed} onChange={event => patch({ settings: { ...config.settings, speed: Number(event.target.value) } })}/></label>
            <label>Motion<select value={config.settings.motion} onChange={event => patch({ settings: { ...config.settings, motion: event.target.value === "static" ? "static" : "auto" } })}><option value="auto">Auto / respects reduced motion</option><option value="static">Static / no shader canvas</option></select></label>
            <label className={styles.check}><input type="checkbox" checked={config.settings.pointer} onChange={event => patch({ settings: { ...config.settings, pointer: event.target.checked } })}/> Pointer light</label>
          </div>
        </div>}

        {tab === "code" && <div className={styles.codePanel}>
          <div className={styles.panelHead}><div><span className={styles.panelIndex}>03 / CODE</span><h2>A copy of the current setup.</h2></div><button type="button" onClick={() => copy(code, "TSX configuration copied.")}>Copy TSX ↗</button></div>
          <pre tabIndex={0}><code>{code}</code></pre>
          <div className={styles.subCode}><span>Deterministic configuration JSON</span><button type="button" onClick={() => copy(json, "Configuration JSON copied.")}>Copy JSON</button></div>
          <pre tabIndex={0}><code>{json}</code></pre>
        </div>}

        {tab === "install" && <div className={styles.installPanel} id="install">
          <div><span className={styles.panelIndex}>04 / INSTALL</span><h2>Keep the whole component together.</h2><p>Copy <code>components/signature-hero/</code> including <code>living-type/</code>, the bundled fonts and the license notices. The renderer is a single pinned dependency; React and Next come from your application. The hero adds no global reset.</p><p className={styles.note}>Source-rights status: this composition is an internal owner-review candidate. Do not redistribute it as a customer package until the owner assigns terms. The free UI Forge effect source remains MIT.</p></div>
          <pre tabIndex={0}><code>{SIGNATURE_INSTALL}</code></pre>
          <div className={styles.installMeta}><span>React 19.3.1</span><span>Next 16.4.3</span><span>@paper-design/shaders-react 0.0.82</span><span>No CDN fonts</span><span>No global CSS</span></div>
        </div>}

        {tab === "share" && <div className={styles.sharePanel}>
          <div><span className={styles.panelIndex}>05 / SHARE</span><h2>Send the exact state.</h2><p>The URL carries only bounded, validated fields. Invalid or unknown values fall back to the approved direction; they never select code or markup.</p></div>
          <label>Shareable URL<input readOnly value={shareUrl} onFocus={event => event.currentTarget.select()}/></label>
          <div className={styles.shareActions}><button type="button" onClick={() => copy(shareUrl, "Share URL copied.")}>Copy URL</button><button type="button" onClick={() => copy(json, "Configuration JSON copied.")}>Copy configuration</button><button type="button" onClick={() => copy(signatureQuery(config), "Query string copied.")}>Copy query</button></div>
          <p className={styles.note}>The recipient can open this URL in the local review candidate. It does not create a public route or publish the source.</p>
        </div>}
      </div>
      <p className={styles.feedback} role="status">{feedback || "Live instance. No image is used as the preview."}</p>
    </section>

    <footer className={styles.footer}><span>UI FORGE / SIGNATURE HERO 01 / INTERNAL REVIEW</span><div><Link href="/effects">Explore free effects ↗</Link><Link href="/kits/bento-duo">Bento Duo ↗</Link></div></footer>
  </main>;
}

export function parseInitialSignatureQuery(query: string) {
  return parseSignatureQuery(query).config;
}
