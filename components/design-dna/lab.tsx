"use client";

import { useState } from "react";
import Link from "next/link";
import { SignatureHero } from "@/components/signature-hero/signature-hero";
import { OrbitBento } from "@/components/bento-duo/orbit";
import { FoilReactor } from "@/components/bento-duo/foil";
import { foilReactorProps, orbitBentoProps, recipePreviewStyle, signatureHeroProps } from "@/lib/design-dna/adapters";
import {
  parseDesignRecipeJson,
  stringifyDesignRecipe,
  type DesignIssue,
  type DesignRecipe,
  type FoilRecipe,
  type OrbitRecipe,
  type SignatureRecipe,
} from "@/lib/design-dna/schema";
import { COMPONENT_IDS, componentContract, type ComponentId } from "@/lib/design-dna/registry";
import { installInstructions, integrationSnippet } from "@/lib/design-dna/snippets";
import signatureExample from "@/fixtures/design-dna/valid/signature-cobalt.json";
import orbitExample from "@/fixtures/design-dna/valid/orbit-iris.json";
import foilExample from "@/fixtures/design-dna/valid/foil-spectral.json";
import styles from "./lab.module.css";

const EXAMPLES: Record<ComponentId, unknown> = {
  "signature-hero": signatureExample,
  "orbit-bento": orbitExample,
  "foil-reactor": foilExample,
};

function initialText(id: ComponentId): string {
  return `${JSON.stringify(EXAMPLES[id], null, 2)}\n`;
}

function initialRecipe(id: ComponentId): DesignRecipe {
  const parsed = parseDesignRecipeJson(initialText(id));
  if (!parsed.ok) throw new Error(`Built-in ${id} example is invalid: ${parsed.issues[0]?.message}`);
  return parsed.recipe;
}

function Preview({ recipe }: { recipe: DesignRecipe }) {
  if (recipe.component.id === "signature-hero") return <SignatureHero {...signatureHeroProps(recipe as SignatureRecipe)} />;
  if (recipe.component.id === "orbit-bento") return <OrbitBento {...orbitBentoProps(recipe as OrbitRecipe)} />;
  return <FoilReactor {...foilReactorProps(recipe as FoilRecipe)} />;
}

