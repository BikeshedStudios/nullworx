"use client";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  clampLight,
  foilContent,
  type FoilContent,
  type FoilMaterial,
  type FoilState,
} from "./content";
import s from "./foil.module.css";
export * from "./content";
export type FoilCardId = "specimen" | "control" | "library" | "light" | "notes";
export interface FoilReactorProps {
  content?: FoilContent;
  initialMaterial?: FoilMaterial;
  initialState?: FoilState;
  initialLight?: { x: number; y: number };
  spans?: Partial<
    Record<FoilCardId, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >;
  onChange?: (state: {
    material: FoilMaterial;
    phase: FoilState;
    light: { x: number; y: number };
  }) => void;
  className?: string;
  /** Host tokens. Design DNA uses these to apply validated host variables. */
  style?: CSSProperties;
}
export function FoilPanel({
  children,
  label,
  className = "",
  span,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  span?: number;
}) {
  return (
    <section
      aria-label={label}
      data-foil-panel
      className={`${s.panel} ${className}`}
      style={span ? ({ "--span": span } as CSSProperties) : undefined}
    >
      {children}
    </section>
  );
}
export function FoilSurface({
  material = "spectral",
  phase = "folded",
}: {
  material?: FoilMaterial;
  phase?: FoilState;
}) {
  return (
    <div
      className={s.surface}
      data-material={material}
      data-phase={phase}
      aria-hidden="true"
    >
      <div className={s.shadow} />
      <div className={s.sculpture}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i
            className={s.ribbon}
            key={i}
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </div>
      <div className={s.ruler} />
      <span className={s.cross}>+</span>
      <span className={s.cross2}>+</span>
    </div>
  );
}
export function FoilReactor({
  content = foilContent,
  initialMaterial = "spectral",
  initialState = "folded",
  initialLight = { x: 35, y: 30 },
  spans,
  onChange,
  className = "",
  style,
}: FoilReactorProps) {
  const [material, setMaterial] = useState<FoilMaterial>(initialMaterial);
  const [phase, setPhase] = useState<FoilState>(initialState);
  const [light, setLight] = useState({
    x: clampLight(initialLight.x),
    y: clampLight(initialLight.y),
  });
  const [locked, setLocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected =
    content.materials.find((m) => m.id === material) ?? content.materials[0];
  if (!selected) return <div className={s.root}>Add a material to begin.</div>;
  function update(
    next: Partial<{
      material: FoilMaterial;
      phase: FoilState;
      light: { x: number; y: number };
    }>,
  ) {
    const value = { material, phase, light, ...next };
    setMaterial(value.material);
    setPhase(value.phase);
    setLight(value.light);
    setSaved(false);
    onChange?.(value);
  }
  function point(clientX: number, clientY: number) {
    if (locked || document.hidden) return;
    const bounds = root.current?.getBoundingClientRect();
    if (bounds)
      update({
        light: {
          x: clampLight(((clientX - bounds.left) / bounds.width) * 100),
          y: clampLight(((clientY - bounds.top) / bounds.height) * 100),
        },
      });
  }
  return (
    <div
      ref={root}
      className={`${s.root} ${className}`}
      data-material={selected.id}
      data-phase={phase}
      data-locked={locked}
      style={
        {
          ...style,
          "--lx": `${light.x}%`,
          "--ly": `${light.y}%`,
          "--tilt": `${(light.x - 50) * 0.12}deg`,
          "--lift": `${(light.y - 50) * 0.1}px`,
        } as CSSProperties
      }
      onPointerMove={(e) => {
        if (e.pointerType !== "touch") point(e.clientX, e.clientY);
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") point(e.clientX, e.clientY);
      }}
      onFocusCapture={(e) => {
        if ((e.target as HTMLElement).matches("input")) return;
        const b = e.target.getBoundingClientRect();
        point(b.left + b.width / 2, b.top + b.height / 2);
      }}
    >
      <div className={s.grid}>
        <FoilPanel
          label="Material specimen"
          span={spans?.specimen}
          className={s.specimen}
        >
          <div className={s.topline}>
            <span>MATERIAL RESEARCH / {content.specimen}</span>
            <span className={s.edition}>EDITION 001 ↗</span>
          </div>
          <div className={s.specimenCopy}>
            <h2>
              {content.title.split("\n").map((t) => (
                <span key={t}>{t}</span>
              ))}
            </h2>
            <p>{content.subtitle}</p>
          </div>
          <FoilSurface material={selected.id} phase={phase} />
          <div className={s.specimenFoot}>
            <span>
              <i /> {selected.name.toUpperCase()}
            </span>
            <span>
              {phase === "folded" ? "UNDER TENSION" : "RELEASED FORM"}
            </span>
            <span>INTERACTIVE OBJECT / 01</span>
          </div>
        </FoilPanel>
        <FoilPanel
          label="Material state controls"
          span={spans?.control}
          className={s.control}
        >
          <div className={s.topline}>
            <span>01 / MATTER & STATE</span>
            <span>◈</span>
          </div>
          <h3>
            Change the
            <br />
            way it catches.
          </h3>
          <p>
            A virtual light. A responsive surface.
            <br />
            Move across the collection to explore.
          </p>
          <div className={s.phaseTabs} aria-label="Material state">
            {(["folded", "annealed"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={phase === v}
                onClick={() => update({ phase: v })}
              >
                {content.states[v].name}
                <span>{v === "folded" ? "↗" : "↙"}</span>
              </button>
            ))}
          </div>
          <div className={s.stateInfo}>
            <span>STATE / {phase === "folded" ? "01" : "02"}</span>
            <p>{content.states[phase].description}</p>
          </div>
          <div className={s.lightControls}>
            <label htmlFor={`${id}-x`}>
              Light / horizontal <output>{Math.round(light.x)}%</output>
            </label>
            <input
              id={`${id}-x`}
              type="range"
              min="0"
              max="100"
              value={light.x}
              disabled={locked}
              onChange={(e) =>
                update({ light: { ...light, x: Number(e.target.value) } })
              }
            />
            <label htmlFor={`${id}-y`}>
              Light / vertical <output>{Math.round(light.y)}%</output>
            </label>
            <input
              id={`${id}-y`}
              type="range"
              min="0"
              max="100"
              value={light.y}
              disabled={locked}
              onChange={(e) =>
                update({ light: { ...light, y: Number(e.target.value) } })
              }
            />
          </div>
          <button
            className={s.lock}
            aria-pressed={locked}
            onClick={() => setLocked(!locked)}
          >
            {locked ? "Unlock light" : "Hold this light"}
            <span aria-hidden="true">{locked ? "◈" : "⊹"}</span>
          </button>
        </FoilPanel>
        <FoilPanel
          label="Material library"
          span={spans?.library}
          className={s.library}
        >
          <div className={s.topline}>
            <span>02 / SURFACE INDEX</span>
            <span>3 SPECIMENS</span>
          </div>
          <h3>Different by nature.</h3>
          <div className={s.materials}>
            {content.materials.map((m) => (
              <button
                key={m.id}
                aria-pressed={m.id === selected.id}
                onClick={() => update({ material: m.id })}
              >
                <span className={`${s.swatch} ${s[m.id]}`} aria-hidden="true" />
                <span>
                  {m.name}
                  <small>{m.code}</small>
                </span>
                <span aria-hidden="true">
                  {m.id === selected.id ? "●" : "↗"}
                </span>
              </button>
            ))}
          </div>
        </FoilPanel>
        <FoilPanel
          label="Shared light field"
          span={spans?.light}
          className={s.light}
        >
          <div className={s.topline}>
            <span>03 / LIGHT FIELD</span>
            <span>{locked ? "HELD" : "RESPONSIVE"}</span>
          </div>
          <div className={s.field} aria-hidden="true">
            <div className={s.fieldLines} />
            <div className={s.reticle} />
            <span>+ Z</span>
          </div>
          <h3>
            One light.
            <br />
            Every surface.
          </h3>
          <p className={s.coordinates}>
            X {String(Math.round(light.x)).padStart(3, "0")} / Y{" "}
            {String(Math.round(light.y)).padStart(3, "0")}
          </p>
        </FoilPanel>
        <FoilPanel
          label="Material field notes"
          span={spans?.notes}
          className={s.notes}
        >
          <div className={s.topline}>
            <span>04 / FIELD NOTES</span>
            <span>↗</span>
          </div>
          <span className={s.noteMark} aria-hidden="true">
            {selected.code.split(" / ")[0]}
          </span>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <button
            className={s.save}
            onClick={() => setSaved(!saved)}
            aria-pressed={saved}
          >
            {saved ? "Study marked" : "Mark this study"}
            <span aria-hidden="true">{saved ? "✓" : "+"}</span>
          </button>
          <p className={s.status} role="status">
            {saved
              ? `${selected.name} · ${content.states[phase].name} · saved in this session`
              : "A local material study. Yours to explore."}
          </p>
        </FoilPanel>
      </div>
    </div>
  );
}