export function DesignDnaLab() {
  const [componentId, setComponentId] = useState<ComponentId>("signature-hero");
  const [text, setText] = useState(() => initialText("signature-hero"));
  const [validated, setValidated] = useState<DesignRecipe>(() => initialRecipe("signature-hero"));
  const [issues, setIssues] = useState<DesignIssue[]>([]);
  const [status, setStatus] = useState("Validated. The live component below is the current recipe.");
  const [feedback, setFeedback] = useState("");

  const canonical = stringifyDesignRecipe(validated);
  const snippet = integrationSnippet(validated);
  const install = installInstructions(validated);

  function choose(id: ComponentId) {
    setComponentId(id);
    setText(initialText(id));
    setValidated(initialRecipe(id));
    setIssues([]);
    setStatus(`Loaded the approved ${componentContract(id).label} example.`);
    setFeedback("");
  }

  function validate() {
    const result = parseDesignRecipeJson(text);
    if (result.ok) {
      setValidated(result.recipe);
      setIssues([]);
      setStatus(`Valid ${componentContract(result.recipe.component.id).label} recipe. Preview updated.`);
      setFeedback("");
      return;
    }
    setIssues(result.issues);
    setStatus(`Rejected with ${result.issues.length} issue${result.issues.length === 1 ? "" : "s"}. The last valid preview is retained.`);
  }

  function format() {
    setText(stringifyDesignRecipe(validated));
    setIssues([]);
    setStatus("Canonical, key-sorted JSON written back to the editor.");
  }

  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(message);
    } catch {
      setFeedback("Clipboard access is unavailable. Select the text and copy it manually.");
    }
  }

  function download() {
    const blob = new Blob([canonical], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${validated.id}-${validated.version}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setFeedback(`Downloaded ${validated.id}-${validated.version}.json`);
  }

  const contract = componentContract(validated.component.id);

  return <main id="main" tabIndex={-1} className={styles.page}>
    <header className={styles.header}>
      <div className={styles.breadcrumb}><Link href="/effects">UI FORGE</Link><span>/</span><span>AGENT DESIGN DNA</span><b>SCHEMA 1.0.0</b></div>
      <div className={styles.intro}>
        <h1>Design identity,<br/><em>as validated data.</em></h1>
        <div><p>An agent can change the palette, type, copy, motion and bounded layout of a real Nullworx component. It cannot smuggle in JSX, CSS, imports, package names or arbitrary code. Invalid recipes are rejected before the preview updates.</p><p className={styles.note}>Ten accepted fixtures and twelve rejected patches are permanent tests. The live preview below renders the real component with the validated tokens.</p></div>
      </div>
    </header>

    <nav className={styles.components} aria-label="Design DNA component">
      {COMPONENT_IDS.map((id, index) => {
        const item = componentContract(id);
        return <button type="button" key={id} aria-pressed={componentId === id} onClick={() => choose(id)}>
          <span>0{index + 1} / {item.family.toUpperCase()}</span>
          <strong>{item.label}</strong>
          <small>v{item.version} · {item.dependencies.length} runtime deps</small>
        </button>;
      })}
    </nav>

    <div className={styles.workspace}>
      <section className={styles.editor} aria-labelledby="recipe-editor-title">
        <div className={styles.editorHead}><div><span>01 / RECIPE</span><h2 id="recipe-editor-title">Import / edit / validate</h2></div><span className={styles.mono}>{validated.id}@{validated.version}</span></div>
        <label className={styles.srLabel} htmlFor="recipe-json">Design DNA recipe JSON</label>
        <textarea id="recipe-json" value={text} spellCheck={false} onChange={event => setText(event.target.value)} aria-describedby="recipe-help" />
        <p id="recipe-help" className={styles.help}>Only the versioned schema is accepted. Unknown keys, components, versions, tokens and unsafe values fail closed. The last valid recipe remains mounted.</p>
        <div className={styles.actions}>
          <button type="button" onClick={validate}>Validate + apply</button>
          <button type="button" onClick={format}>Format canonical</button>
          <button type="button" onClick={() => choose(componentId)}>Reset example</button>
          <button type="button" onClick={() => copy(canonical, "Canonical recipe copied.")}>Copy recipe</button>
          <button type="button" onClick={download}>Download JSON</button>
        </div>
        <p className={styles.status} role="status" data-state={issues.length > 0 ? "rejected" : "valid"}>{status}</p>
        {issues.length > 0 && <ul className={styles.issues} aria-label="Validation issues">{issues.map((issue, index) => <li key={`${issue.path}-${index}`}><code>{issue.path}</code><span>{issue.message}</span></li>)}</ul>}
        <div className={styles.contract}>
          <div><span>COMPONENT</span><strong>{contract.label}</strong></div>
          <div><span>VERSION</span><strong>{contract.version}</strong></div>
          <div><span>FAMILY</span><strong>{contract.family}</strong></div>
          <div><span>ROUTE</span><strong>{contract.route}</strong></div>
        </div>
      </section>

      <section className={styles.preview} aria-labelledby="dna-preview-title">
        <div className={styles.previewHead}><div><span>02 / LIVE PREVIEW</span><h2 id="dna-preview-title">The real component</h2></div><span className={styles.live}><i aria-hidden="true" /> VALIDATED</span></div>
        <div className={styles.stage} data-dna-preview={validated.component.id} style={recipePreviewStyle(validated)}>
          <Preview recipe={validated} />
        </div>
        <p className={styles.help}>This is the component itself, not a generated screenshot. Changing a palette or content token updates the real DOM and material.</p>
      </section>
    </div>

    <section className={styles.output} aria-labelledby="dna-output-title">
      <div className={styles.outputHead}><div><span>03 / HANDOFF</span><h2 id="dna-output-title">Take the validated state with you.</h2></div><span className={styles.mono}>{validated.component.id} / 1.0.0</span></div>
      <div className={styles.outputGrid}>
        <div><div className={styles.codeHead}><span>Runnable integration</span><button type="button" onClick={() => copy(snippet, "Integration snippet copied.")}>Copy TSX ↗</button></div><pre tabIndex={0}><code>{snippet}</code></pre></div>
        <div><div className={styles.codeHead}><span>Install contract</span><button type="button" onClick={() => copy(install, "Install contract copied.")}>Copy install</button></div><pre tabIndex={0}><code>{install}</code></pre></div>
      </div>
      <p className={styles.feedback} role="status">{feedback || "No code is executed from the recipe. The snippet is generated from typed tokens."}</p>
    </section>

    <footer className={styles.footer}><span>AGENT DESIGN DNA / INTERNAL LAB / NOINDEX</span><div><Link href="/kits/signature-hero">Signature Hero ↗</Link><Link href="/kits/bento-duo">Bento Duo ↗</Link><Link href="/effects">Free effects ↗</Link></div></footer>
  </main>;
}
